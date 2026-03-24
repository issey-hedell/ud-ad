import { DeployProvider } from './base.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { lookup } from 'mime-types';
import { execSync } from 'child_process';

export class AwsS3Provider extends DeployProvider {
  constructor(config, environment) {
    super(config, environment);
    this.s3Client = null;
    this.cloudFrontClient = null;
  }

  async validate() {
    this.log('Validating AWS S3 configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['bucket', 'region', 'access_key_id', 'secret_access_key'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required AWS S3 config: ${field}`);
      }
    }

    if (config.distribution_id) {
      this.log('CloudFront distribution ID found, will invalidate cache after deployment');
    }

    this.log('✅ Configuration validated');
    return true;
  }

  async deploy() {
    this.logEnvironmentInfo();
    await this.validate();

    const config = this.resolveEnvVars(this.providerConfig);

    // AWS SDKクライアント初期化
    const awsConfig = {
      region: config.region,
      credentials: {
        accessKeyId: config.access_key_id,
        secretAccessKey: config.secret_access_key
      }
    };

    this.s3Client = new S3Client(awsConfig);
    this.cloudFrontClient = new CloudFrontClient(awsConfig);

    // ビルドコマンド実行
    if (config.build_command) {
      this.log(`Running build command: ${config.build_command}`);
      execSync(config.build_command, { stdio: 'inherit' });
    }

    this.log('Deploying to AWS S3...');

    const bucket = config.bucket;
    const buildDir = config.output_directory || 'dist';

    // 環境別のプレフィックス（Preview環境の場合）
    const prefix = this.environment === 'preview'
      ? `preview-${Date.now()}/`
      : '';

    // ビルドディレクトリ内のすべてのファイルをアップロード
    await this.uploadDirectory(buildDir, bucket, prefix);

    // CloudFrontキャッシュをクリア
    if (config.distribution_id) {
      await this.invalidateCloudFrontCache(config.distribution_id);
    }

    // デプロイURLを生成
    if (config.cloudfront_domain) {
      this.deployUrl = `https://${config.cloudfront_domain}/${prefix}`;
    } else {
      this.deployUrl = `https://${bucket}.s3.${config.region}.amazonaws.com/${prefix}`;
    }

    this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

    return {
      success: true,
      url: this.deployUrl,
      message: 'AWS S3 deployment completed successfully'
    };
  }

  /**
   * ディレクトリを再帰的にS3にアップロード
   */
  async uploadDirectory(dir, bucket, prefix = '') {
    const files = this.getAllFiles(dir);

    this.log(`Uploading ${files.length} files to S3...`);

    for (const file of files) {
      const relativePath = relative(dir, file);
      const s3Key = prefix + relativePath.replace(/\\/g, '/');

      await this.uploadFile(file, bucket, s3Key);
    }

    this.log('✅ All files uploaded');
  }

  /**
   * ディレクトリ内のすべてのファイルを取得（再帰）
   */
  getAllFiles(dir) {
    const files = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.error(`Failed to read directory: ${dir}`, error);
    }

    return files;
  }

  /**
   * 単一ファイルをS3にアップロード
   */
  async uploadFile(filePath, bucket, key) {
    const fileContent = readFileSync(filePath);
    const contentType = lookup(filePath) || 'application/octet-stream';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: this.getCacheControl(filePath)
    });

    try {
      await this.s3Client.send(command);
      this.log(`  ✓ ${key}`);
    } catch (error) {
      this.error(`  ✗ ${key}`, error);
      throw error;
    }
  }

  /**
   * ファイルタイプに応じたCache-Controlヘッダーを取得
   */
  getCacheControl(filePath) {
    if (filePath.match(/\.(html|htm)$/)) {
      return 'public, max-age=0, must-revalidate';
    }
    if (filePath.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
      return 'public, max-age=31536000, immutable';
    }
    return 'public, max-age=3600';
  }

  /**
   * CloudFrontキャッシュを無効化
   */
  async invalidateCloudFrontCache(distributionId) {
    this.log(`Invalidating CloudFront cache for distribution: ${distributionId}`);

    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `deploy-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ['/*']
        }
      }
    });

    try {
      const response = await this.cloudFrontClient.send(command);
      this.log(`✅ Cache invalidation created: ${response.Invalidation.Id}`);
    } catch (error) {
      this.log(`⚠️ Failed to invalidate CloudFront cache: ${error.message}`);
      // キャッシュクリア失敗はデプロイ自体を失敗させない
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    if (config.cloudfront_domain) {
      return `https://${config.cloudfront_domain}`;
    }
    return `https://${config.bucket}.s3.${config.region}.amazonaws.com`;
  }
}
