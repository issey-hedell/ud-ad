# 実装チェックリスト一覧

> **重要**: 新機能実装やコード修正前に、関連するチェックリストを確認してください。
> 過去のエラーから学んだ注意点をカテゴリ別にまとめています。

---

## ディレクトリ構造

```
docs/checklists/
├── README.md           # このファイル
├── active/             # 現在のプロジェクトで有効なチェックリスト
├── common/             # 共通チェックリスト
│   ├── security.md     # セキュリティ
│   ├── api.md          # API設計
│   └── testing.md      # テスト
├── backend/            # バックエンド別
│   ├── python-fastapi.md
│   ├── node-express.md
│   └── node-nextjs.md
├── frontend/           # フロントエンド別
│   ├── react.md
│   ├── vue.md
│   └── vanilla.md
├── database/           # データベース別
│   ├── postgresql.md
│   ├── mysql.md
│   └── mongodb.md
├── orm/                # ORM別
│   ├── prisma.md
│   ├── sqlalchemy.md
│   └── typeorm.md
└── deploy/             # デプロイ先別
    ├── aws-ec2.md
    ├── aws-ecs.md
    └── vercel.md
```

---

## 従来のチェックリスト（後方互換）

| ファイル | カテゴリ | 内容 |
|----------|---------|------|
| [01_prisma.md](./01_prisma.md) | Prisma/DB | スキーマ確認、リレーション、マイグレーション |
| [02_typescript.md](./02_typescript.md) | TypeScript | 型定義、型エラー回避、禁止パターン |
| [03_react.md](./03_react.md) | React | コンポーネント、hooks、key属性 |
| [04_supabase.md](./04_supabase.md) | Supabase | 接続URL、認証、Storage |
| [05_vercel.md](./05_vercel.md) | Vercel | デプロイ、環境変数、ドメイン |
| [06_api.md](./06_api.md) | API実装 | ルート設計、エラーハンドリング、権限 |

---

## 使い方

### プロジェクト初期化時

`scripts/init-project.sh` を実行すると、選択した技術スタックに対応するチェックリストが `active/` ディレクトリにコピーされます。

### 手動で選択する場合

必要なチェックリストを `active/` ディレクトリにコピーしてください:

```bash
# 例: Python/FastAPI + SQLAlchemy + AWS EC2 の場合
cp docs/checklists/common/*.md docs/checklists/active/
cp docs/checklists/backend/python-fastapi.md docs/checklists/active/
cp docs/checklists/orm/sqlalchemy.md docs/checklists/active/
cp docs/checklists/deploy/aws-ec2.md docs/checklists/active/
```

### 実装前

1. 実装する機能に関連するチェックリストを開く
2. 「実装前チェック」セクションを確認
3. 該当する項目をチェック

### 実装中

1. エラーが発生したら、関連するチェックリストの「よくあるエラー」を確認
2. 解決したら `error-logs/` にログを追加

---

## クイックリファレンス

### 技術スタック別

| 技術スタック | 確認すべきチェックリスト |
|-------------|------------------------|
| Python + FastAPI | `common/*`, `backend/python-fastapi.md`, `orm/sqlalchemy.md` |
| Node.js + Next.js | `common/*`, `backend/node-nextjs.md`, `orm/prisma.md` |
| React | `frontend/react.md` |
| Vanilla JS | `frontend/vanilla.md` |
| AWS EC2 デプロイ | `deploy/aws-ec2.md` |
| Vercel デプロイ | `deploy/vercel.md` |

---

## 新しいチェックリストの追加

新しいカテゴリが必要な場合は、適切なディレクトリにファイルを作成してください。

テンプレート:

```markdown
# [カテゴリ名] チェックリスト

> [カテゴリの説明]

---

## 実装前チェック

### 1. [チェック項目]

- [ ] 項目1
- [ ] 項目2

## よくあるパターン

### [パターン名]
```code
// 例
```

## よくあるエラー

### [エラー名]

**エラーメッセージ**: ...
**原因**: ...
**解決方法**: ...
```
