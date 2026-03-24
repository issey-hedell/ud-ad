import { DeployProvider } from './base.js';
import { execSync } from 'child_process';

export class FirebaseProvider extends DeployProvider {
  async validate() {
    this.log('Validating Firebase configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['project_id', 'token'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required Firebase config: ${field}`);
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

      // Firebase CLIをインストール
      this.log('Installing Firebase CLI...');
      execSync('npm install -g firebase-tools@latest', { stdio: 'inherit' });

      // デプロイコマンド構築
      let deployCommand;
      let output;

      if (this.environment !== 'production' && config.preview_channel) {
        // Previewチャンネルにデプロイ
        deployCommand = `firebase hosting:channel:deploy ${config.preview_channel} --token ${config.token} --project ${config.project_id}`;
      } else {
        // Productionにデプロイ
        deployCommand = `firebase deploy --token ${config.token} --project ${config.project_id} --only hosting`;
      }

      this.log('Executing deployment...');

      output = execSync(deployCommand, {
        encoding: 'utf-8',
        env: {
          ...process.env,
          FIREBASE_TOKEN: config.token
        }
      });

      // デプロイURL
      if (this.environment === 'production') {
        this.deployUrl = `https://${config.project_id}.web.app`;
      } else {
        // Preview URLを抽出
        const urlMatch = output.match(/https:\/\/[^\s]+/);
        this.deployUrl = urlMatch ? urlMatch[0] : `https://${config.project_id}--${config.preview_channel || 'preview'}.web.app`;
      }

      this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

      return {
        success: true,
        url: this.deployUrl,
        message: 'Firebase deployment completed successfully'
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return `https://${config.project_id}.web.app`;
  }
}
