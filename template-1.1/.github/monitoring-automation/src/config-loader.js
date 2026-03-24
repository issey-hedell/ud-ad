import { readFileSync, existsSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { join } from 'path';

/**
 * monitoring-config.yml を読み込む
 */
export function loadMonitoringConfig(configPath = null) {
  // プロジェクトルートを探す
  let projectRoot = process.cwd();

  // .github/monitoring-automation から実行された場合、2階層上に移動
  if (projectRoot.endsWith('monitoring-automation')) {
    projectRoot = join(projectRoot, '..', '..');
  } else if (projectRoot.endsWith('.github')) {
    projectRoot = join(projectRoot, '..');
  }

  const defaultPath = join(projectRoot, 'monitoring-config.yml');
  const finalPath = configPath || defaultPath;

  if (!existsSync(finalPath)) {
    throw new Error(`Monitoring config file not found: ${finalPath}`);
  }

  console.log(`Loading monitoring config from: ${finalPath}`);

  try {
    const fileContent = readFileSync(finalPath, 'utf-8');
    const config = loadYaml(fileContent);

    // 必須フィールドを検証
    validateConfig(config);

    return config;

  } catch (error) {
    console.error('Failed to load monitoring config:', error);
    throw error;
  }
}

/**
 * 設定ファイルの基本構造を検証
 */
function validateConfig(config) {
  if (!config.provider) {
    throw new Error('Missing required field: provider');
  }

  if (!config.environments) {
    throw new Error('Missing required field: environments');
  }

  if (!config.providers) {
    throw new Error('Missing required field: providers');
  }

  if (!config.providers[config.provider]) {
    throw new Error(`Provider configuration not found for: ${config.provider}`);
  }

  console.log('Config validation passed');
}
