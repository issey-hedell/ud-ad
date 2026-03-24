import { DeployProvider } from './base.js';
import { NodeSSH } from 'node-ssh';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export class AwsEc2Provider extends DeployProvider {
  async validate() {
    this.log('Validating AWS EC2 configuration...');

    const config = this.resolveEnvVars(this.providerConfig);
    const required = ['host', 'user', 'ssh_key', 'app_dir', 'deploy_script'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required AWS EC2 config: ${field}`);
      }
    }

    this.log('✅ Configuration validated');
    return true;
  }

  async deploy() {
    this.logEnvironmentInfo();
    await this.validate();

    const ssh = new NodeSSH();
    let keyPath = null;

    try {
      const config = this.resolveEnvVars(this.providerConfig);

      // SSH秘密鍵を一時ファイルに書き出し
      keyPath = join(tmpdir(), `ssh-key-${Date.now()}.pem`);
      const sshKey = Buffer.from(config.ssh_key, 'base64').toString('utf-8');
      writeFileSync(keyPath, sshKey, { mode: 0o600 });

      this.log(`Connecting to ${config.host}...`);

      // SSH接続
      await ssh.connect({
        host: config.host,
        username: config.user,
        privateKeyPath: keyPath,
        port: config.port || 22
      });

      this.log('Connected successfully');

      // 環境変数を設定
      const branchName = process.env.GITHUB_REF_NAME || this.config.environments?.[this.environment]?.branch || 'main';
      const deployScript = config.deploy_script
        .replace(/\$\{app_dir\}/g, config.app_dir)
        .replace(/\$\{branch\}/g, branchName);

      this.log('Executing deployment script...');

      // デプロイスクリプト実行
      const result = await ssh.execCommand(deployScript, {
        cwd: config.app_dir
      });

      if (result.code !== 0) {
        throw new Error(`Deployment script failed: ${result.stderr}`);
      }

      this.log('Deployment script executed successfully');
      if (result.stdout) {
        this.log(`Output: ${result.stdout}`);
      }

      // デプロイURL（設定されている場合）
      this.deployUrl = config.url || `http://${config.host}`;

      ssh.dispose();

      return {
        success: true,
        url: this.deployUrl,
        message: 'AWS EC2 deployment completed successfully'
      };

    } catch (error) {
      this.error('Deployment failed', error);
      throw error;
    } finally {
      // SSH秘密鍵ファイルを削除
      if (keyPath) {
        try {
          unlinkSync(keyPath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      ssh.dispose();
    }
  }

  async getDeploymentUrl() {
    const config = this.resolveEnvVars(this.providerConfig);
    return config.url || `http://${config.host}`;
  }
}
