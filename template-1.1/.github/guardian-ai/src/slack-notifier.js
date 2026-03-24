const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const { logger } = require('./utils/logger');

/**
 * Slack通知を送信
 */
async function sendNotification() {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      logger.warn('SLACK_WEBHOOK_URL not set, skipping notification');
      return;
    }

    const prUrl = process.env.PR_URL;
    const prNumber = process.env.PR_NUMBER;
    const prTitle = process.env.PR_TITLE;
    const prAuthor = process.env.PR_AUTHOR;
    const riskLevel = process.env.RISK_LEVEL;

    // issues.json を読み込み
    const issuesPath = path.join(__dirname, '../output/issues.json');
    const issuesContent = await fs.readFile(issuesPath, 'utf-8');
    const issues = JSON.parse(issuesContent);

    // 問題のサマリーを作成
    const issuesSummary = issues
      .slice(0, 5)  // 最初の5件のみ
      .map(issue => `• *${issue.file}:${issue.line}* - ${issue.message}`)
      .join('\n');

    const moreIssues = issues.length > 5 ? `\n...and ${issues.length - 5} more issues` : '';

    // リスクレベルに応じた絵文字
    const riskEmoji = riskLevel === 'high' ? '🔴' : '🟡';

    // Slackメッセージを作成
    const message = {
      text: `${riskEmoji} Guardian AI: ${riskLevel} risk issues detected`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${riskEmoji} Guardian AI Alert: ${riskLevel.toUpperCase()} Risk`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*PR:* <${prUrl}|#${prNumber} - ${prTitle}>\n*Author:* ${prAuthor}\n*Risk Level:* ${riskLevel.toUpperCase()}`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Issues Found (${issues.length}):*\n${issuesSummary}${moreIssues}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Review PR'
              },
              url: prUrl,
              style: riskLevel === 'high' ? 'danger' : 'primary'
            }
          ]
        }
      ]
    };

    // Slackに送信
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    logger.info('Slack notification sent');

  } catch (error) {
    logger.error('Failed to send Slack notification:', error);
    // Slack通知失敗は致命的ではないのでエラーを投げない
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  sendNotification().catch(error => {
    logger.error('Slack notifier failed:', error);
    process.exit(1);
  });
}

module.exports = {
  sendNotification
};
