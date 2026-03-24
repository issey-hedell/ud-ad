# プロジェクトテンプレート

設計 → 実装 → テスト → デプロイ を自動化するテンプレート

---

## 特徴

- **技術スタック選択**: プロジェクト作成時に技術を選択可能
- **設計ドキュメント一式**: 01〜07の設計テンプレート
- **CI/CD 自動化**: GitHub Actions
- **複数デプロイ先対応**: AWS EC2, Vercel, など

### 対応スタック

| カテゴリ | 選択肢 |
|---------|--------|
| バックエンド | Python/FastAPI, Node.js/Express, Node.js/Next.js |
| フロントエンド | React, Vue.js, Vanilla JS |
| データベース | PostgreSQL, MySQL, MongoDB, Supabase, Firebase |
| ORM | SQLAlchemy, Prisma, TypeORM |
| デプロイ先 | AWS EC2, AWS ECS, Vercel, Netlify |

---

## クイックスタート

### 1. 新規プロジェクトを作成

こちらよりDLしたテンプレートを解凍し、フォルダ名を指定のプロジェクト名に変更した後にローカルフォルダとして指定。
（プロジェクト名はフローの中でも変更できます。）

Claude Code に以下のように伝えてください：

```
新規プロジェクトを作成したい
```

Claude が以下をナビゲートします：
1. プロジェクト名の決定
2. GitHub リポジトリ作成
3. 技術スタック選択
4. 設計フェーズ開始

### 2. 技術スタック選択（自動）

プロジェクト作成時に対話形式で選択：

```bash
# Mac/Linux
./scripts/init-project.sh

# Windows
./scripts/init-project.ps1
```

選択例：
```
[1/4] バックエンドを選択: Python + FastAPI
[2/4] フロントエンドを選択: Vanilla JS
[3/4] データベースを選択: PostgreSQL
[4/4] デプロイ先を選択: AWS EC2
```

### 3. 設計を進める

```
docs/DISCUSSION_MODE_RULES.md を読んで、設計を手伝って
```

| 順番 | ファイル | 内容 |
|------|---------|------|
| 01 | IDEA_SHEET.md | アイデア整理・MVP定義 |
| 02 | REQUIREMENTS.md | 要件定義 |
| 03 | BASIC_DESIGN.md | 基本設計 |
| 04 | DETAILED_DESIGN.md | 詳細設計 |
| 05 | DESIGN_CHECKLIST.md | 設計完了チェック |
| 06 | SITEMAP.md | 画面一覧・遷移図 |
| 07 | UI_PATTERN_RULES.md | UIパターン定義 |

### 4. 実装を進める

設計が完了したら（01-07が全て作成済み）：

```
CLAUDE.md を読んで、実装を進めて
```

---

## ディレクトリ構造

```
template/
├── README.md                  ← 今読んでいるファイル
├── CLAUDE.md                  ← Claude用（実装モード）
│
├── stacks/                    ← 技術スタック定義
│   ├── backend/               # Python/FastAPI, Node.js など
│   ├── frontend/              # React, Vue, Vanilla JS
│   ├── database/              # PostgreSQL, MySQL など
│   ├── orm/                   # SQLAlchemy, Prisma など
│   └── deploy/                # AWS, Vercel など
│
├── claude-rules/              ← CLAUDE.md のモジュール
│   ├── base.md                # 共通ルール
│   ├── backend/               # 言語別ルール
│   ├── frontend/              # フレームワーク別ルール
│   └── orm/                   # ORM別ルール
│
├── scripts/
│   ├── init-project.sh        # プロジェクト初期化
│   ├── verify.sh              # 検証スクリプト（自動検出）
│   └── verify/                # 言語別検証
│
└── docs/
    ├── [設計ドキュメント]
    │   ├── 01_IDEA_SHEET.md
    │   ├── ...
    │   └── 07_UI_PATTERN_RULES.md
    │
    ├── [チェックリスト]
    │   └── checklists/
    │       ├── common/        # 共通（セキュリティ、API、テスト）
    │       ├── backend/       # バックエンド別
    │       ├── frontend/      # フロントエンド別
    │       ├── orm/           # ORM別
    │       └── deploy/        # デプロイ先別
    │
    └── [運用ドキュメント]
        ├── PROJECT_CONFIG.md
        ├── NEXT_ACTION.md
        └── SECRETS.md
```

---

## ドキュメントの役割

| ファイル | 対象 | 用途 |
|---------|------|------|
| README.md | 人間 | プロジェクト概要・使い方ガイド |
| CLAUDE.md | Claude | 実装時のルール・コーディング規約 |
| DISCUSSION_MODE_RULES.md | Claude | 壁打ち・設計相談時の振る舞い |

### CLAUDE.md の構造

技術スタック選択に応じてモジュール化されています：

```
claude-rules/
├── base.md          # 共通ルール（セッション開始、モード判定など）
├── backend/
│   ├── python-fastapi.md   # Python固有ルール
│   └── typescript.md       # TypeScript固有ルール
├── frontend/
│   ├── react.md            # React固有ルール
│   └── vanilla.md          # Vanilla JS固有ルール
└── orm/
    ├── sqlalchemy.md       # SQLAlchemy固有ルール
    └── prisma.md           # Prisma固有ルール
```

---

## 検証

実装後は検証スクリプトを実行：

```bash
bash scripts/verify.sh
```

スタックを自動検出し、適切な検証を実行します：
- Python: ruff, mypy, pytest
- Node.js: ESLint, TypeScript, npm test

---

## 困ったとき・相談したいとき

```
docs/DISCUSSION_MODE_RULES.md を読んで、相談に乗って
```

---

## テスト構成

- `.github/test-automation/tests/`: テンプレート自体の動作確認用
- `tests/` or `src/`: 実プロジェクトのテストコード

詳細は [docs/TEST_INTEGRATION.md](docs/TEST_INTEGRATION.md) を参照。

---

## ライセンス

MIT License
