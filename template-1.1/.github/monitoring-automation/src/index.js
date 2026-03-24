import { loadMonitoringConfig } from './config-loader.js';
import { MonitoringProviderFactory } from './factory.js';
import { sendSlackNotification, createSetupSuccessMessage, createSetupFailureMessage } from './utils/slack.js';
import { appendFileSync } from 'fs';

/**
 * メイン処理
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Phase 4: Monitoring Automation');
  console.log('='.repeat(60));

  try {
    // 1. デプロイ情報を取得
    console.log('\n[1/5] Getting deployment information...');
    const deploymentInfo = getDeploymentInfo();
    console.log(`Environment: ${deploymentInfo.environment}`);
    console.log(`Deploy URL: ${deploymentInfo.deploy_url}`);
    console.log(`Project: ${deploymentInfo.project_name}`);

    // 2. 設定ファイル読み込み
    console.log('\n[2/5] Loading configuration...');
    const config = loadMonitoringConfig();

    // 3. 環境が有効か確認
    if (!isEnvironmentEnabled(config, deploymentInfo.environment)) {
      console.log(`Monitoring is disabled for environment: ${deploymentInfo.environment}`);
      console.log('Skipping monitoring setup');
      return;
    }

    // 4. プロバイダー作成
    console.log('\n[3/5] Creating monitoring provider...');
    const provider = MonitoringProviderFactory.createProvider(config, deploymentInfo);
    console.log(`Provider: ${config.provider}`);

    // 5. プロバイダー設定検証
    await provider.validate();

    // 6. 監視設定実行
    console.log('\n[4/5] Setting up monitoring...');
    const result = await provider.setup();

    // 7. 結果をGitHub Actions outputsに設定
    if (process.env.GITHUB_OUTPUT) {
      appendFileSync(process.env.GITHUB_OUTPUT, `success=${result.success}\n`);
      appendFileSync(process.env.GITHUB_OUTPUT, `provider=${config.provider}\n`);
    }

    // 8. Slack通知
    console.log('\n[5/5] Sending notifications...');
    if (config.notifications?.slack?.enabled) {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      const slackMessage = createSetupSuccessMessage(config, deploymentInfo, result);
      await sendSlackNotification(slackWebhookUrl, slackMessage);
    }

    // 9. 完了
    console.log('\n' + '='.repeat(60));
    console.log('Monitoring setup completed successfully');
    console.log('='.repeat(60));
    console.log(`\nProvider: ${config.provider}`);
    console.log(`Environment: ${deploymentInfo.environment}`);

    process.exit(0);

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('Monitoring setup failed');
    console.error('='.repeat(60));
    console.error(`\nError: ${error.message}`);
    console.error(error);

    // エラー時のSlack通知
    try {
      const config = loadMonitoringConfig();
      const deploymentInfo = getDeploymentInfo();

      if (config.notifications?.slack?.enabled) {
        const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
        const slackMessage = createSetupFailureMessage(config, deploymentInfo, error);
        await sendSlackNotification(slackWebhookUrl, slackMessage);
      }
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError);
    }

    process.exit(1);
  }
}

/**
 * デプロイ情報を取得
 */
function getDeploymentInfo() {
  // repository_dispatch イベントから取得
  let payload = {};

  if (process.env.GITHUB_EVENT_PAYLOAD) {
    try {
      payload = JSON.parse(process.env.GITHUB_EVENT_PAYLOAD);
    } catch (e) {
      console.warn('Failed to parse GITHUB_EVENT_PAYLOAD');
    }
  }

  return {
    environment: payload.client_payload?.environment || process.env.DEPLOY_ENV || 'production',
    deploy_url: payload.client_payload?.deploy_url || process.env.DEPLOY_URL || '',
    project_name: payload.client_payload?.project_name || process.env.GITHUB_REPOSITORY?.split('/')[1] || 'unknown'
  };
}

/**
 * 環境が監視対象か確認
 */
function isEnvironmentEnabled(config, environment) {
  const envConfig = config.environments[environment];
  return envConfig?.enabled !== false; // デフォルトはtrue
}

// 実行
main();
