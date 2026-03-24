# Claude Code 設定 — UDエスカレーター広告管理システム

> このファイルを読んだら、以下のフローに従って行動してください。

---

## 1. セッション開始フロー

```
【セッション開始】
      ↓
[1] pwd でパス取得 → OSユーザー名を抽出
      ↓
[2] PROJECT_CONFIG.md でメンバー確認
      ↓
    登録済み？ ─No→ 登録を案内して待機
      ↓ Yes
[3] NEXT_ACTION.md を読む（現在の状況を把握）
      ↓
[4] docs/AUTO_UPDATE_FILES.yaml をチェック → 更新があれば反映
      ↓
[5] ユーザーの発言を待つ
      ↓
[6] モード判定（下記参照）
      ↓
    作業開始
```

---

## 2. メンバー確認

### OSユーザー名の抽出

パスから抽出：
- `C:\Users\xxx\...` → `xxx`
- `/Users/xxx/...` → `xxx`
- `/home/xxx/...` → `xxx`

### 登録済みの場合

```
「〇〇さん（xxx）ですね。NEXT_ACTION.md を確認します。」
```

### 未登録の場合

```
【初回セットアップが必要です】

OSユーザー名「xxx」がメンバー一覧にありません。

1. PROJECT_CONFIG.md を開く
2. 「メンバー別設定」に自分を追加
3. git add → commit → push
4. 「設定完了」と教えてください
```

設定完了するまで作業は開始しない。

---

## 3. モード判定（重要）

ユーザーの発言で分岐する：

### 設計モード

**トリガーワード:**
- 「相談」「どう思う」「考えたい」「悩んでる」「壁打ち」「設計」「アイデア」

**振る舞い:**
→ 下記「5. 設計モード」に従う

### 実装モード

**トリガーワード:**
- 「作って」「実装して」「修正して」「追加して」「直して」「コード」

**振る舞い:**
→ 下記「6. 実装モード」に従う

### 不明な場合

```
何をしましょうか？

1. 設計・アイデアの相談
2. 実装・コーディング
3. その他
```

と確認する。

---

## 4. このプロジェクトの固有設定

### プロジェクト概要

UDエスカレーター社向けの3者対応型広告管理ポータル。
- **UD管理者** / **広告代理店** / **広告主（建物オーナー含む）** の3ロールが利用する
- Next.js 14 App Router + Supabase + Stripe 構成

### ディレクトリ規約

```
src/
├── app/
│   ├── (public)/          # 認証不要ページ
│   │   ├── page.tsx           # TOPページ
│   │   ├── forms/
│   │   │   ├── building/[token]/page.tsx   # 建物オーナー入力フォーム
│   │   │   └── advertiser/[token]/page.tsx # 広告主申込フォーム
│   ├── (auth)/
│   │   ├── login/page.tsx
│   ├── (ud)/              # UD管理者エリア（要: ud_admin ロール）
│   │   ├── dashboard/page.tsx
│   │   ├── buildings/
│   │   ├── escalators/
│   │   ├── pricing/
│   │   ├── payments/
│   │   ├── agencies/
│   │   ├── form-links/
│   │   └── reports/
│   ├── (agency)/          # 代理店エリア（要: agency ロール）
│   │   ├── search/page.tsx
│   │   ├── reservations/
│   │   ├── invoices/
│   │   ├── advertiser-links/
│   │   └── advertisers/
│   └── (advertiser)/      # 広告主エリア（要: advertiser ロール）
│       ├── apply/page.tsx
│       └── mypage/page.tsx
├── components/
│   ├── ui/                # shadcn/ui コンポーネント
│   ├── layout/            # Header, Sidebar, Footer
│   └── features/          # 機能別コンポーネント
├── lib/
│   ├── supabase/          # Supabase クライアント・型定義
│   ├── stripe/            # Stripe ユーティリティ
│   ├── resend/            # メール送信
│   └── pdf/               # 請求書PDF生成
└── types/                 # 共通型定義
```

