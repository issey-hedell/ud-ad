# CLAUDE.md — UDエスカレーター広告管理システム

Claude Codeがこのプロジェクトで開発を行う際の指示書。

---

## プロジェクト概要

UDエスカレーター社向けの3者対応型広告管理ポータル。
- **UD管理者** / **広告代理店** / **広告主（建物オーナー含む）** の3ロールが利用する
- Next.js 14 App Router + Supabase + Stripe 構成

---

## ディレクトリ規約

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

---

## 認証・認可

### ロール定義（Supabase Auth metadata）

```typescript
type UserRole = 'ud_admin' | 'agency' | 'advertiser'
```

### RLS ポリシー方針

- `ud_admin`: 全テーブルへのフルアクセス
- `agency`: `reservations`, `invoices`, `advertisers`, `inquiry_links` は自社（`agency_id`）のみ
- `advertiser`: `reservations` の閲覧のみ（自社案件）
- URLトークン経由フォーム: `building_forms`, `inquiry_links` の特定トークンのみ INSERT 可

### ミドルウェア

`middleware.ts` でルートグループごとにロールチェックを行う。

---

## 主要テーブル（Supabase）

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

---

## 決済フロー

### カード決済（Stripe）

1. 代理店が枠選択 → `/api/stripe/create-checkout` を呼ぶ
2. Stripe Checkout にリダイレクト
3. Webhook (`/api/stripe/webhook`) で `payment_intent.succeeded` を受け取り
4. `reservations.status` を `confirmed` に更新
5. Resend で確認メール・領収書PDF送信

### 振込・請求書払い

1. 代理店が枠選択 → `reservations.payment_method = 'invoice'` で仮登録
2. React-PDF で請求書生成 → Supabase Storage に保存
3. Resend で請求書PDF + 振込案内メール送信（`reservations.status = 'pending_payment'`）
4. UD管理者が入金確認 → `reservations.status = 'confirmed'`、`invoices.paid_at` を更新
5. Resend で確認メール送信

---

## カラー・デザイントークン

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

---

## コーディング規約

- TypeScript strict モード
- Server Components を優先。クライアント操作が必要な箇所のみ `'use client'`
- データ取得は Server Component 内で直接 Supabase を呼ぶ（Route Handler 経由不要）
- Stripe Webhook など機密処理のみ Route Handler (`/api/...`)
- フォームは `react-hook-form` + `zod` でバリデーション
- エラーハンドリングは `error.tsx` + `not-found.tsx` を各ルートに配置

---

## 環境変数（.env.local）

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

---

## 参考ファイル

| ファイル | 内容 |
|---------|------|
| `docs/UD_Escalator_System_Design_v1.1.docx` | システム設計書（全仕様） |
| `design/moc-screenshots/01_top-page.html` | TOPページ MOC |
| `design/moc-screenshots/02_agency-portal.html` | 代理店ポータル MOC |

---

## 開発開始時のチェックリスト

- [ ] `npx create-next-app@latest` で Next.js 14 プロジェクト作成
- [ ] Supabase プロジェクト作成 → 環境変数設定
- [ ] `npx shadcn-ui@latest init` でコンポーネントライブラリ導入
- [ ] Tailwind カスタムカラー設定
- [ ] Supabase マイグレーションファイル作成（上記テーブル）
- [ ] RLS ポリシー設定
- [ ] Stripe アカウント設定 + Webhook エンドポイント登録
- [ ] Resend アカウント設定 + 送信ドメイン認証
- [ ] Phase 0: TOPページ・ロール別ログインから実装開始
