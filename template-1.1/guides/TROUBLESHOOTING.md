# トラブルシューティング

よくある問題と解決方法をまとめました。

---

## 📋 目次

1. [Phase 1: Guardian AI](#phase-1-guardian-ai)
2. [Phase 2: Test Automation](#phase-2-test-automation)
3. [Phase 3: Deploy Automation](#phase-3-deploy-automation)
4. [Phase 4: Monitoring Automation](#phase-4-monitoring-automation)
5. [共通の問題](#共通の問題)

---

## Phase 1: Guardian AI

### ❌ Guardian AIが実行されない

**症状**: PRを作成してもGuardian AIワークフローが実行されない

**原因**: ワークフローのトリガー設定が正しくない

**解決方法**:
```yaml
# .github/workflows/guardian-ai.yml を確認
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

---

### ❌ 自動修正が適用されない

**症状**: Guardian AIが問題を検出するが、自動修正されない

**原因**: 自動修正が有効になっていない

**解決方法**:
`.github/guardian-ai/config.yml` で `auto_fix: true` になっているか確認

---

## Phase 2: Test Automation

### ❌ テストが失敗する

**症状**: ユニットテストまたはE2Eテストが失敗する

**原因1**: 依存関係がインストールされていない

**解決方法**:
```bash
npm install
npm run test
```

**原因2**: テストファイルが正しい場所にない

**解決方法**:
- ユニットテスト: `__tests__/` または `*.test.js`
- E2Eテスト: `e2e/` ディレクトリ

---

### ❌ Playwrightのブラウザがインストールされていない

**症状**: `Error: browserType.launch: Executable doesn't exist`

**解決方法**:
```bash
npx playwright install
```

---

## Phase 3: Deploy Automation

### ❌ `deploy-config.yml not found`

**症状**: デプロイワークフローが「設定ファイルが見つかりません」と表示する

**原因**: `deploy-config.yml` が作成されていない

**解決方法**:
```bash
cp deploy-config.yml.example deploy-config.yml
# deploy-config.yml を編集
git add deploy-config.yml
git commit -m "feat: add deploy configuration"
git push
```

**注意**: テンプレートリポジトリには `deploy-config.yml` がないのが正常です。これはスキップされます。

---

### ❌ `Missing required XXX config`

**症状**: デプロイ時に「必須の設定が見つかりません」エラー

**原因**: GitHub Secretsが設定されていない

**解決方法**:

#### Vercelの場合
```bash
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

#### AWSの場合
```bash
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION
```

詳細は [QUICK_START.md](QUICK_START.md) の「GitHub Secrets を設定」を参照。

---

### ❌ Vercelデプロイが失敗する

**症状**: `Vercel CLI error: Invalid token`

**原因**: Vercelトークンが無効または期限切れ

**解決方法**:
1. https://vercel.com/account/tokens で新しいトークンを作成
2. GitHub Secretsを更新
   ```bash
   gh secret set VERCEL_TOKEN
   ```

---

### ❌ AWS S3デプロイでアクセス拒否

**症状**: `Access Denied` エラー

**原因**: IAMユーザーの権限不足

**解決方法**:

必要な権限:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket/*",
        "arn:aws:s3:::your-bucket"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### ❌ EC2デプロイでSSH接続失敗

**症状**: `SSH connection failed`

**原因**: SSH鍵が正しく設定されていない

**解決方法**:
```bash
# SSH秘密鍵をBase64エンコード
cat ~/.ssh/id_rsa | base64 -w 0

# GitHub Secretsに設定
gh secret set EC2_SSH_KEY
# ↑ Base64エンコードされた鍵を貼り付け
```

---

### ❌ PRコメントが投稿されない

**症状**: Preview環境にデプロイされるが、PRにコメントが投稿されない

**原因**: `workflow_run` イベント経由ではPR情報の取得方法が特殊

**解決方法**:

`.github/workflows/deploy.yml` で以下を確認:
```yaml
env:
  PR_NUMBER: ${{ github.event.workflow_run.pull_requests[0].number }}
```

これが正しく設定されているか確認。

---

## Phase 4: Monitoring Automation

### ❌ `monitoring-config.yml not found`

**症状**: 監視ワークフローが「設定ファイルが見つかりません」と表示する

**原因**: `monitoring-config.yml` が作成されていない

**解決方法**:
```bash
cp monitoring-config.yml.example monitoring-config.yml
# monitoring-config.yml を編集
git add monitoring-config.yml
git commit -m "feat: add monitoring configuration"
git push
```

---

### ❌ Sentryのリリース作成が失敗する

**症状**: `Sentry API error: Invalid auth token`

**原因**: Sentry Auth Tokenが無効または権限不足

**解決方法**:
1. https://sentry.io/settings/account/api/auth-tokens/ で新しいトークンを作成
2. 必要な権限: `project:releases`, `project:write`
3. GitHub Secretsを更新
   ```bash
   gh secret set SENTRY_AUTH_TOKEN
   ```

---

### ❌ Sentryのソースマップアップロードが失敗する

**症状**: `Source maps upload failed: Path not found`

**原因**: ビルド出力ディレクトリが正しくない

**解決方法**:

`monitoring-config.yml` でパスを確認:
```yaml
providers:
  sentry:
    sourcemaps:
      enabled: true
      upload_path: .next  # または build, dist, out
```

プロジェクトのビルド設定に合わせて変更。

---

### ❌ Datadogに接続できない

**症状**: `Datadog API error: Forbidden`

**原因**: API KeyまたはApp Keyが無効

**解決方法**:
1. https://app.datadoghq.com/organization-settings/api-keys で確認
2. GitHub Secretsを更新
   ```bash
   gh secret set DATADOG_API_KEY
   gh secret set DATADOG_APP_KEY
   ```

---

### ❌ CloudWatchのログ グループ作成が失敗する

**症状**: `Access Denied: logs:CreateLogGroup`

**原因**: IAM権限不足

**解決方法**:

必要な権限:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:PutRetentionPolicy",
        "cloudwatch:PutMetricAlarm"
      ],
      "Resource": "*"
    }
  ]
}
```

---

### ❌ Phase 4が実行されない

**症状**: デプロイは成功するが、Phase 4が実行されない

**原因1**: Phase 3 の `repository_dispatch` トリガーが無効

**解決方法**:

`.github/workflows/deploy.yml` の最後に以下があるか確認:
```yaml
- name: Trigger Phase 4 (Monitoring Setup)
  if: success() && env.DEPLOY_ENV == 'production'
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    event-type: deploy-completed
```

**原因2**: Production環境でデプロイされていない

**解決方法**:

Phase 4 は Production環境（mainブランチ）のデプロイ成功時のみ実行されます。

PRのPreview環境では実行されません。

---

## 共通の問題

### ❌ GitHub Actionsワークフローが実行されない

**症状**: コミット・PRしてもワークフローが実行されない

**原因1**: ワークフローファイルの構文エラー

**解決方法**:
```bash
# ローカルで構文チェック
npm install -g actionlint
actionlint .github/workflows/*.yml
```

**原因2**: リポジトリの Actions が無効

**解決方法**:
1. GitHubリポジトリの Settings → Actions → General
2. 「Allow all actions and reusable workflows」を選択
3. 「Save」をクリック

---

### ❌ `Resource not accessible by integration`

**症状**: GitHub Actions で権限エラー

**原因**: `GITHUB_TOKEN` の権限不足

**解決方法**:

`.github/workflows/xxx.yml` に権限を追加:
```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```

---

### ❌ ワークフローが途中で停止する

**症状**: ワークフローが特定のステップで停止し、タイムアウトする

**原因**: ネットワーク問題または外部サービスの応答待ち

**解決方法**:

タイムアウトを設定:
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 30  # デフォルトは360分
```

---

### ❌ Slack通知が送信されない

**症状**: デプロイ・監視設定が成功するが、Slack通知が来ない

**原因**: Webhook URLが正しくない

**解決方法**:
1. Slack Incoming Webhookを再確認
2. GitHub Secretsを更新
   ```bash
   gh secret set SLACK_WEBHOOK_URL
   ```
3. `deploy-config.yml` または `monitoring-config.yml` で通知が有効か確認
   ```yaml
   notifications:
     slack:
       enabled: true
       webhook_url: ${SLACK_WEBHOOK_URL}
   ```

---

### ❌ 環境変数が解決されない

**症状**: `${VAR_NAME}` がそのまま表示される

**原因**: GitHub Secretsが設定されていない

**解決方法**:
```bash
# 設定されているSecretsを確認
gh secret list

# 不足しているSecretsを設定
gh secret set VAR_NAME
```

---

## 🔍 デバッグ方法

### ログの確認

1. GitHubリポジトリの「Actions」タブを開く
2. 失敗したワークフローをクリック
3. 失敗したジョブをクリック
4. エラーメッセージを確認

### ローカルでテスト

```bash
# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# ビルド
npm run build

# デプロイ設定の検証（Phase 3）
cd .github/deploy-automation
node src/index.js --validate

# 監視設定の検証（Phase 4）
cd .github/monitoring-automation
node src/index.js --validate
```

---

## 📞 サポート

上記で解決しない場合:

1. [Issues](https://github.com/issey-hedell/template/issues) で検索
2. 新しいIssueを作成
3. 以下の情報を含める：
   - 問題の詳細
   - エラーメッセージ
   - 使用しているプロバイダー
   - 設定ファイルの内容（機密情報は除く）
   - GitHub Actionsのログ

---

## 💡 その他のヒント

### GitHub Actions の実行を手動トリガー

```yaml
on:
  workflow_dispatch:  # 手動実行を有効化
```

### キャッシュをクリア

キャッシュが原因で問題が発生する場合:

1. GitHubリポジトリの「Actions」タブ
2. 「Caches」を開く
3. 該当するキャッシュを削除

### ワークフローを無効化

特定のPhaseを一時的に無効にする場合:

```yaml
# ワークフローファイルの先頭に追加
on:
  push:
    branches-ignore:
      - '**'  # すべてのブランチで無効化
```
