# 技術スタック定義

このディレクトリには、プロジェクトで選択可能な技術スタックの定義が格納されています。

---

## 対応スタック一覧

### バックエンド

| スタック | 説明 | 推奨用途 |
|---------|------|---------|
| `python-fastapi` | Python 3.11 + FastAPI + Pydantic | API サーバー、ML/AI 連携 |
| `node-express` | Node.js + Express | 軽量 API、リアルタイム通信 |
| `node-nextjs` | Node.js + Next.js API Routes | フルスタック、SSR |

### フロントエンド

| スタック | 説明 | 推奨用途 |
|---------|------|---------|
| `react` | React + TypeScript | SPA、複雑な UI |
| `vue` | Vue.js + TypeScript | SPA、中規模プロジェクト |
| `vanilla` | Plain JavaScript | シンプルな UI、サーバーサイドレンダリング |

### データベース

| スタック | 説明 | 推奨用途 |
|---------|------|---------|
| `postgresql` | PostgreSQL | リレーショナル、複雑なクエリ |
| `mysql` | MySQL | リレーショナル、高速読み取り |
| `mongodb` | MongoDB | ドキュメント指向、柔軟なスキーマ |

### ORM

| スタック | 説明 | 対応バックエンド |
|---------|------|----------------|
| `sqlalchemy` | Python SQL toolkit | python-fastapi |
| `prisma` | Type-safe ORM | node-express, node-nextjs |
| `typeorm` | TypeScript ORM | node-express, node-nextjs |

### デプロイ先

| スタック | 説明 | 推奨用途 |
|---------|------|---------|
| `aws-ec2` | AWS EC2 インスタンス | フルコントロール、長期運用 |
| `aws-ecs` | AWS ECS (コンテナ) | スケーラブル、マイクロサービス |
| `vercel` | Vercel | Next.js、フロントエンド |
| `netlify` | Netlify | 静的サイト、JAMstack |

---

## ディレクトリ構造

```
stacks/
├── backend/
│   ├── python-fastapi/
│   │   ├── stack.json          # スタック定義
│   │   ├── structure/          # ディレクトリ構造テンプレート
│   │   └── checklists/         # 専用チェックリスト
│   ├── node-express/
│   └── node-nextjs/
│
├── frontend/
│   ├── react/
│   ├── vue/
│   └── vanilla/
│       ├── stack.json
│       └── structure/
│
├── database/
│   ├── postgresql/
│   ├── mysql/
│   └── mongodb/
│
├── orm/
│   ├── prisma/
│   ├── sqlalchemy/
│   │   ├── stack.json
│   │   └── checklists/
│   └── typeorm/
│
└── deploy/
    ├── aws-ec2/
    ├── aws-ecs/
    └── vercel/
```

---

## stack.json の形式

各スタックディレクトリには `stack.json` が含まれ、以下の形式で定義されます:

```json
{
  "name": "python-fastapi",
  "displayName": "Python + FastAPI",
  "category": "backend",
  "description": "Python 3.11 + FastAPI + Pydantic",
  "files": {
    "include": [
      "stacks/backend/python-fastapi/structure/**/*",
      "stacks/backend/python-fastapi/checklists/**/*"
    ],
    "exclude": [
      "docs/checklists/01_prisma.md",
      "docs/checklists/03_react.md"
    ]
  },
  "dependencies": {
    "orm": ["sqlalchemy"],
    "database": ["postgresql", "mysql"]
  },
  "claudeRules": "stacks/backend/python-fastapi/claude-rules.md"
}
```

### フィールド説明

| フィールド | 説明 |
|-----------|------|
| `name` | スタック識別子（英数字、ハイフン） |
| `displayName` | 表示名 |
| `category` | カテゴリ（backend, frontend, database, orm, deploy） |
| `description` | 説明文 |
| `files.include` | プロジェクトに含めるファイルパターン |
| `files.exclude` | プロジェクトから除外するファイルパターン |
| `dependencies` | 依存関係（推奨する他カテゴリのスタック） |
| `claudeRules` | CLAUDE.md に追加するルールファイル |

---

## 使い方

### 1. 初期化スクリプトを実行

```bash
# Mac/Linux
./scripts/init-project.sh

# Windows
./scripts/init-project.ps1
```

### 2. 対話形式で選択

```
[1/4] バックエンドを選択してください:
  1) Python + FastAPI
  2) Node.js + Express
  3) Node.js + Next.js (API Routes)
  4) なし（フロントエンドのみ）
選択 (1-4): 1

[2/4] フロントエンドを選択してください:
  1) React
  2) Vue.js
  3) Vanilla JS
  4) なし（APIのみ）
選択 (1-4): 3

...
```

### 3. 自動セットアップ

選択に基づいて以下が自動実行されます：
- ディレクトリ構造のコピー
- チェックリストの配置
- CLAUDE.md の生成
- `.stack-config.json` の作成

---

## 新しいスタックを追加する

### 1. ディレクトリを作成

```bash
mkdir -p stacks/backend/my-new-stack/structure
mkdir -p stacks/backend/my-new-stack/checklists
```

### 2. stack.json を作成

```json
{
  "name": "my-new-stack",
  "displayName": "My New Stack",
  "category": "backend",
  "description": "Description here",
  "files": {
    "include": ["stacks/backend/my-new-stack/structure/**/*"],
    "exclude": []
  },
  "dependencies": {},
  "claudeRules": null
}
```

### 3. テンプレートファイルを配置

`structure/` ディレクトリにプロジェクト構造を作成。

### 4. init-project.sh に追加

スクリプトの選択肢に新しいスタックを追加。

---

## 関連ドキュメント

- [../README.md](../README.md) - テンプレート概要
- [../QUICK_START.md](../QUICK_START.md) - クイックスタート
- [../claude-rules/](../claude-rules/) - CLAUDE.md モジュール
- [../docs/checklists/](../docs/checklists/) - チェックリスト
