import { determineEnvironmentSimple } from '../utils/environment.js';

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
  const provider = config.provider.replace(/_/g, '-').toLowerCase();
  const providerKey = config.provider.replace(/-/g, '_');
  const providerConfig = config.providers[config.provider] || config.providers[providerKey];

  if (!providerConfig) {
    errors.push(`Missing configuration for provider: ${config.provider}`);
    return errors;
  }

  switch (provider) {
    case 'vercel':
      if (!providerConfig.org_id) errors.push('Missing vercel.org_id');
      if (!providerConfig.project_id) errors.push('Missing vercel.project_id');
      if (!providerConfig.token) errors.push('Missing vercel.token');
      break;

    case 'aws-s3':
    case 's3':
      if (!providerConfig.bucket) errors.push('Missing aws_s3.bucket');
      if (!providerConfig.region) errors.push('Missing aws_s3.region');
      if (!providerConfig.access_key_id) errors.push('Missing aws_s3.access_key_id');
      if (!providerConfig.secret_access_key) errors.push('Missing aws_s3.secret_access_key');
      break;

    case 'aws-amplify':
    case 'amplify':
      if (!providerConfig.app_id) errors.push('Missing aws_amplify.app_id');
      if (!providerConfig.region) errors.push('Missing aws_amplify.region');
      if (!providerConfig.access_key_id) errors.push('Missing aws_amplify.access_key_id');
      if (!providerConfig.secret_access_key) errors.push('Missing aws_amplify.secret_access_key');
      break;

    case 'aws-ec2':
    case 'ec2':
      if (!providerConfig.host) errors.push('Missing aws_ec2.host');
      if (!providerConfig.user) errors.push('Missing aws_ec2.user');
      if (!providerConfig.ssh_key) errors.push('Missing aws_ec2.ssh_key');
      if (!providerConfig.app_dir) errors.push('Missing aws_ec2.app_dir');
      if (!providerConfig.deploy_script) errors.push('Missing aws_ec2.deploy_script');
      break;

    case 'aws-ecs':
    case 'ecs':
      if (!providerConfig.cluster) errors.push('Missing aws_ecs.cluster');
      if (!providerConfig.service) errors.push('Missing aws_ecs.service');
      if (!providerConfig.ecr_repo) errors.push('Missing aws_ecs.ecr_repo');
      if (!providerConfig.region) errors.push('Missing aws_ecs.region');
      if (!providerConfig.access_key_id) errors.push('Missing aws_ecs.access_key_id');
      if (!providerConfig.secret_access_key) errors.push('Missing aws_ecs.secret_access_key');
      break;

    case 'netlify':
      if (!providerConfig.site_id) errors.push('Missing netlify.site_id');
      if (!providerConfig.token) errors.push('Missing netlify.token');
      break;

    case 'firebase':
      if (!providerConfig.project_id) errors.push('Missing firebase.project_id');
      if (!providerConfig.token) errors.push('Missing firebase.token');
      break;

    case 'cloudflare':
      if (!providerConfig.account_id) errors.push('Missing cloudflare.account_id');
      if (!providerConfig.project_name) errors.push('Missing cloudflare.project_name');
      if (!providerConfig.token) errors.push('Missing cloudflare.token');
      break;

    case 'custom':
      const env = determineEnvironmentSimple();
      const commandKey = `${env}_command`;
      if (!providerConfig[commandKey]) {
        errors.push(`Missing custom.${commandKey}`);
      }
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
