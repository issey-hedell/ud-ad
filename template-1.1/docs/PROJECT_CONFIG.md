# プロジェクト設定（PROJECT_CONFIG）

> **このファイルはプロジェクト固有の情報を記載します。**
> 新規プロジェクト立ち上げ時に、このファイルを編集してください。

---

## プロジェクト情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | `{{PROJECT_NAME}}` |
| リポジトリ | `{{REPO_URL}}` |
| 本番URL | `{{PRODUCTION_URL}}` |
| ステージングURL | `{{STAGING_URL}}` |
| 作成日 | `{{CREATED_DATE}}` |

---

## 技術スタック

> `scripts/init-project.sh` 実行時に自動設定されます

| カテゴリ | 選択 | 備考 |
|---------|------|------|
| バックエンド | `{{BACKEND}}` | python-fastapi / node-express / node-nextjs / none |
| フロントエンド | `{{FRONTEND}}` | react / vue / vanilla / none |
| データベース | `{{DATABASE}}` | postgresql / mysql / mongodb / supabase / firebase |
| ORM | `{{ORM}}` | sqlalchemy / prisma / typeorm / none |
| デプロイ先 | `{{DEPLOY}}` | aws-ec2 / aws-ecs / vercel / netlify / other |

---

## 環境別設定

### 共通

| 項目 | 値 |
|------|-----|
| リポジトリ | `{{REPO_URL}}` |
| 本番URL | `{{PRODUCTION_URL}}` |
| ステージングURL | `{{STAGING_URL}}` |

### Windows環境

| 項目 | 値 |
|------|-----|
| プロジェクトパス | `C:\Users\{ユーザー名}\projects\{{PROJECT_NAME}}` |
| SSHキー | `C:\Users\{ユーザー名}\.ssh\key.pem` |
| ターミナル | PowerShell |
| スクリプト | `.ps1` を使用 |

### Mac環境

| 項目 | 値 |
|------|-----|
| プロジェクトパス | `~/projects/{{PROJECT_NAME}}` |
| SSHキー | `~/.ssh/key.pem` |
| ターミナル | Terminal |
| スクリプト | `.sh` を使用 |

---

## メンバー別設定

> **重要**: 新メンバーは必ずここに自分の行を追加してください。
> 登録しないと commit・PR がブロックされます。

| OSユーザー名 | GitHubユーザー名 | 表示名 | 環境 | ロール |
|-------------|-----------------|--------|------|--------|
| （例）sator | satoru-boop | 高田 | Windows | リード |
| （例）watanabe | issey-hedell | 渡辺 | Mac | メンバー |
| <!-- 新メンバーはここに追記 --> | | | | |

---

## 環境変数

### 必須環境変数

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `DATABASE_URL` | データベース接続 | .env, GitHub Secrets |
| `SECRET_KEY` | 認証用シークレット | .env, GitHub Secrets |

### オプション環境変数

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `SLACK_WEBHOOK_URL` | Slack通知 | GitHub Secrets |
| `AWS_ACCESS_KEY_ID` | AWSアクセス | GitHub Secrets |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレット | GitHub Secrets |

---

## デプロイ設定

| 項目 | 値 |
|------|-----|
| デプロイ方法 | `{{DEPLOY_METHOD}}` |
| 自動デプロイ | `{{AUTO_DEPLOY}}` |
| ブランチ戦略 | main → 本番, develop → ステージング |

### デプロイコマンド

**Windows（PowerShell）**:
```powershell
# 本番デプロイ
{{DEPLOY_COMMAND_WINDOWS}}
```

**Mac（Terminal）**:
```bash
# 本番デプロイ
{{DEPLOY_COMMAND_MAC}}
```

---

## 外部サービス

| サービス | 用途 | ダッシュボードURL |
|----------|------|------------------|
| GitHub | ソースコード管理 | `{{REPO_URL}}` |
| `{{SERVICE_1}}` | `{{SERVICE_1_DESC}}` | `{{SERVICE_1_URL}}` |

---

## 備考

`{{NOTES}}`

---

## 設定例

以下は設定済みの例です：

```markdown
## プロジェクト情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | Navi v2 |
| リポジトリ | https://github.com/issey-hedell/navi-v2 |
| 本番URL | https://navi.example.com |

## 技術スタック

| カテゴリ | 選択 |
|---------|------|
| バックエンド | python-fastapi |
| フロントエンド | vanilla |
| データベース | postgresql |
| ORM | sqlalchemy |
| デプロイ先 | aws-ec2 |

## メンバー別設定

| OSユーザー名 | GitHubユーザー名 | 表示名 | 環境 | ロール |
|-------------|-----------------|--------|------|--------|
| sator | satoru-boop | 高田 | Windows | リード |
| watanabe | issey-hedell | 渡辺 | Mac | メンバー |
```
