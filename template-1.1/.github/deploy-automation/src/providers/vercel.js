import { DeployProvider } from './base.js';
import { execSync } from 'child_process';

export class VercelProvider extends DeployProvider {
  async validate() {
    this.log('Validating Vercel configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['token', 'org_id', 'project_id'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required Vercel config: ${field}`);
      }
    }

    this.log('✅ Configuration validated');
    return true;
  }

  async deploy() {
    this.logEnvironmentInfo();
    await this.validate();

    const config = this.resolveEnvVars(this.providerConfig);

    // Vercel CLIをインストール
    this.log('Installing Vercel CLI...');
    try {
      execSync('npm install -g vercel@latest', { stdio: 'inherit' });
    } catch (error) {
      this.log('Failed to install globally, trying local install');
      execSync('npm install vercel', { stdio: 'inherit' });
    }

    this.log('Deploying to Vercel...');

    // デプロイコマンド構築（トークンは環境変数VERCEL_TOKEN経由で渡す）
    // コマンドライン引数に含めるとプロセスリストで露出するリスクがある
    let deployCommand = 'vercel';

    // Production環境の場合は --prod フラグ
    if (this.environment === 'production') {
      deployCommand += ' --prod';
    }

    // 確認スキップ
    deployCommand += ' --yes';

    try {
      const output = execSync(deployCommand, {
        encoding: 'utf-8',
        cwd: process.cwd(),
        env: {
          ...process.env,
          VERCEL_TOKEN: config.token,
          VERCEL_PROJECT_ID: config.project_id,
          VERCEL_ORG_ID: config.org_id
        }
      });

      // デプロイURLを抽出
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      this.deployUrl = urlMatch ? urlMatch[0] : null;

      if (!this.deployUrl) {
        throw new Error('Failed to extract deployment URL from Vercel output');
      }

      this.log(`✅ Deployed successfully to: ${this.deployUrl}`);

      return {
        success: true,
        url: this.deployUrl,
        message: 'Vercel deployment completed successfully'
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return this.deployUrl || `https://${config.project_id}.vercel.app`;
  }
}
