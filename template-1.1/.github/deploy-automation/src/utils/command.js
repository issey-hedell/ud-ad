import { execSync } from 'child_process';

/**
 * コマンドを実行
 * @param {string} command - 実行するコマンド
 * @param {Object} options - オプション
 * @returns {string} 出力
 */
export function runCommand(command, options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    silent = false,
    throwOnError = true
  } = options;

  try {
    if (!silent) {
      console.log(`$ ${command}`);
    }

    const output = execSync(command, {
      encoding: 'utf-8',
      cwd,
      env,
      stdio: silent ? 'pipe' : 'inherit'
    });

    return output || '';
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    return error.stdout || '';
  }
}

/**
 * コマンドを実行して出力を取得
 * @param {string} command - 実行するコマンド
 * @param {Object} options - オプション
 * @returns {string} 出力
 */
export function getCommandOutput(command, options = {}) {
  const {
    cwd = process.cwd(),
    env = process.env,
    throwOnError = true
  } = options;

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      cwd,
      env,
      stdio: 'pipe'
    });

    return output?.trim() || '';
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    return '';
  }
}

/**
 * npm/npx コマンドを実行
 * @param {string} args - 引数
 * @param {Object} options - オプション
 * @returns {string} 出力
 */
export function runNpm(args, options = {}) {
  return runCommand(`npm ${args}`, options);
}

/**
 * CLIツールをインストール
 * @param {string} packageName - パッケージ名
 */
export function installCli(packageName) {
  console.log(`📦 Installing ${packageName}...`);
  try {
    runCommand(`npm install -g ${packageName}@latest`, { silent: true });
    console.log(`✅ ${packageName} installed successfully`);
  } catch (error) {
    console.warn(`⚠️ Failed to install ${packageName} globally, trying local install`);
    runCommand(`npm install ${packageName}`, { silent: true });
  }
}
