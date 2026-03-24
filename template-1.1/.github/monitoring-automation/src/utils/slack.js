/**
 * Slack通知を送信
 */
export async function sendSlackNotification(webhookUrl, payload) {
  if (!webhookUrl) {
    console.log('Slack webhook URL not configured, skipping notification');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    console.log('Slack notification sent');
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

/**
 * セットアップ成功時のSlackメッセージ
 */
export function createSetupSuccessMessage(config, deploymentInfo, result) {
  return {
    attachments: [
      {
        color: 'good',
        title: 'Monitoring Setup Successful',
        fields: [
          {
            title: 'Repository',
            value: process.env.GITHUB_REPOSITORY,
            short: true
          },
          {
            title: 'Environment',
            value: deploymentInfo.environment,
            short: true
          },
          {
            title: 'Provider',
            value: config.provider,
            short: true
          },
          {
            title: 'Deploy URL',
            value: deploymentInfo.deploy_url,
            short: true
          },
          {
            title: 'Message',
            value: result.message || 'Monitoring configured successfully',
            short: false
          }
        ],
        footer: 'Phase 4: Monitoring Automation',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
}

/**
 * セットアップ失敗時のSlackメッセージ
 */
export function createSetupFailureMessage(config, deploymentInfo, error) {
  return {
    attachments: [
      {
        color: 'danger',
        title: 'Monitoring Setup Failed',
        fields: [
          {
            title: 'Repository',
            value: process.env.GITHUB_REPOSITORY,
            short: true
          },
          {
            title: 'Environment',
            value: deploymentInfo.environment,
            short: true
          },
          {
            title: 'Provider',
            value: config.provider,
            short: true
          },
          {
            title: 'Error',
            value: error.message || 'Unknown error',
            short: false
          }
        ],
        footer: 'Phase 4: Monitoring Automation',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
}
