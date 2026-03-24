# サイトマップ

**最終更新**: <!-- YYYY-MM-DD -->

---

## サイト構造概要

```
プロジェクト名
│
├── 公開サイト（認証不要）
│   └── ランディングページ（/）
│
├── 認証
│   ├── ログイン（/auth/login）
│   └── 新規登録（/auth/register）
│
├── アプリケーション（認証後）
│   ├── ダッシュボード（/dashboard）
│   ├── 機能A（/feature-a）
│   └── 機能B（/feature-b）
│
└── 管理画面（Admin専用）
    └── Admin（/admin）
```

---

## ページ一覧

### 公開ページ（認証不要）

| パス | ファイル | 説明 | ステータス |
|------|----------|------|-----------|
| `/` | `app/page.tsx` | ランディングページ | 📋 |

### 認証ページ

| パス | ファイル | 説明 | ステータス |
|------|----------|------|-----------|
| `/auth/login` | `app/auth/login/page.tsx` | ログイン | 📋 |
| `/auth/register` | `app/auth/register/page.tsx` | 新規登録 | 📋 |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | パスワードリセット | 📋 |

### メインアプリケーション（認証後）

| パス | ファイル | 説明 | ステータス |
|------|----------|------|-----------|
| `/dashboard` | `app/dashboard/page.tsx` | ダッシュボード | 📋 |
| `/feature-a` | `app/feature-a/page.tsx` | 機能A | 📋 |
| `/feature-b` | `app/feature-b/page.tsx` | 機能B | 📋 |
| `/settings` | `app/settings/page.tsx` | 設定 | 📋 |
| `/account` | `app/account/page.tsx` | アカウント | 📋 |

### 管理画面（Admin専用）

| パス | ファイル | 説明 | ステータス |
|------|----------|------|-----------|
| `/admin` | `app/admin/page.tsx` | Admin トップ | 📋 |
| `/admin/users` | `app/admin/users/page.tsx` | ユーザー管理 | 📋 |
| `/admin/settings` | `app/admin/settings/page.tsx` | システム設定 | 📋 |

---

## API一覧

### 認証 API

| メソッド | パス | 説明 | ステータス |
|---------|------|------|-----------|
| POST | `/api/auth/login` | ログイン | 📋 |
| POST | `/api/auth/register` | 新規登録 | 📋 |
| POST | `/api/auth/logout` | ログアウト | 📋 |
| GET | `/api/auth/me` | 現在のユーザー情報 | 📋 |

### リソース API

| メソッド | パス | 説明 | ステータス |
|---------|------|------|-----------|
| GET | `/api/resources` | リソース一覧 | 📋 |
| POST | `/api/resources` | リソース作成 | 📋 |
| GET | `/api/resources/{id}` | リソース詳細 | 📋 |
| PUT | `/api/resources/{id}` | リソース更新 | 📋 |
| DELETE | `/api/resources/{id}` | リソース削除 | 📋 |

### Admin API

| メソッド | パス | 説明 | ステータス |
|---------|------|------|-----------|
| GET | `/api/admin/users` | ユーザー一覧 | 📋 |
| PUT | `/api/admin/users/{id}` | ユーザー更新 | 📋 |
| GET | `/api/admin/stats` | 統計情報 | 📋 |

---

## データベーステーブル

| テーブル名 | 説明 | ステータス |
|-----------|------|-----------|
| users | ユーザー | 📋 |
| sessions | セッション | 📋 |
| resources | リソース | 📋 |
| settings | 設定 | 📋 |

---

## 実装フェーズ

### Phase 1（完了目標: <!-- 日付 -->）

- [ ] ランディングページ
- [ ] 認証システム（ログイン/新規登録）
- [ ] ダッシュボード

### Phase 2（完了目標: <!-- 日付 -->）

- [ ] 機能A
- [ ] 機能B

### Phase 3（完了目標: <!-- 日付 -->）

- [ ] 管理画面
- [ ] 設定画面

---

## ステータス凡例

| アイコン | 意味 |
|---------|------|
| ✅ | 実装済み |
| 🔄 | 進行中 |
| 📋 | 未着手 |
