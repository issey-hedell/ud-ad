/**
 * MonitoringProvider 抽象基底クラス
 * 全ての監視プロバイダーはこのクラスを継承する
 */
export class MonitoringProvider {
  constructor(config, deploymentInfo) {
    this.config = config;
    this.deploymentInfo = deploymentInfo; // { environment, deploy_url, project_name }
    this.providerConfig = config.providers[config.provider];
  }

  /**
   * 監視設定を実行（必須実装）
   * @returns {Promise<SetupResult>}
   */
  async setup() {
    throw new Error('setup() must be implemented by subclass');
  }

  /**
   * 設定を検証（必須実装）
   * @returns {Promise<boolean>}
   */
  async validate() {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * エラートラッキングを有効化（オプション実装）
   * @returns {Promise<boolean>}
   */
  async enableErrorTracking() {
    this.log('Error tracking not implemented for this provider');
    return false;
  }

  /**
   * パフォーマンス監視を有効化（オプション実装）
   * @returns {Promise<boolean>}
   */
  async enablePerformanceMonitoring() {
    this.log('Performance monitoring not implemented for this provider');
    return false;
  }

  /**
   * アラートを設定（オプション実装）
   * @returns {Promise<boolean>}
   */
  async setupAlerts() {
    this.log('Alerts not implemented for this provider');
    return false;
  }

  /**
   * 環境変数を置換
   * @param {string} value
   * @returns {string}
   */
  resolveEnvVar(value) {
    if (typeof value !== 'string') return value;

    const match = value.match(/\$\{(.+?)\}/);
    if (match) {
      const envVar = match[1];
      const resolved = process.env[envVar];
      if (!resolved) {
        throw new Error(`Environment variable not found: ${envVar}`);
      }
      return value.replace(match[0], resolved);
    }
    return value;
  }

  /**
   * 複数の環境変数を一括置換
   * @param {object} obj
   * @returns {object}
   */
  resolveEnvVars(obj) {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        resolved[key] = this.resolveEnvVars(value);
      } else {
        resolved[key] = this.resolveEnvVar(value);
      }
    }
    return resolved;
  }

  /**
   * ログ出力
   */
  log(message, level = 'info') {
    const prefix = `[${this.config.provider}][${this.deploymentInfo.environment}]`;
    console.log(`${prefix} ${message}`);
  }

  /**
   * エラーログ出力
   */
  error(message, error) {
    const prefix = `[${this.config.provider}][${this.deploymentInfo.environment}]`;
    console.error(`${prefix} ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }
}

/**
 * セットアップ結果の型定義
 * @typedef {Object} SetupResult
 * @property {boolean} success - セットアップ成功フラグ
 * @property {string} [message] - 結果メッセージ
 * @property {object} [metadata] - 追加メタデータ
 */
