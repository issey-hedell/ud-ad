/**
 * Slack通知を送信
 * @param {string} webhookUrl - Slack Webhook URL
 * @param {Object} payload - 送信データ
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

    console.log('✅ Slack notification sent');
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
    // Slack通知失敗はデプロイ自体を失敗させない
  }
}

/**
 * デプロイ結果のSlack通知を作成
 * @param {Object} params - 通知パラメータ
 * @returns {Object} Slack payload
 */
export function createDeployNotification({
  status,
  environment,
  provider,
  deployUrl,
  repository,
  branch,
  error
}) {
  const isSuccess = status === 'success';
  const emoji = isSuccess ? '✅' : '❌';
  const color = isSuccess ? 'good' : 'danger';
  const text = isSuccess ? 'Deployment successful' : 'Deployment failed';

  const fields = [
    {
      title: 'Repository',
      value: repository,
      short: true
    },
    {
      title: 'Environment',
      value: environment,
      short: true
    },
    {
      title: 'Provider',
      value: provider,
      short: true
    },
    {
      title: 'Branch',
      value: branch,
      short: true
    }
  ];

  if (deployUrl) {
    fields.push({
      title: 'Deploy URL',
      value: deployUrl,
      short: false
    });
  }

  if (error) {
    fields.push({
      title: 'Error',
      value: error,
      short: false
    });
  }

  return {
    attachments: [
      {
        color,
        title: `${emoji} Deploy Automation - ${text}`,
        fields
      }
    ]
  };
}
