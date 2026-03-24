# サイトマップ — UDエスカレーター広告管理システム

## 公開ページ（認証不要）

- `/`                             TOPページ（サービス紹介・ロール別ログイン導線）
- `/forms/building/[token]`       建物オーナー向け情報入力フォーム（URL発行式）
- `/forms/advertiser/[token]`     広告主向け申込フォーム（代理店URL発行式）

## 認証ページ

- `/login`                        ログイン（ロール共通・メール認証）

## UDポータル `/ud/...`（ud_admin ロール）

- `/ud/dashboard`                 ダッシュボード（稼働率・売上・アラート）
- `/ud/buildings`                 建物一覧
- `/ud/buildings/[id]`            建物詳細・編集
- `/ud/buildings/new`             建物新規登録
- `/ud/escalators`                ESC一覧（建物横断）
- `/ud/pricing`                   価格設定
- `/ud/payments`                  入金管理（振込確認・督促）
- `/ud/agencies`                  代理店アカウント管理
- `/ud/form-links`                建物オーナー向けフォームURL発行・管理
- `/ud/reports`                   月次・年次レポート（CSV/PDFエクスポート）

## 代理店ポータル `/agency/...`（agency ロール）

- `/agency/search`                空き枠検索・一覧
- `/agency/search/[escalatorId]`  ESC詳細・予約フロー
- `/agency/reservations`          案件一覧・掲載管理
- `/agency/reservations/[id]`     案件詳細・入稿物アップロード
- `/agency/invoices`              請求書一覧
- `/agency/invoices/[id]`         請求書詳細・PDF再ダウンロード
- `/agency/advertiser-links`      広告主リンク発行・トラッキング
- `/agency/advertisers`           広告主一覧・過去掲載履歴

## 広告主マイページ `/advertiser/...`（advertiser ロール）

- `/advertiser/mypage`            掲載ステータス確認（閲覧専用）
