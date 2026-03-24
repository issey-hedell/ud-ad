import { DeployProvider } from './base.js';
import { AmplifyClient, StartDeploymentCommand, GetJobCommand } from '@aws-sdk/client-amplify';

export class AwsAmplifyProvider extends DeployProvider {
  constructor(config, environment) {
    super(config, environment);
    this.amplifyClient = null;
  }

  async validate() {
    this.log('Validating AWS Amplify configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['app_id', 'region', 'access_key_id', 'secret_access_key'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required AWS Amplify config: ${field}`);
      }
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

    this.amplifyClient = new AmplifyClient(awsConfig);

    this.log('Triggering AWS Amplify deployment...');

    const appId = config.app_id;
    const branchName = this.environment === 'production'
      ? 'main'
      : process.env.GITHUB_HEAD_REF || 'preview';

    try {
      // Amplifyデプロイをトリガー
      const startCommand = new StartDeploymentCommand({
        appId: appId,
        branchName: branchName
      });

      const startResponse = await this.amplifyClient.send(startCommand);
      const jobId = startResponse.jobSummary.jobId;

      this.log(`Deployment job started: ${jobId}`);
      this.log('Waiting for deployment to complete...');

      // デプロイ完了を待つ
      await this.waitForDeployment(appId, branchName, jobId);

      // デプロイURLを生成
      this.deployUrl = `https://${branchName}.${appId}.amplifyapp.com`;

      this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

      return {
        success: true,
        url: this.deployUrl,
        message: 'AWS Amplify deployment completed successfully',
        metadata: {
          jobId: jobId
        }
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  /**
   * デプロイ完了を待つ
   */
  async waitForDeployment(appId, branchName, jobId, maxWaitTime = 600000) {
    const startTime = Date.now();
    const pollInterval = 10000; // 10秒ごとにチェック

    while (Date.now() - startTime < maxWaitTime) {
      const getCommand = new GetJobCommand({
        appId: appId,
        branchName: branchName,
        jobId: jobId
      });

      const response = await this.amplifyClient.send(getCommand);
      const status = response.job.summary.status;

      this.log(`  Status: ${status}`);

      if (status === 'SUCCEED') {
        return response.job;
      }

      if (status === 'FAILED' || status === 'CANCELLED') {
        throw new Error(`Deployment ${status.toLowerCase()}: ${response.job.summary.statusReason || 'Unknown error'}`);
      }

      // 次のチェックまで待つ
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Deployment timed out after ${maxWaitTime / 1000} seconds`);
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    const branchName = this.environment === 'production' ? 'main' : 'preview';
    return `https://${branchName}.${config.app_id}.amplifyapp.com`;
  }
}
