import { MonitoringProvider } from './base.js';
import { execSync } from 'child_process';

export class CustomProvider extends MonitoringProvider {
  async validate() {
    this.log('Validating Custom configuration...');

    if (!this.providerConfig.setup_command) {
      throw new Error('Missing required Custom config: setup_command');
    }

    return true;
  }

  async setup() {
    this.log('Starting Custom monitoring setup...');

    try {
      const config = this.resolveEnvVars(this.providerConfig);

      // カスタムセットアップコマンドを実行
      this.log('Executing custom setup command...');

      const output = execSync(config.setup_command, {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: process.cwd(),
        env: {
          ...process.env,
          DEPLOY_URL: this.deploymentInfo.deploy_url,
          ENVIRONMENT: this.deploymentInfo.environment,
          PROJECT_NAME: this.deploymentInfo.project_name
        }
      });

      this.log('Custom setup completed');
      this.log(`Output: ${output}`);

      // ヘルスチェック（設定されている場合）
      if (config.health_check_url) {
        await this.healthCheck(config.health_check_url);
      }

      return {
        success: true,
        message: 'Custom monitoring configured successfully'
      };

    } catch (error) {
      this.error('Custom setup failed', error);
      throw error;
    }
  }

  async healthCheck(url) {
    this.log(`Running health check: ${url}`);

    try {
      const response = await fetch(url);
      if (response.ok) {
        this.log('Health check passed');
      } else {
        this.log(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      this.log(`Health check error: ${error.message}`);
    }
  }
}