### 認証・認可

#### ロール定義（Supabase Auth metadata）

```typescript
type UserRole = 'ud_admin' | 'agency' | 'advertiser'
```

#### RLS ポリシー方針

- `ud_admin`: 全テーブルへのフルアクセス
- `agency`: `reservations`, `invoices`, `advertisers`, `inquiry_links` は自社（`agency_id`）のみ
- `advertiser`: `reservations` の閲覧のみ（自社案件）
- URLトークン経由フォーム: `building_forms`, `inquiry_links` の特定トークンのみ INSERT 可

#### ミドルウェア

`middleware.ts` でルートグループごとにロールチェックを行う。

### 主要テーブル（Supabase）

```sql
buildings        -- 建物マスタ
escalators       -- エスカレーター (FK: building_id)
banner_sizes     -- バナーサイズマスタ
pricing_rules    -- 掲載料金 (FK: escalator_id)
agencies         -- 代理店
advertisers      -- 広告主 (FK: agency_id)
reservations     -- 予約・掲載管理 (FK: escalator_id, agency_id)
invoices         -- 請求書 (FK: reservation_id)
inquiry_links    -- 広告主向け申込リンク (FK: agency_id)
building_forms   -- 建物オーナー入力フォーム（トークン管理）
```

### 決済フロー

#### カード決済（Stripe）

1. 代理店が枠選択 → `/api/stripe/create-checkout` を呼ぶ
2. Stripe Checkout にリダイレクト
3. Webhook (`/api/stripe/webhook`) で `payment_intent.succeeded` を受け取り
4. `reservations.status` を `confirmed` に更新
5. Resend で確認メール・領収書PDF送信

#### 振込・請求書払い

1. 代理店が枠選択 → `reservations.payment_method = 'invoice'` で仮登録
2. React-PDF で請求書生成 → Supabase Storage に保存
3. Resend で請求書PDF + 振込案内メール送信（`reservations.status = 'pending_payment'`）
4. UD管理者が入金確認 → `reservations.status = 'confirmed'`、`invoices.paid_at` を更新
5. Resend で確認メール送信

### カラー・デザイントークン

設計書・MOCで使用したカラーを Tailwind config に定義すること。

```js
// tailwind.config.ts
colors: {
  ud: {
    navy: '#1A3A5C',
    blue: '#185FA5',
    'blue-light': '#E6F1FB',
  },
  agency: {
    purple: '#534AB7',
    'purple-light': '#EEEDFE',
  },
  advertiser: {
    coral: '#993C1D',
    'coral-light': '#FAECE7',
  },
}
```

### 環境変数（.env.local）

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

### 参考ファイル

| ファイル | 内容 |
|---------|------|
| `ud-escalator-project/docs/UD_Escalator_System_Design_v1.1.docx` | システム設計書（全仕様） |
| `ud-escalator-project/design/moc-screenshots/01_top-page.html` | TOPページ MOC |
| `ud-escalator-project/design/moc-screenshots/02_agency-portal.html` | 代理店ポータル MOC |
| `ud-escalator-project/design/sitemap/sitemap.md` | サイトマップ |

### 開発開始時のチェックリスト

- [ ] `npx create-next-app@latest` で Next.js 14 プロジェクト作成
- [ ] Supabase プロジェクト作成 → 環境変数設定
- [ ] `npx shadcn-ui@latest init` でコンポーネントライブラリ導入
- [ ] Tailwind カスタムカラー設定
- [ ] Supabase マイグレーションファイル作成（上記テーブル）
- [ ] RLS ポリシー設定
- [ ] Stripe アカウント設定 + Webhook エンドポイント登録
- [ ] Resend アカウント設定 + 送信ドメイン認証
- [ ] Phase 0: TOPページ・ロール別ログインから実装開始

---

## 5. 設計モード

設計の相談・壁打ち時の振る舞い。

### 基本姿勢

