# UDエスカレーター 広告管理システム

## プロジェクト概要

UDエスカレーター社が運営するエスカレーター手すり広告事業の運用効率化を目的とした、3者対応型広告管理ポータル。

## 利用者

| ロール | 用途 |
|--------|------|
| UD管理者 | 建物・ESC管理、価格設定、ダッシュボード、入金管理 |
| 広告代理店 | 空き枠検索・予約・決済、広告主リンク発行、掲載管理 |
| 建物オーナー | URLフォーム経由で建物情報を入力（ログイン不要） |
| 広告主 | 代理店発行URLで申込・マイページ確認（ログイン不要） |

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS + shadcn/ui
- **バックエンド / DB**: Supabase (PostgreSQL + RLS)
- **認証**: Supabase Auth (RBAC 3ロール)
- **カード決済**: Stripe
- **請求書PDF生成**: React-PDF
- **メール送信**: Resend
- **ストレージ**: Supabase Storage
- **ホスティング**: Vercel

## フォルダ構成

```
ud-escalator-project/
├── CLAUDE.md                  # Claude Code向け開発指示書
├── README.md                  # このファイル
├── design/
│   ├── moc-screenshots/
│   │   ├── 01_top-page.html           # TOPページ MOC
│   │   └── 02_agency-portal.html      # 代理店ポータル MOC
│   └── sitemap/
│       └── sitemap.md                 # サイトマップ テキスト版
└── docs/
    └── UD_Escalator_System_Design_v1.1.docx  # システム設計書
```

## 開発フェーズ

| Phase | 対象 | 期間目安 |
|-------|------|----------|
| 0 | TOPページ・ロール別ログイン | Week 2–3 |
| 1 | UDポータル | Week 3–5 |
| 2 | 代理店ポータル | Week 6–9 |
| 3 | 建物オーナーフォーム | Week 10–11 |
| 4 | 広告主フォーム | Week 12–13 |

## 設計書

`docs/UD_Escalator_System_Design_v1.1.docx` を参照。
