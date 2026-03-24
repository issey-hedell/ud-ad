# プロジェクト設定（PROJECT_CONFIG）

> **このファイルはプロジェクト固有の情報を記載します。**
> 新規メンバーは「メンバー別設定」に自分を追加してください。

---

## プロジェクト情報

| 項目 | 値 |
|------|-----|
| プロジェクト名 | UDエスカレーター広告管理システム |
| リポジトリ | `https://github.com/issey-hedell/ud-ad` |
| 本番URL | （Vercel デプロイ後に記載） |
| ステージングURL | （設定後に記載） |
| 作成日 | 2026-03-24 |

---

## 技術スタック

| カテゴリ | 選択 | 備考 |
|---------|------|------|
| フレームワーク | node-nextjs | Next.js 14 App Router |
| スタイリング | Tailwind CSS + shadcn/ui | |
| データベース | supabase | PostgreSQL + RLS |
| ORM | prisma | |
| 認証 | Supabase Auth | RBAC 3ロール |
| 決済 | Stripe | カード決済 + 請求書払い |
| メール | Resend | |
| PDF生成 | React-PDF | 請求書PDF |
| ストレージ | Supabase Storage | |
| デプロイ先 | vercel | |

---

## 環境別設定

### 共通

| 項目 | 値 |
|------|-----|
| リポジトリ | `https://github.com/issey-hedell/ud-ad` |
| 本番URL | （Vercel デプロイ後に記載） |

### Mac環境

| 項目 | 値 |
|------|-----|
| プロジェクトパス | `~/Projects/ud-ad` |
| ターミナル | Terminal |
| スクリプト | `.sh` を使用 |

---

## メンバー別設定

> **重要**: 新メンバーは必ずここに自分の行を追加してください。

| OSユーザー名 | GitHubユーザー名 | 表示名 | 環境 | ロール |
|-------------|-----------------|--------|------|--------|
| watanabeissei | issey-hedell | 渡辺 | Mac | 管理者 |
| <!-- 新メンバーはここに追記 --> | | | | |

---

## 環境変数

### 必須環境変数

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL | .env.local, GitHub Secrets |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー | .env.local, GitHub Secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー | .env.local, GitHub Secrets |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー | .env.local, GitHub Secrets |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット | .env.local, GitHub Secrets |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー | .env.local |
| `RESEND_API_KEY` | Resend APIキー | .env.local, GitHub Secrets |
| `NEXT_PUBLIC_APP_URL` | アプリのベースURL | .env.local |

### オプション環境変数

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `SLACK_WEBHOOK_URL` | Slack通知 | GitHub Secrets |

---

## デプロイ設定

| 項目 | 値 |
|------|-----|
| デプロイ方法 | Vercel（GitHub連携自動デプロイ） |
| 自動デプロイ | 有効 |
| ブランチ戦略 | main → 本番, develop → ステージング |

---

## 外部サービス

| サービス | 用途 | ダッシュボードURL |
|----------|------|------------------|
| GitHub | ソースコード管理 | `https://github.com/issey-hedell/ud-ad` |
| Supabase | DB・認証・ストレージ | `https://supabase.com/dashboard` |
| Stripe | 決済処理 | `https://dashboard.stripe.com` |
| Resend | メール送信 | `https://resend.com/overview` |
| Vercel | ホスティング | `https://vercel.com/dashboard` |

---

## 備考

- 設計書: `ud-escalator-project/docs/UD_Escalator_System_Design_v1.1.docx`
- MOCスクリーンショット: `ud-escalator-project/design/moc-screenshots/`
- サイトマップ: `ud-escalator-project/design/sitemap/sitemap.md`
- 開発テンプレート: `template-1.1/`
