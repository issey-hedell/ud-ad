# クイックスタートガイド

このガイドでは、テンプレートを使って新規プロジェクトを立ち上げる手順を詳しく説明します。

---

## 📋 前提条件

- GitHub アカウント
- Git がインストールされている
- Node.js 20以上がインストールされている
- GitHub CLI（`gh`コマンド）がインストールされている（推奨）

---

## 🚀 ステップ1: テンプレートから新規リポジトリを作成

### 方法A: GitHub UIを使う

1. https://github.com/issey-hedell/template にアクセス
2. 「Use this template」ボタンをクリック
3. 「Create a new repository」を選択
4. リポジトリ名を入力（例: `my-new-project`）
5. 「Create repository」をクリック

### 方法B: GitHub CLIを使う

```bash
gh repo create my-new-project --template issey-hedell/template --public
cd my-new-project
```

---

## ⚙️ ステップ2: 設定ファイルを作成

### 2-1. デプロイ設定（Phase 3用）

使用するプロバイダーに応じて、対応するサンプルファイルをコピー：

```bash
# 例: Vercel を使う場合
cp deploy-config.vercel.example deploy-config.yml

# 例: AWS S3 を使う場合
cp deploy-config.aws-s3.example deploy-config.yml

# 例: Netlify を使う場合
cp deploy-config.netlify.example deploy-config.yml
```

**利用可能なプロバイダー設定サンプル**:

| プロバイダー | ファイル名 | 用途 |
|-------------|-----------|------|
| Vercel | `deploy-config.vercel.example` | Next.js, React SPA |
| AWS S3 | `deploy-config.aws-s3.example` | 静的サイト + CloudFront |
| AWS Amplify | `deploy-config.aws-amplify.example` | フルスタックアプリ |
| AWS EC2 | `deploy-config.aws-ec2.example` | SSH経由サーバーデプロイ |
| AWS ECS | `deploy-config.aws-ecs.example` | コンテナデプロイ |
| Netlify | `deploy-config.netlify.example` | JAMstack |
| Firebase | `deploy-config.firebase.example` | Firebase Hosting |
| Cloudflare | `deploy-config.cloudflare.example` | Cloudflare Pages |
| Custom | `deploy-config.custom.example` | カスタムコマンド |

各ファイルには以下が記載されています：
- 必須設定項目
- オプション設定項目
- GitHub Secrets の設定方法
- 取得方法の説明

コピー後、`deploy-config.yml` を開いて必要な設定を編集してください。

---

### 2-2. 監視設定（Phase 4用）

```bash
cp monitoring-config.yml.example monitoring-config.yml
```

`monitoring-config.yml` を編集：

#### Sentryを使う場合

```yaml
provider: sentry

environments:
  production:
    enabled: true
  staging:
    enabled: false
  preview:
    enabled: false

providers:
  sentry:
    organization: ${SENTRY_ORG}
    project: ${SENTRY_PROJECT}
    auth_token: ${SENTRY_AUTH_TOKEN}
    dsn: ${SENTRY_DSN}

    error_tracking:
      enabled: true
      sample_rate: 1.0

    performance:
      enabled: true
      traces_sample_rate: 0.1

    release:
      auto_create: true
      finalize: true

    sourcemaps:
      enabled: true
      upload_path: .next

    alerts:
      enabled: true
      slack_webhook: ${SLACK_WEBHOOK_URL}
```

#### Datadogを使う場合

```yaml
provider: datadog

environments:
  production:
    enabled: true

providers:
  datadog:
    api_key: ${DATADOG_API_KEY}
    app_key: ${DATADOG_APP_KEY}
    site: datadoghq.com

    apm:
      enabled: true
      service_name: ${PROJECT_NAME}
      env: production

    logs:
      enabled: true

    infrastructure:
      enabled: true

    alerts:
      enabled: true
      slack_webhook: ${SLACK_WEBHOOK_URL}
```

---

## 🔐 ステップ3: GitHub Secrets を設定

使用するプロバイダーに応じて、必要なSecretsを設定します。

### Vercel（デプロイ）

```bash
# Vercelダッシュボードからトークンを取得
gh secret set VERCEL_TOKEN

# Organization ID
gh secret set VERCEL_ORG_ID

# Project ID
gh secret set VERCEL_PROJECT_ID
```

**取得方法**:
1. https://vercel.com にログイン
2. Settings → Tokens → Create Token
3. Settings → General → Organization ID / Project ID

---

### AWS（デプロイ・監視）

