/**
 * デプロイ環境を判定
 * @param {Object} config - 設定オブジェクト
 * @returns {string} - 'production', 'staging', 'preview'
 */
export function determineEnvironment(config) {
  // 環境変数で明示的に指定されている場合
  const deployEnv = process.env.DEPLOY_ENV;
  if (deployEnv) {
    console.log(`Environment specified via DEPLOY_ENV: ${deployEnv}`);
    return deployEnv;
  }

  // GitHub Actions のブランチ情報から判定
  const branch = process.env.GITHUB_HEAD_BRANCH || process.env.GITHUB_REF_NAME || '';

  // Production環境（mainブランチ）
  const productionBranch = config?.environments?.production?.branch || 'main';
  if (branch === productionBranch) {
    console.log(`Environment determined: production (branch: ${branch})`);
    return 'production';
  }

  // Staging環境（developブランチ）
  const stagingBranch = config?.environments?.staging?.branch;
  if (stagingBranch && branch === stagingBranch) {
    console.log(`Environment determined: staging (branch: ${branch})`);
    return 'staging';
  }

  // それ以外はPreview環境
  console.log(`Environment determined: preview (branch: ${branch})`);
  return 'preview';
}

/**
 * シンプルな環境判定（設定なし）
 * @returns {string}
 */
export function determineEnvironmentSimple() {
  const deployEnv = process.env.DEPLOY_ENV;
  if (deployEnv) {
    return deployEnv;
  }

  const branch = process.env.GITHUB_HEAD_BRANCH || process.env.GITHUB_REF_NAME || '';

  if (branch === 'main' || branch === 'master') {
    return 'production';
  }

  if (branch === 'develop' || branch === 'development') {
    return 'staging';
  }

  return 'preview';
}
