# シークレット運用ガイド

> 組織共通で使うトークンやAPIキー（例: 組織PAT、サービス共有キー）を安全に管理・登録するための運用ルールと手順をまとめます。

---

## 目的
- 組織で共有してよいキーを明確にし、**安全に登録・ローテーション・監査**できる運用を提供します。

## 推奨ポリシー（短く）
- 管理対象: 組織PAT（必要最小限のスコープ）、サービス共通APIキーなど
- 禁止事項: シークレットをリポジトリに生値でコミットすること
- 命名規則: ORG_<SERVICE>_<PURPOSE>（例: `ORG_GIT_PAT_DEPLOY`, `ORG_SUPABASE_SERVICE_KEY`）
- アクセス制御: Org-level secret は「必要なリポジトリのみ」に限定して許可する
- ローテーション: 90日毎を推奨（重要キーは短く）

## 登録方法（小見出し）
1. まず `scripts/discover-secrets.sh` を親ディレクトリで実行して候補リストを作成してください（サニタイズされたコピーを `docs/secrets-candidates/` に作成します）。
2. 候補ファイルで必要なキー名を確認し、ローカルに `.env.secrets` を作成します（フォーマットは `KEY=VALUE`）。
3. 管理者は `scripts/bootstrap-secrets.sh --org <ORG> --file .env.secrets` を `--dry-run` で確認後に実行して、`gh` CLI を使って一括登録します。

> 注意: 実際のキー値はこのリポジトリに残さないでください。`docs/secrets-candidates/` にあるファイルは値をマスクしています。

## ツールの説明
- `scripts/discover-secrets.sh` — 親ディレクトリから走らせ、候補となるファイルをサニタイズし `docs/secrets-candidates/` にコピーします。出力に `candidates.json` を含み、key名と参照元ファイルを示します。
- `scripts/bootstrap-secrets.sh` — `KEY=VALUE` 形式の `.env.secrets` を読み、`gh secret set` で組織シークレットとして登録します。`--dry-run` により実際の登録コマンドを表示できます。

## 命名ルール（詳細）
- 接頭辞: `ORG_` を必須とする（組織共有であることを明示）
- サービス名は大文字、アンダースコアで区切る
- 目的を末尾に付与（例: `ORG_VERCEL_DEPLOY_TOKEN`）

## ローテーションと監査
- 期限切れリストを `docs/NEXT_ACTION.md` に残す運用を推奨
- 重要な更新（PAT ローテーション等）は `docs/error-logs/` に記録し、更新担当と影響範囲を明記する

## セキュリティ注意点
- スクリプト実行者は最小限の管理権限を付与する
- `gh` CLI の認証は個人の資格情報を用いる（共有アカウント禁止）

---

## 参考: よくあるキーの候補（検索ワード）
- DATABASE_URL, DIRECT_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
- VERCEL_TOKEN, VERCEL_ENV, SENTRY_DSN, GA_MEASUREMENT_ID
- API_KEY, API_SECRET, SERVICE_API_KEY, GH_PAT, GITHUB_PAT


