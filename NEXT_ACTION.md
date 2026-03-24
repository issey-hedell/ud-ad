# 次回アクション（NEXT_ACTION）

> **重要**: このファイルは毎回のセッション開始時に必ず確認してください。
> 重要な決定事項や次回作業内容がここに記録されています。

---

## 最新の状態（2026-03-24）

### 完了した作業

1. **設計フェーズ** (完了)
   - [x] システム設計書作成（`ud-escalator-project/docs/UD_Escalator_System_Design_v1.1.docx`）
   - [x] TOPページ MOC作成
   - [x] 代理店ポータル MOC作成
   - [x] UDダッシュボード MOC作成
   - [x] 建物オーナーフォーム MOC作成
   - [x] 広告主申込フォーム MOC作成
   - [x] 広告主マイページ MOC作成
   - [x] サイトマップ作成

2. **リポジトリ初期設定** (完了)
   - [x] GitHub リポジトリ作成（`issey-hedell/ud-ad`）
   - [x] テンプレート + プロジェクト情報マージ
   - [x] CLAUDE.md・PROJECT_CONFIG.md・NEXT_ACTION.md 作成
   - [x] 初回 push

3. **Phase 0 実装** (完了 2026-03-24)
   - [x] Next.js 16 (App Router) プロジェクト作成
   - [x] Tailwind CSS v4 カスタムカラー設定（ud / agency / advertiser）
   - [x] shadcn/ui 依存パッケージ導入
   - [x] Supabase プロジェクト作成（`lzywawksvjhdmrcwvxti` 東京）
   - [x] 全テーブル マイグレーション適用（10テーブル + RLS ポリシー）
   - [x] `src/proxy.ts` 認証基盤（Next.js 16 新仕様）
   - [x] TOPページ実装（`src/app/(public)/page.tsx`）
   - [x] ログインページ実装（`src/app/(auth)/login/page.tsx`）
   - [x] Vercel プロジェクト作成・本番デプロイ完了
   - [x] Vercel 環境変数設定（SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY）

---

## 次回作業

### 優先度：高（Phase 1 実装開始）

#### UDポータル実装

1. **UD ダッシュボード**
   - [ ] `src/app/(ud)/dashboard/page.tsx`
   - [ ] KPI カード（掲載中件数・今月予約・代理店数・建物数）
   - [ ] 最近の予約リスト

2. **建物・ESC管理**
   - [ ] `src/app/(ud)/buildings/page.tsx` — 建物一覧
   - [ ] `src/app/(ud)/buildings/[id]/page.tsx` — 建物詳細・ESC一覧
   - [ ] 建物追加フォーム

3. **価格設定**
   - [ ] `src/app/(ud)/pricing/page.tsx`
   - [ ] ESC × バナーサイズ の料金設定

4. **代理店管理**
   - [ ] `src/app/(ud)/agencies/page.tsx`
   - [ ] 代理店追加・Supabase Auth ユーザー招待

5. **入金管理**
   - [ ] `src/app/(ud)/payments/page.tsx`
   - [ ] `pending_payment` → `confirmed` 更新UI

### 優先度：中（Phase 2 以降）

1. **代理店ポータル**（Phase 2）
   - [ ] 空き枠検索（`src/app/(agency)/search/page.tsx`）
   - [ ] 予約・決済（Stripe連携）
   - [ ] 請求書管理（React-PDF）
   - [ ] 広告主リンク発行

### 優先度：低

1. **建物オーナーフォーム**（Phase 3）
2. **広告主フォーム・マイページ**（Phase 4）

---

## Stripe・Resend 設定（未完了）

- [ ] Stripe アカウントで Webhook エンドポイント登録
  ```bash
  stripe webhook_endpoints create \
    --url https://<vercel-url>/api/stripe/webhook \
    --enabled-events payment_intent.succeeded,payment_intent.payment_failed
  ```
- [ ] `.env.local` に STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 設定
- [ ] Vercel に上記キーを追加
- [ ] Resend API キー取得・設定

---

## 更新履歴（History）

### 2026-03-24 [Phase 0 完了]

**内容**:
- Next.js 16 + Tailwind v4 プロジェクトセットアップ
- Supabase プロジェクト作成・全テーブルマイグレーション完了
- RLS ポリシー設定（3ロール + URLトークンフォーム）
- proxy.ts 認証基盤（Next.js 16仕様）
- TOPページ + ログインページ実装
- Vercel 本番デプロイ完了

**重要な技術メモ**:
- Next.js 16 では `middleware.ts` → `proxy.ts`、関数名 `middleware` → `proxy` に変更
- Tailwind v4 は `tailwind.config.ts` 不要、`globals.css` の `@theme` で設定
- Supabase DB は `uuid_generate_v4()` 非対応（`gen_random_uuid()` を使用）
- Supabase CLI のリージョン指定バグは CLI v2.75.0 以降で修正済み

### 2026-03-24 [初回リポジトリセットアップ]

**内容**:
- template-1.1 + ud-escalator-project を ud-ad リポジトリに統合
- GitHub (`issey-hedell/ud-ad`) に初回 push

---

## 重要な決定事項

### 2026-03-24 [技術スタック確定]

**決定内容**:
- フレームワーク: Next.js 16 App Router（当初14予定→最新版に変更）
- DB/認証: Supabase (PostgreSQL + RLS + Auth)
- 決済: Stripe（カード + 請求書払い）
- メール: Resend
- PDF: React-PDF
- ホスティング: Vercel

### 2026-03-24 [ロール設計確定]

**決定内容**: 3ロール（ud_admin / agency / advertiser）
- URLトークン経由フォームはログイン不要（建物オーナー・広告主）

---

## インフラ情報

| 項目 | 値 |
|------|-----|
| Supabase Project Ref | `lzywawksvjhdmrcwvxti` |
| Supabase Region | ap-northeast-1（東京） |
| Vercel Project | `ud-escalator` |
| GitHub Repo | `issey-hedell/ud-ad` |

---

## ステータス凡例

| アイコン | 意味 |
|---------|------|
| (完了) | 実装済み・完了 |
| (進行中) | 進行中・一部実装 |
| (計画中) | 計画中・未着手 |
| (最優先) | 最優先 |
