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

## リポジトリ構成

```
ud-ad/
├── CLAUDE.md              # Claude Code向け開発指示書（マージ済み）
├── README.md              # このファイル
├── PROJECT_CONFIG.md      # プロジェクト設定・メンバー管理
├── NEXT_ACTION.md         # 次回作業・進捗管理
├── .gitignore
├── ud-escalator-project/  # プロジェクト設計資料
│   ├── CLAUDE.md          # 設計フェーズ用指示書
│   ├── design/
│   │   ├── moc-screenshots/   # 各画面のMOC（HTML）
│   │   └── sitemap/           # サイトマップ
│   └── docs/
│       └── UD_Escalator_System_Design_v1.1.docx  # システム設計書
└── template-1.1/          # 開発フレームワーク・テンプレート
    ├── docs/              # 設計テンプレート（01〜07）
    ├── guides/            # 開発ガイド
    └── stacks/            # 技術スタック定義
```

## 開発フェーズ

| Phase | 対象 | 状態 |
|-------|------|------|
| 設計 | システム設計・MOC作成 | 完了 |
| 0 | TOPページ・ロール別ログイン | 着手前 |
| 1 | UDポータル | 着手前 |
| 2 | 代理店ポータル | 着手前 |
| 3 | 建物オーナーフォーム | 着手前 |
| 4 | 広告主フォーム | 着手前 |

## 設計書・資料

- システム設計書: `ud-escalator-project/docs/UD_Escalator_System_Design_v1.1.docx`
- MOCスクリーンショット: `ud-escalator-project/design/moc-screenshots/`
- サイトマップ: `ud-escalator-project/design/sitemap/sitemap.md`

## 開発を始める

1. `PROJECT_CONFIG.md` のメンバー欄に自分を追加
2. `NEXT_ACTION.md` で現在の状況を確認
3. `CLAUDE.md` の開発ルールを確認して実装開始
