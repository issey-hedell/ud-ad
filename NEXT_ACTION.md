# 次回アクション（NEXT_ACTION）

> **重要**: このファイルは毎回のセッション開始時に必ず確認してください。
> 重要な決定事項や次回作業内容がここに記録されています。

---

## 最新の状態（2026-03-24）

### 完了した作業

1. **設計フェーズ** (完了)
   - [x] システム設計書作成（`ud-escalator-project/docs/UD_Escalator_System_Design_v1.1.docx`）
   - [x] TOPページ MOC作成（`ud-escalator-project/design/moc-screenshots/01_top-page.html`）
   - [x] 代理店ポータル MOC作成（`ud-escalator-project/design/moc-screenshots/02_agency-portal.html`）
   - [x] UDダッシュボード MOC作成（`ud-escalator-project/design/moc-screenshots/03_ud-dashboard.html`）
   - [x] 建物オーナーフォーム MOC作成（`ud-escalator-project/design/moc-screenshots/04_building-owner-form.html`）
   - [x] 広告主申込フォーム MOC作成（`ud-escalator-project/design/moc-screenshots/05_advertiser-apply-form.html`）
   - [x] 広告主マイページ MOC作成（`ud-escalator-project/design/moc-screenshots/06_advertiser-mypage.html`）
   - [x] サイトマップ作成（`ud-escalator-project/design/sitemap/sitemap.md`）

2. **リポジトリ初期設定** (完了)
   - [x] GitHub リポジトリ作成（`issey-hedell/ud-ad`）
   - [x] テンプレート + プロジェクト情報マージ
   - [x] CLAUDE.md・PROJECT_CONFIG.md・NEXT_ACTION.md 作成
   - [x] 初回 push

---

## 次回作業

### 優先度：高（Phase 0 実装開始）

1. **Next.js プロジェクト作成**
   - [ ] `npx create-next-app@latest` で Next.js 14 プロジェクト作成
   - [ ] `src/` ディレクトリ構成を設定
   - [ ] Tailwind CSS + shadcn/ui 導入
   - [ ] Tailwind カスタムカラー設定（ud / agency / advertiser トークン）

2. **Supabase 初期設定**
   - [ ] Supabase プロジェクト作成
   - [ ] 環境変数（`.env.local`）設定
   - [ ] マイグレーションファイル作成（全テーブル）
   - [ ] RLS ポリシー設定

3. **認証基盤**
   - [ ] Supabase Auth 設定（3ロール: ud_admin / agency / advertiser）
   - [ ] `middleware.ts` でルートグループごとのロールチェック
   - [ ] ログインページ実装

4. **TOPページ実装**
   - [ ] `src/app/(public)/page.tsx` 作成
   - [ ] MOC（`01_top-page.html`）を参考に実装

---

### 優先度：中（Phase 1 以降）

1. **UDポータル**（Phase 1）
   - [ ] ダッシュボード
   - [ ] 建物・ESC管理
   - [ ] 価格設定
   - [ ] 代理店管理
   - [ ] 入金管理

2. **代理店ポータル**（Phase 2）
   - [ ] 空き枠検索
   - [ ] 予約・決済（Stripe連携）
   - [ ] 請求書管理（React-PDF）
   - [ ] 広告主リンク発行

### 優先度：低

1. **建物オーナーフォーム**（Phase 3）
2. **広告主フォーム・マイページ**（Phase 4）

---

## 更新履歴（History）

### 2026-03-24 [初回リポジトリセットアップ]

**内容**:
- template-1.1 + ud-escalator-project を ud-ad リポジトリに統合
- ルートに CLAUDE.md・PROJECT_CONFIG.md・NEXT_ACTION.md・README.md・.gitignore を配置
- GitHub (`issey-hedell/ud-ad`) に初回 push

---

## 重要な決定事項

### 2026-03-24 [技術スタック確定]

**決定内容**:
- フレームワーク: Next.js 14 App Router
- DB/認証: Supabase (PostgreSQL + RLS + Auth)
- 決済: Stripe（カード + 請求書払い）
- メール: Resend
- PDF: React-PDF
- ホスティング: Vercel

**理由**: 設計書（UD_Escalator_System_Design_v1.1.docx）に基づく

### 2026-03-24 [ロール設計確定]

**決定内容**: 3ロール（ud_admin / agency / advertiser）
- URLトークン経由フォームはログイン不要（建物オーナー・広告主）

---

## ステータス凡例

| アイコン | 意味 |
|---------|------|
| (完了) | 実装済み・完了 |
| (進行中) | 進行中・一部実装 |
| (計画中) | 計画中・未着手 |
| (最優先) | 最優先 |
