import { DeployProvider } from './base.js';
import { execSync } from 'child_process';

export class CustomProvider extends DeployProvider {
  async validate() {
    this.log('Validating Custom configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const commandKey = `${this.environment}_command`;

    if (!config[commandKey]) {
      throw new Error(`Missing required Custom config: ${commandKey}`);
    }

    this.log('✅ Configuration validated');
    return true;
  }

  async deploy() {
    this.logEnvironmentInfo();
    await this.validate();

    try {
      const config = this.resolveEnvVars(this.providerConfig);

      // 環境別のコマンドを取得
      const commandKey = `${this.environment}_command`;
      const deployCommand = config[commandKey];

      if (!deployCommand) {
        throw new Error(`No deployment command found for environment: ${this.environment}`);
      }

      this.log(`Executing custom command: ${deployCommand}`);

      const output = execSync(deployCommand, {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: process.cwd()
      });

      this.log('Custom deployment completed');
      if (output) {
        this.log(`Output: ${output}`);
      }

      // カスタムコマンドの出力からURLを抽出（可能な場合）
      const urlMatch = output.match(/https?:\/\/[^\s]+/);
      this.deployUrl = urlMatch ? urlMatch[0] : config.url || 'URL not available';

      return {
        success: true,
        url: this.deployUrl,
        message: 'Custom deployment completed successfully'
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return config.url || 'URL not available';
  }
}