- **議論相手として振る舞う**（作業者ではない）
- **結論を急がない**（相手の思考を整理する）
- **最終判断は相手に委ねる**（選択肢を提示し、決めるのは相手）
- **不明点は必ず質問する**（曖昧なまま進めない）

### 対話の進め方

1. **問題の構造を整理する**
2. **選択肢を複数提示する**（メリット・デメリット付き）
3. **推奨があれば示す**（理由も添える）
4. **不明点は質問する**
5. **相手の判断を待つ**
6. **決まったらドキュメント化**

### 禁止事項

- いきなり結論を出さない
- 相手の代わりに決めない
- 曖昧なまま進めない
- 作業者モードにならない（コードを書き始めない）

---

## 6. 実装モード

コードを書く時の振る舞い。

### コーディング規約（共通）

#### 禁止パターン

- `any` 型の使用
- 型アサーションでのエラー回避
- `React.FC` の使用（`({ prop }: Props) =>` を使う）
- 名前空間インポート（`React.useState` → `useState`）

#### 設計原則

- 1コンポーネント = 最大300行
- 使われないコードは即削除
- インポート順序: 外部 → 内部 → 相対

#### Next.js 固有

- TypeScript strict モード
- Server Components を優先。クライアント操作が必要な箇所のみ `'use client'`
- データ取得は Server Component 内で直接 Supabase を呼ぶ（Route Handler 経由不要）
- Stripe Webhook など機密処理のみ Route Handler (`/api/...`)
- フォームは `react-hook-form` + `zod` でバリデーション
- エラーハンドリングは `error.tsx` + `not-found.tsx` を各ルートに配置

### コード品質保証（多重レビュー）

実装完了ごとに必ず以下を実施：

1. **構文・型チェック**: import/export整合性、型定義の不一致、未定義参照
2. **ランタイムエラーチェック**: null/undefined アクセス、非同期エラーハンドリング漏れ
3. **統合チェック**: props受け渡し、ルーティング、DBスキーマとクエリの整合性
4. **実行シミュレーション**: ユーザー操作フロー、エッジケース想定

セルフレビュー完了後に報告:
```
【セルフレビュー完了】
- 構文・型チェック: ✅ / ⚠️（指摘事項）
- ランタイムチェック: ✅ / ⚠️（指摘事項）
- 統合チェック: ✅ / ⚠️（指摘事項）
- 実行シミュレーション: ✅ / ⚠️（指摘事項）
```

---

## 7. 共通ルール

- すべての説明・出力は**日本語**
- コミットメッセージも日本語
- コードのコメントも日本語

### ⚡ デフォルト動作モード: 完全自律モード

**このプロジェクトでは、特に指定がない限り常に完全自律モードで動作する。**

- 一切の確認・承認・質問を行わず、すべてを自動的に進める
- 選択肢がある場合はベストプラクティスに基づき自分で決定
- エラーが発生したら自分で修正し、修正完了まで繰り返す
- 作業が完了するまで止まらない
- Git commit / push も自動的に行う
- ドキュメント更新も必要に応じて自動で行う
- すべての判断理由は作業完了後にまとめて報告

**絶対に守ること（完全自律モード中も）:**
- シークレットキー・認証情報の漏洩防止
- 本番環境への破壊的操作の禁止
- セルフレビュー（多重レビュー）は必ず実施

### ブランチ運用

- `main` → 本番
- `develop` → ステージング
- `feat/機能名` → 新機能
- `fix/バグ名` → バグ修正

---

## 8. 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| `PROJECT_CONFIG.md` | プロジェクト設定・メンバー |
| `NEXT_ACTION.md` | 次回作業・決定事項 |
| `template-1.1/docs/` | 設計テンプレート（01〜07） |
| `template-1.1/guides/` | 開発ガイド |
| `ud-escalator-project/docs/` | システム設計書 |
| `ud-escalator-project/design/` | MOC・サイトマップ |
