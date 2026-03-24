import { DeployProvider } from './base.js';
import { execSync } from 'child_process';

export class NetlifyProvider extends DeployProvider {
  async validate() {
    this.log('Validating Netlify configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['site_id', 'token'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required Netlify config: ${field}`);
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

      // Netlify CLIをインストール
      this.log('Installing Netlify CLI...');
      execSync('npm install -g netlify-cli@latest', { stdio: 'inherit' });

      // ビルド実行（指定されている場合）
      if (config.build_command) {
        this.log(`Running build command: ${config.build_command}`);
        execSync(config.build_command, { stdio: 'inherit' });
      }

      // デプロイコマンド構築
      const publishDir = config.publish_directory || 'out';
      let deployCommand = `netlify deploy --auth ${config.token} --site ${config.site_id} --dir ${publishDir}`;

      if (this.environment === 'production') {
        deployCommand += ' --prod';
      }

      this.log('Executing deployment...');

      const output = execSync(deployCommand, {
        encoding: 'utf-8',
        env: {
          ...process.env,
          NETLIFY_AUTH_TOKEN: config.token,
          NETLIFY_SITE_ID: config.site_id
        }
      });

      // デプロイURLを抽出
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      this.deployUrl = urlMatch ? urlMatch[0] : null;

      if (!this.deployUrl) {
        // Production環境の場合はデフォルトURLを使用
        this.deployUrl = `https://${config.site_id}.netlify.app`;
      }

      this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

      return {
        success: true,
        url: this.deployUrl,
        message: 'Netlify deployment completed successfully'
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return `https://${config.site_id}.netlify.app`;
  }
}
