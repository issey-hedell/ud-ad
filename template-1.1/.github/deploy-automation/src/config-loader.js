import { readFileSync, existsSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';

/**
 * 設定ファイルを読み込む
 * @param {string} configPath - 設定ファイルのパス（オプション）
 * @returns {Object} 設定オブジェクト
 */
export function loadConfig(configPath) {
  // デフォルトのパス
  const defaultPath = join(process.cwd(), '.github', 'deploy-automation', 'deploy-config.yml');
  const filePath = configPath || defaultPath;

  // プロジェクトルートからの相対パスも試す
  const alternativePaths = [
    filePath,
    join(process.cwd(), 'deploy-config.yml'),
    join(process.cwd(), '..', '..', 'deploy-config.yml')
  ];

  let foundPath = null;
  for (const path of alternativePaths) {
    if (existsSync(path)) {
      foundPath = path;
      break;
    }
  }

  if (!foundPath) {
    throw new Error(`Configuration file not found. Tried:\n${alternativePaths.join('\n')}`);
  }

  try {
    const fileContents = readFileSync(foundPath, 'utf8');
    const config = load(fileContents);

    console.log(`✅ Configuration loaded from: ${foundPath}`);
    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration file: ${error.message}`);
  }
}

/**
 * プロバイダー設定を取得
 * @param {Object} config - 設定オブジェクト
 * @returns {Object} プロバイダー設定
 */
export function getProviderConfig(config) {
  const provider = config.provider;

  if (!provider) {
    throw new Error('No provider specified in configuration');
  }

  // プロバイダー名の正規化（aws_s3 → aws-s3）
  const normalizedProvider = provider.replace(/_/g, '-');
  const providerKey = provider.replace(/-/g, '_');

  const providerConfig = config.providers[provider] || config.providers[providerKey];

  if (!providerConfig) {
    throw new Error(`Provider '${provider}' configuration not found. Available providers: ${Object.keys(config.providers || {}).join(', ')}`);
  }

  return {
    name: normalizedProvider,
    config: providerConfig
  };
}

/**
 * 通知設定を取得
 * @param {Object} config - 設定オブジェクト
 * @returns {Object} 通知設定
 */
export function getNotificationConfig(config) {
  return config.notifications || {
    slack: { enabled: false },
    github: { enabled: true, comment_on_pr: true }
  };
}
