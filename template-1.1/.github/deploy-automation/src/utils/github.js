import { Octokit } from '@octokit/rest';

/**
 * PRにコメントを投稿
 * @param {string|number} prNumber - PR番号
 * @param {string} deployUrl - デプロイURL
 * @param {string} environment - 環境名
 * @param {string} provider - プロバイダー名
 */
export async function commentOnPR(prNumber, deployUrl, environment, provider) {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;

  if (!prNumber) {
    console.log('No PR number provided, skipping comment');
    return;
  }

  if (!token) {
    console.log('No GITHUB_TOKEN provided, skipping comment');
    return;
  }

  if (!repository) {
    console.log('No GITHUB_REPOSITORY provided, skipping comment');
    return;
  }

  const [owner, repo] = repository.split('/');
  const octokit = new Octokit({ auth: token });

  const emoji = environment === 'production' ? '🎉' : environment === 'staging' ? '🔬' : '🚀';
  const envLabel = environment.charAt(0).toUpperCase() + environment.slice(1);

  const body = `## ${emoji} Deployment Ready

**Environment:** ${envLabel}
**Provider:** ${provider}
**Status:** ✅ Deployed successfully
**URL:** ${deployUrl}

---

${environment === 'preview'
  ? 'The preview deployment is ready for review.'
  : environment === 'staging'
    ? 'Staging deployment completed. Ready for final testing.'
    : 'Production deployment completed successfully!'}`;

  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: parseInt(prNumber),
      body
    });

    console.log(`✅ Comment posted to PR #${prNumber}`);
  } catch (error) {
    console.error('Failed to post comment to PR:', error.message);
  }
}

/**
 * GitHub Actions Outputs に値を設定
 * @param {string} name - 出力名
 * @param {string} value - 値
 */
export function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    const { appendFileSync } = require('fs');
    appendFileSync(outputFile, `${name}=${value}\n`);
  } else {
    console.log(`::set-output name=${name}::${value}`);
  }
}
