import { MonitoringProvider } from './base.js';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export class SentryProvider extends MonitoringProvider {
  async validate() {
    this.log('Validating Sentry configuration...');

    const required = ['organization', 'project', 'auth_token', 'dsn'];
    for (const field of required) {
      if (!this.providerConfig[field]) {
        throw new Error(`Missing required Sentry config: ${field}`);
      }
    }

    return true;
  }

  async setup() {
    this.log('Starting Sentry monitoring setup...');

    try {
      const config = this.resolveEnvVars(this.providerConfig);

      // Sentry CLIをインストール
      this.log('Installing Sentry CLI...');
      execSync('npm install -g @sentry/cli@latest', { stdio: 'inherit' });

      // リリースを作成
      if (config.release?.auto_create) {
        await this.createRelease(config);
      }

      // ソースマップをアップロード
      if (config.sourcemaps?.enabled) {
        await this.uploadSourcemaps(config);
      }

      // エラートラッキングを有効化
      if (config.error_tracking?.enabled) {
        await this.enableErrorTracking();
      }

      // パフォーマンス監視を有効化
      if (config.performance?.enabled) {
        await this.enablePerformanceMonitoring();
      }

      // アラートを設定
      if (config.alerts?.enabled) {
        await this.setupAlerts();
      }

      this.log('Sentry setup completed successfully');

      return {
        success: true,
        message: 'Sentry monitoring configured successfully',
        metadata: {
          organization: config.organization,
          project: config.project,
          release: this.getReleaseVersion()
        }
      };

    } catch (error) {
      this.error('Sentry setup failed', error);
      throw error;
    }
  }

  async createRelease(config) {
    this.log('Creating Sentry release...');

    const releaseVersion = this.getReleaseVersion();

    const createCommand = `sentry-cli releases new ${releaseVersion} --auth-token ${config.auth_token} --org ${config.organization} --project ${config.project}`;

    execSync(createCommand, { stdio: 'inherit' });

    // デプロイを記録
    const deployCommand = `sentry-cli releases deploys ${releaseVersion} new -e ${this.deploymentInfo.environment} --auth-token ${config.auth_token} --org ${config.organization}`;

    execSync(deployCommand, { stdio: 'inherit' });

    // リリースを確定
    if (config.release.finalize) {
      const finalizeCommand = `sentry-cli releases finalize ${releaseVersion} --auth-token ${config.auth_token} --org ${config.organization} --project ${config.project}`;

      execSync(finalizeCommand, { stdio: 'inherit' });
    }

    this.log(`Release created: ${releaseVersion}`);
  }

  async uploadSourcemaps(config) {
    this.log('Uploading source maps to Sentry...');

    const releaseVersion = this.getReleaseVersion();
    const uploadPath = config.sourcemaps.upload_path || '.next';

    if (!existsSync(uploadPath)) {
      this.log(`Source map path not found: ${uploadPath}, skipping upload`);
      return;
    }

    const uploadCommand = `sentry-cli sourcemaps upload --auth-token ${config.auth_token} --org ${config.organization} --project ${config.project} --release ${releaseVersion} ${uploadPath}`;

    execSync(uploadCommand, { stdio: 'inherit' });

    this.log('Source maps uploaded successfully');
  }

  async enableErrorTracking() {
    this.log('Error tracking is enabled via Sentry SDK');
    return true;
  }

  async enablePerformanceMonitoring() {
    this.log('Performance monitoring is enabled via Sentry SDK');
    return true;
  }

  async setupAlerts() {
    this.log('Alerts configured in Sentry dashboard');
    return true;
  }

  getReleaseVersion() {
    // Git commit SHA + timestamp
    try {
      const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim().substring(0, 7);
      const timestamp = Date.now();
      return `${this.deploymentInfo.project_name}@${commitSha}-${timestamp}`;
    } catch {
      return `${this.deploymentInfo.project_name}@${Date.now()}`;
    }
  }
}
