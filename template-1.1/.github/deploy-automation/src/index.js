import { DeployProviderFactory } from './factory.js';
import { loadConfig } from './config-loader.js';
import { determineEnvironment } from './utils/environment.js';
import { commentOnPR } from './utils/github.js';
import { sendSlackNotification, createDeployNotification } from './utils/slack.js';
import { validateConfig, checkEnvironmentVariables } from './validators/config-validator.js';
import { writeFileSync } from 'fs';

async function main() {
  try {
    console.log('🚀 Starting deployment automation...\n');

    // 1. 設定ファイルを読み込み
    const config = loadConfig();

    // 2. 環境を判定
    const environment = determineEnvironment(config);
    console.log(`📍 Environment: ${environment}\n`);

    // 3. 設定を検証
    const validation = validateConfig(config);
    if (!validation.valid) {
      console.error('❌ Configuration validation failed:');
      validation.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }

    // 4. 環境変数の警告をチェック
    const warnings = checkEnvironmentVariables(config);
    if (warnings.length > 0) {
      console.warn('⚠️ Environment variable warnings:');
      warnings.forEach(warn => console.warn(`  - ${warn}`));
    }

    // 5. プロバイダーを作成
    const provider = DeployProviderFactory.createProvider(config, environment);

    // 6. デプロイ実行
    const result = await provider.deploy();

    // 7. GitHub Actions outputsに設定
    if (process.env.GITHUB_OUTPUT) {
      writeFileSync(process.env.GITHUB_OUTPUT, `url=${result.url}\n`, { flag: 'a' });
      writeFileSync(process.env.GITHUB_OUTPUT, `environment=${environment}\n`, { flag: 'a' });
      writeFileSync(process.env.GITHUB_OUTPUT, `provider=${config.provider}\n`, { flag: 'a' });
    }

    // 8. PRにコメント（GitHub通知が有効な場合）
    const notifyConfig = config.notifications?.github;
    if (notifyConfig?.enabled !== false && notifyConfig?.comment_on_pr !== false) {
      const prNumber = process.env.PR_NUMBER;
      if (prNumber) {
        await commentOnPR(
          prNumber,
          result.url,
          environment,
          config.provider
        );
      }
    }

    // 9. Slack通知（有効な場合）
    const slackConfig = config.notifications?.slack;
    if (slackConfig?.enabled) {
      const webhookUrl = slackConfig.webhook_url?.replace(/\$\{([^}]+)\}/g, (_, varName) => process.env[varName] || '');
      if (webhookUrl) {
        const payload = createDeployNotification({
          status: 'success',
          environment,
          provider: config.provider,
          deployUrl: result.url,
          repository: process.env.GITHUB_REPOSITORY,
          branch: process.env.GITHUB_HEAD_BRANCH || process.env.GITHUB_REF_NAME
        });
        await sendSlackNotification(webhookUrl, payload);
      }
    }

    console.log('\n✅ Deployment completed successfully');
    console.log(`📍 URL: ${result.url}`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error(error.stack);

    // 失敗時のSlack通知
    try {
      const config = loadConfig();
      const slackConfig = config.notifications?.slack;
      if (slackConfig?.enabled) {
        const webhookUrl = slackConfig.webhook_url?.replace(/\$\{([^}]+)\}/g, (_, varName) => process.env[varName] || '');
        if (webhookUrl) {
          const payload = createDeployNotification({
            status: 'failure',
            environment: process.env.DEPLOY_ENV || 'unknown',
            provider: config.provider,
            repository: process.env.GITHUB_REPOSITORY,
            branch: process.env.GITHUB_HEAD_BRANCH || process.env.GITHUB_REF_NAME,
            error: error.message
          });
          await sendSlackNotification(webhookUrl, payload);
        }
      }
    } catch (e) {
      // 通知エラーは無視
    }

    process.exit(1);
  }
}

// バリデーションモード
if (process.argv.includes('--validate')) {
  (async () => {
    try {
      console.log('🔍 Validating configuration...\n');

      const config = loadConfig();
      const environment = determineEnvironment(config);

      const validation = validateConfig(config);
      if (!validation.valid) {
        console.error('❌ Configuration validation failed:');
        validation.errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
      }

      const warnings = checkEnvironmentVariables(config);
      if (warnings.length > 0) {
        console.warn('\n⚠️ Environment variable warnings:');
        warnings.forEach(warn => console.warn(`  - ${warn}`));
      }

      const provider = DeployProviderFactory.createProvider(config, environment);
      await provider.validate();

      console.log('\n✅ Configuration is valid');
      console.log(`  Provider: ${config.provider}`);
      console.log(`  Environment: ${environment}`);
      process.exit(0);

    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      process.exit(1);
    }
  })();
} else {
  main();
}
