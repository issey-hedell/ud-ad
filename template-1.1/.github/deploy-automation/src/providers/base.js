/**
 * DeployProvider - 抽象基底クラス
 * すべてのデプロイプロバイダーが継承する
 */
export class DeployProvider {
  constructor(config, environment) {
    if (this.constructor === DeployProvider) {
      throw new Error('DeployProvider is an abstract class and cannot be instantiated directly');
    }

    this.config = config;
    this.environment = environment; // 'preview', 'staging', 'production'
    this.providerConfig = config.providers[config.provider] || {};
    this.deployUrl = null;
  }

  /**
   * ログ出力
   * @param {string} message
   */
  log(message) {
    console.log(`[${this.getProviderName()}] ${message}`);
  }

  /**
   * エラーログ出力
   * @param {string} message
   * @param {Error} error
   */
  error(message, error) {
    console.error(`[${this.getProviderName()}] ${message}:`, error?.message || error);
  }

  /**
   * 環境変数を解決（${VAR_NAME} → 実際の値）
   * @param {Object} obj
   * @returns {Object}
   */
  resolveEnvVars(obj) {
    if (typeof obj === 'string') {
      return obj.replace(/\$\{([^}]+)\}/g, (_, varName) => {
        return process.env[varName] || '';
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveEnvVars(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const resolved = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveEnvVars(value);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * デプロイを実行（必須実装）
   * @returns {Promise<{success: boolean, url: string, message: string}>}
   */
  async deploy() {
    throw new Error('deploy() must be implemented by subclass');
  }

  /**
   * 設定を検証（必須実装）
   * @returns {Promise<boolean>}
   * @throws {Error} 設定が不正な場合
   */
  async validate() {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * デプロイURLを取得
   * @returns {Promise<string>}
   */
  async getDeploymentUrl() {
    return this.deployUrl;
  }

  /**
   * プロバイダー名を取得
   * @returns {string}
   */
  getProviderName() {
    return this.constructor.name.replace('Provider', '');
  }

  /**
   * 環境情報をログ出力
   */
  logEnvironmentInfo() {
    this.log(`
🚀 Deployment Information:
  Provider: ${this.getProviderName()}
  Environment: ${this.environment}
  Branch: ${process.env.GITHUB_REF_NAME || 'unknown'}
    `);
  }
}
