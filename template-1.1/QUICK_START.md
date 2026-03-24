# クイックスタートガイド

テンプレートを使って新規プロジェクトを開始する手順です。

---

## 前提条件

- Git がインストールされている
- GitHub アカウントがある
- `gh` CLI がインストールされている（オプション）
- Claude Code または Claude AI にアクセスできる

---

## 方法1: Claude Code を使う（推奨）

### Step 1: Claude Code でテンプレートリポジトリを開く

```bash
cd ~/projects/template
claude
```

### Step 2: 新規プロジェクト作成を依頼

```
新規プロジェクトを作成したい
```

Claude が以下をナビゲートします：
1. プロジェクト名を聞く
2. GitHub リポジトリを作成
3. 技術スタックを選択
4. 設計フェーズを開始

---

## 方法2: 手動でセットアップ

### Step 1: リポジトリを作成してクローン

```bash
# プロジェクト名を設定
PROJECT_NAME="my-project"

# GitHub リポジトリ作成
gh repo create $PROJECT_NAME --private

# テンプレートをクローン
git clone https://github.com/issey-hedell/template.git $PROJECT_NAME
cd $PROJECT_NAME

# リモートを変更
git remote set-url origin https://github.com/YOUR_USERNAME/$PROJECT_NAME.git
git push -u origin main
```

### Step 2: 技術スタックを選択

```bash
# Mac/Linux
./scripts/init-project.sh

# Windows (PowerShell)
./scripts/init-project.ps1
```

対話形式で以下を選択：
1. バックエンド（Python/FastAPI, Node.js/Express, など）
2. フロントエンド（React, Vue.js, Vanilla JS, など）
3. データベース（PostgreSQL, MySQL, MongoDB, など）
4. デプロイ先（AWS EC2, Vercel, など）

### Step 3: メンバー登録

`docs/PROJECT_CONFIG.md` を開き、メンバー一覧に自分を追加：

```markdown
| OSユーザー名 | GitHubユーザー名 | 表示名 | 環境 | ロール |
|-------------|-----------------|--------|------|--------|
| sator | satoru-boop | 高田 | Windows | リード |
```

### Step 4: 設計を開始

Claude に以下を伝えて設計を開始：

```
docs/DISCUSSION_MODE_RULES.md を読んで、設計を手伝って
```

---

## 技術スタック別セットアップ

### Python + FastAPI

初期化後、以下のディレクトリ構造が作成されます：

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── api/
│   ├── models/
│   ├── schemas/
│   └── services/
├── alembic/
├── requirements.txt
└── tests/
```

セットアップ：
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Vanilla JS

初期化後、以下のディレクトリ構造が作成されます：

```
frontend/
├── static/
│   ├── css/
│   │   ├── common.css
│   │   └── components.css
│   └── js/
│       ├── common.js
│       └── api.js
└── templates/
    └── base.html
```

---

## 次のステップ

1. **設計フェーズ**: 01_IDEA_SHEET.md から順に埋める
2. **実装フェーズ**: 設計完了後、CLAUDE.md を読ませて実装
3. **検証**: `bash scripts/verify.sh` で検証
4. **デプロイ**: PROJECT_CONFIG.md のデプロイコマンドを実行

---

## トラブルシューティング

### スクリプトが実行できない

```bash
# 実行権限を付与
chmod +x scripts/*.sh
```

### メンバー確認でブロックされる

`docs/PROJECT_CONFIG.md` の「メンバー別設定」に自分のOSユーザー名を追加してください。

### 技術スタックを変更したい

`.stack-config.json` を削除して `init-project.sh` を再実行してください。

---

## 参考リンク

- [README.md](README.md) - 全体概要
- [docs/PROJECT_CONFIG.md](docs/PROJECT_CONFIG.md) - プロジェクト設定
- [stacks/README.md](stacks/README.md) - 技術スタック詳細
- [docs/checklists/README.md](docs/checklists/README.md) - チェックリスト一覧
