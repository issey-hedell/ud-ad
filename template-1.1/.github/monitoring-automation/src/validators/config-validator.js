/**
 * 設定ファイルを検証
 * @param {Object} config - 設定オブジェクト
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateConfig(config) {
  const errors = [];

  // 基本構造のチェック
  if (!config) {
    errors.push('Configuration is empty or null');
    return { valid: false, errors };
  }

  if (!config.provider) {
    errors.push('Missing required field: provider');
  }

  if (!config.environments) {
    errors.push('Missing required field: environments');
  }

  if (!config.providers || typeof config.providers !== 'object') {
    errors.push('Missing or invalid field: providers');
  }

  // プロバイダー設定のチェック
  if (config.provider && config.providers) {
    const providerErrors = validateProviderConfig(config);
    errors.push(...providerErrors);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * プロバイダー固有の設定を検証
 * @param {Object} config - 設定オブジェクト
 * @returns {string[]} エラーメッセージの配列
 */
function validateProviderConfig(config) {
  const errors = [];
  const provider = config.provider;
  const providerConfig = config.providers[provider];

  if (!providerConfig) {
    errors.push(`Missing configuration for provider: ${provider}`);
    return errors;
  }

  switch (provider) {
    case 'sentry':
      if (!providerConfig.organization) errors.push('Missing sentry.organization');
      if (!providerConfig.project) errors.push('Missing sentry.project');
      if (!providerConfig.auth_token) errors.push('Missing sentry.auth_token');
      if (!providerConfig.dsn) errors.push('Missing sentry.dsn');
      break;

    case 'datadog':
      if (!providerConfig.api_key) errors.push('Missing datadog.api_key');
      if (!providerConfig.app_key) errors.push('Missing datadog.app_key');
      if (!providerConfig.site) errors.push('Missing datadog.site');
      break;

    case 'cloudwatch':
      if (!providerConfig.region) errors.push('Missing cloudwatch.region');
      if (!providerConfig.access_key_id) errors.push('Missing cloudwatch.access_key_id');
      if (!providerConfig.secret_access_key) errors.push('Missing cloudwatch.secret_access_key');
      if (!providerConfig.log_group) errors.push('Missing cloudwatch.log_group');
      break;

    case 'newrelic':
      if (!providerConfig.account_id) errors.push('Missing newrelic.account_id');
      if (!providerConfig.api_key) errors.push('Missing newrelic.api_key');
      if (!providerConfig.license_key) errors.push('Missing newrelic.license_key');
      break;

    case 'custom':
      if (!providerConfig.setup_command) errors.push('Missing custom.setup_command');
      break;

    default:
      errors.push(`Unknown provider: ${provider}`);
  }

  return errors;
}

/**
 * 環境変数の存在を確認（警告のみ）
 * @param {Object} config - 設定オブジェクト
 * @returns {string[]} 警告メッセージの配列
 */
export function checkEnvironmentVariables(config) {
  const warnings = [];
  const providerConfig = config.providers?.[config.provider] || {};

  // ${VAR_NAME} 形式の変数を抽出
  const configStr = JSON.stringify(providerConfig);
  const varMatches = configStr.match(/\$\{([^}]+)\}/g) || [];

  for (const match of varMatches) {
    const varName = match.slice(2, -1);
    if (!process.env[varName]) {
      warnings.push(`Environment variable not set: ${varName}`);
    }
  }

  return warnings;
}