```bash
# IAMユーザーのアクセスキー
gh secret set AWS_ACCESS_KEY_ID
gh secret set AWS_SECRET_ACCESS_KEY
gh secret set AWS_REGION

# S3バケット名（S3使用時）
gh secret set S3_BUCKET

# CloudFront Distribution ID（S3使用時）
gh secret set CLOUDFRONT_DISTRIBUTION_ID

# Amplify App ID（Amplify使用時）
gh secret set AMPLIFY_APP_ID

# EC2情報（EC2使用時）
gh secret set EC2_HOST
gh secret set EC2_USER
gh secret set EC2_SSH_KEY  # Base64エンコードされたSSH秘密鍵

# ECS情報（ECS使用時）
gh secret set ECS_CLUSTER
gh secret set ECS_SERVICE
gh secret set ECR_REPO

# SNS Topic ARN（CloudWatch使用時）
gh secret set SNS_TOPIC_ARN
```

---

### Netlify（デプロイ）

```bash
# Netlifyダッシュボードから取得
gh secret set NETLIFY_SITE_ID
gh secret set NETLIFY_TOKEN
```

**取得方法**:
1. https://app.netlify.com にログイン
2. Site settings → Site details → API ID
3. User settings → Applications → Personal access tokens

---

### Firebase（デプロイ）

```bash
# Firebase CLIでトークン取得
firebase login:ci

# トークンを設定
gh secret set FIREBASE_TOKEN
gh secret set FIREBASE_PROJECT_ID
```

---

### Cloudflare（デプロイ）

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID
gh secret set CLOUDFLARE_API_TOKEN
```

**取得方法**:
1. https://dash.cloudflare.com にログイン
2. My Profile → API Tokens → Create Token

---

### Sentry（監視）

```bash
gh secret set SENTRY_ORG
gh secret set SENTRY_PROJECT
gh secret set SENTRY_AUTH_TOKEN
gh secret set SENTRY_DSN
```

**取得方法**:
1. https://sentry.io にログイン
2. Settings → Account → API → Auth Tokens → Create New Token
3. Settings → Projects → [Your Project] → Client Keys (DSN)

---

### Datadog（監視）

```bash
gh secret set DATADOG_API_KEY
gh secret set DATADOG_APP_KEY
```

**取得方法**:
1. https://app.datadoghq.com にログイン
2. Organization Settings → API Keys
3. Organization Settings → Application Keys

---

### New Relic（監視）

```bash
gh secret set NEWRELIC_ACCOUNT_ID
gh secret set NEWRELIC_API_KEY
gh secret set NEWRELIC_LICENSE_KEY
```

**取得方法**:
1. https://one.newrelic.com にログイン
2. Account settings → API keys

---

### Slack（通知）

```bash
gh secret set SLACK_WEBHOOK_URL
```

**取得方法**:
1. https://api.slack.com/apps にアクセス
2. Create New App → Incoming Webhooks
3. Webhook URLをコピー

---

## 📝 ステップ4: コミット & プッシュ

```bash
# 設定ファイルをコミット
git add deploy-config.yml monitoring-config.yml
git commit -m "feat: add deployment and monitoring configuration"

# プッシュ
git push origin main
```

---

## ✅ ステップ5: 動作確認

### GitHub Actionsで確認

1. GitHubリポジトリのActionsタブを開く
2. 以下のワークフローが実行されることを確認：
   - ✅ Guardian AI - Code Quality Check
   - ✅ Test Automation
   - ✅ Deploy Automation（本番環境のみ）
   - ✅ Monitoring Automation（本番環境のみ）

### PRで確認（Preview環境）

```bash
# 新しいブランチを作成
git checkout -b feat/test-feature

# 変更を加える
echo "# Test Feature" >> README.md

# コミット & プッシュ
git add README.md
git commit -m "feat: test feature"
git push origin feat/test-feature

# PR作成
gh pr create --title "Test: Preview deployment" --body "Testing preview deployment"
```

PRを作成すると：
1. Phase 1（Guardian AI）が実行される
2. Phase 2（Test）が実行される
3. Phase 3（Deploy）が実行され、Preview環境にデプロイされる
4. PRにデプロイURLがコメントされる

---

## 🎯 次のステップ

### 1. Staging環境を設定（オプション）

```bash
# developブランチを作成
git checkout -b develop
git push origin develop

# deploy-config.yml でStaging環境を有効化
# staging.branch: develop
```

### 2. カスタムドメインを設定

各プロバイダーのダッシュボードでカスタムドメインを設定します。

### 3. アラート設定を調整

`monitoring-config.yml` でアラートの閾値やSlack通知を調整します。

---

## 💡 ヒント

### デプロイをスキップする

コミットメッセージに `[skip deploy]` を含めると、デプロイがスキップされます。

```bash
git commit -m "docs: update README [skip deploy]"
```

### 特定のPhaseのみ実行

GitHub Actionsのワークフローページから、手動で特定のPhaseを実行できます。

---

## 🆘 トラブルシューティング

問題が発生した場合は [TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照してください。

---

## 📞 サポート

その他の質問は [Issues](https://github.com/issey-hedell/template/issues) で受け付けています。
