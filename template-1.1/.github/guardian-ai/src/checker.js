const claudeClient = require('./claude-client');
const { logger } = require('./utils/logger');

/**
 * コードチェックを実行
 */
async function checkCode(changedFiles, rules) {
  try {
    logger.info('Sending files to Claude API...');

    // ファイル数が多い場合は分割
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < changedFiles.length; i += batchSize) {
      batches.push(changedFiles.slice(i, i + batchSize));
    }

    const allIssues = [];
    let overallSummary = '';

    for (let i = 0; i < batches.length; i++) {
      logger.info(`Processing batch ${i + 1}/${batches.length}...`);
      const batchResult = await claudeClient.checkCode(batches[i], rules);

      if (batchResult.issues) {
        allIssues.push(...batchResult.issues);
      }

      if (batchResult.summary) {
        overallSummary += batchResult.summary + '\n';
      }
    }

    return {
      issues: allIssues,
      summary: overallSummary
    };

  } catch (error) {
    logger.error('Code check failed:', error);
    throw error;
  }
}

module.exports = {
  checkCode
};
