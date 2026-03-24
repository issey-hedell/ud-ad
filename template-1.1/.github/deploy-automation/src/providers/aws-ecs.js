import { DeployProvider } from './base.js';
import { ECSClient, UpdateServiceCommand, DescribeServicesCommand } from '@aws-sdk/client-ecs';
import { ECRClient, GetAuthorizationTokenCommand } from '@aws-sdk/client-ecr';
import { execSync } from 'child_process';

export class AwsEcsProvider extends DeployProvider {
  async validate() {
    this.log('Validating AWS ECS configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['cluster', 'service', 'ecr_repo', 'region', 'access_key_id', 'secret_access_key'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required AWS ECS config: ${field}`);
      }
    }

    this.log('✅ Configuration validated');
    return true;
  }

  async deploy() {
    this.logEnvironmentInfo();
    await this.validate();

    try {
      const config = this.resolveEnvVars(this.providerConfig);

      // ECR認証
      await this.authenticateECR(config);

      // Dockerイメージをビルド
      const imageTag = `${config.ecr_repo}:${this.environment}-${Date.now()}`;
      await this.buildAndPushImage(config, imageTag);

      // ECSサービスを更新
      await this.updateECSService(config);

      // デプロイURL（ALB/NLBのURLを設定）
      this.deployUrl = config.url || `https://${config.service}.${config.region}.amazonaws.com`;

      this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

      return {
        success: true,
        url: this.deployUrl,
        message: 'AWS ECS deployment completed successfully',
        metadata: {
          imageTag: imageTag
        }
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  async authenticateECR(config) {
    this.log('Authenticating with ECR...');

    const ecrClient = new ECRClient({
      region: config.region,
      credentials: {
        accessKeyId: config.access_key_id,
        secretAccessKey: config.secret_access_key
      }
    });

    const authResponse = await ecrClient.send(new GetAuthorizationTokenCommand({}));
    const authToken = Buffer.from(authResponse.authorizationData[0].authorizationToken, 'base64').toString('utf-8');
    const [username, password] = authToken.split(':');

    const registryUrl = authResponse.authorizationData[0].proxyEndpoint;

    execSync(`echo ${password} | docker login --username ${username} --password-stdin ${registryUrl}`, {
      stdio: 'inherit'
    });

    this.log('ECR authentication successful');
  }

  async buildAndPushImage(config, imageTag) {
    this.log('Building Docker image...');

    execSync(`docker build -t ${imageTag} .`, { stdio: 'inherit' });

    this.log('Pushing Docker image to ECR...');

    execSync(`docker push ${imageTag}`, { stdio: 'inherit' });

    this.log('Docker image pushed successfully');
  }

  async updateECSService(config) {
    this.log('Updating ECS service...');

    const ecsClient = new ECSClient({
      region: config.region,
      credentials: {
        accessKeyId: config.access_key_id,
        secretAccessKey: config.secret_access_key
      }
    });

    await ecsClient.send(new UpdateServiceCommand({
      cluster: config.cluster,
      service: config.service,
      forceNewDeployment: true
    }));

    this.log('ECS service update initiated');

    // デプロイ完了を待機
    await this.waitForServiceStable(ecsClient, config);
  }

  async waitForServiceStable(ecsClient, config, maxWaitTime = 600000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const describeResponse = await ecsClient.send(new DescribeServicesCommand({
        cluster: config.cluster,
        services: [config.service]
      }));

      const service = describeResponse.services[0];
      const runningCount = service.runningCount;
      const desiredCount = service.desiredCount;

      this.log(`Service status: ${runningCount}/${desiredCount} tasks running`);

      if (runningCount === desiredCount && service.deployments.length === 1) {
        this.log('Service is stable');
        return;
      }

      // 30秒待機
      await new Promise(resolve => setTimeout(resolve, 30000));
    }

    throw new Error('Service deployment timeout');
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return config.url || `https://${config.service}.${config.region}.amazonaws.com`;
  }
}
