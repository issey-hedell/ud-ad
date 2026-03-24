import { DeployProvider } from './base.js';
import { execSync } from 'child_process';

export class CloudflareProvider extends DeployProvider {
  async validate() {
    this.log('Validating Cloudflare configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['account_id', 'project_name', 'token'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required Cloudflare config: ${field}`);
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

      // Wrangler CLIをインストール
      this.log('Installing Wrangler CLI...');
      execSync('npm install -g wrangler@latest', { stdio: 'inherit' });

      // ビルド実行（指定されている場合）
      if (config.build_command) {
        this.log(`Running build command: ${config.build_command}`);
        execSync(config.build_command, { stdio: 'inherit' });
      }

      // デプロイコマンド構築
      const outputDir = config.output_directory || 'out';
      let deployCommand = `wrangler pages deploy ${outputDir} --project-name ${config.project_name}`;

      if (this.environment === 'production') {
        deployCommand += ' --branch main';
      }

      this.log('Executing deployment...');

      const output = execSync(deployCommand, {
        encoding: 'utf-8',
        env: {
          ...process.env,
          CLOUDFLARE_API_TOKEN: config.token,
          CLOUDFLARE_ACCOUNT_ID: config.account_id
        }
      });

      // デプロイURLを抽出
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      this.deployUrl = urlMatch ? urlMatch[0] : `https://${config.project_name}.pages.dev`;

      this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

      return {
        success: true,
        url: this.deployUrl,
        message: 'Cloudflare Pages deployment completed successfully'
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return `https://${config.project_name}.pages.dev`;
  }
}
