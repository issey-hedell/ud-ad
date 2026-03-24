# プロジェクト設計ワークフロー

> このドキュメントは、設計から実装・検証までの全フローを標準化し、
> 誰が参加しても同じ品質で開発を進められる仕組みを提供します。

---

## ⚠️ 初参加の方へ（必読）

このリポジトリに初めて参加する場合、**まず以下を実行してください**：

1. `docs/onboarding/ONBOARDING_CHECKLIST.md` を開く
2. チェックリストに沿って初回セットアップを完了
3. `docs/PROJECT_CONFIG.md` の「メンバー別設定」に自分を追加

**メンバー登録が完了するまで、commit・PR はブロックされます。**

---

## クイックスタート

### 1. 環境構築

```bash
# リポジトリをクローン
git clone https://github.com/your-org/your-project.git
cd your-project

# 依存関係インストール（メンバーチェックが自動実行される）
npm install
```

### 2. 開発フロー

詳細は `QUICK_GUIDE.md` を参照。

```
Phase 1: アイデア出し    → 01_IDEA_SHEET.md
Phase 2: 要件定義        → 02_REQUIREMENTS.md
Phase 3: 基本設計        → 03_BASIC_DESIGN.md
Phase 4: 詳細設計        → 04_DETAILED_DESIGN.md
Phase 5: 設計チェック    → 05_DESIGN_CHECKLIST.md
    ↓
★ 全ドキュメント完成で実装開始 ★
    ↓
Phase 6: 実装            → Claude Code + CLAUDE.md
Phase 7: 検証            → VERIFICATION_CHECKLIST.md
```

---

## ディレクトリ構成

```
project/
├── CLAUDE.md                    # Claude Code 設定（自動読み込み）
├── QUICK_GUIDE.md               # 1枚で分かる使い方
├── README.md                    # このファイル
├── package.json                 # メンバーチェック含む
│
├── scripts/                     # 自動化スクリプト
│   ├── check-member.js          # メンバー登録チェック
│   ├── discover-secrets.*       # シークレット検出
│   └── generate-sitemap.*       # サイトマップ生成
│
├── .husky/                      # Git hooks
│   └── pre-commit               # commit時チェック
│
├── .github/                     # GitHub設定
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── member-check.yml     # PR時メンバーチェック
│
└── docs/
    ├── 【設計フェーズ】
    │   ├── 01_IDEA_SHEET.md
    │   ├── 02_REQUIREMENTS.md
    │   ├── 03_BASIC_DESIGN.md
    │   ├── 04_DETAILED_DESIGN.md
    │   └── 05_DESIGN_CHECKLIST.md
    │
    ├── 【プロジェクト設定】
    │   └── PROJECT_CONFIG.md     # 環境別設定・メンバー一覧
    │
    ├── 【実装フェーズ】
    │   ├── NEXT_ACTION.md
    │   ├── SITEMAP.md
    │   └── IMPLEMENTATION_CHECKLIST.md
    │
    ├── 【技術別チェックリスト】
    │   └── checklists/
    │
    ├── 【検証】
    │   ├── VERIFICATION_CHECKLIST.md
    │   └── UI_PATTERN_RULES.md
    │
    ├── 【エラー・シークレット管理】
    │   ├── error-logs/
    │   ├── secrets-candidates/
    │   └── SECRETS.md
    │
    ├── 【運用ルール】
    │   ├── DESIGNER_MODE_RULES.md
    │   └── CLAUDE_CODE_OPERATION.md
    │
    └── 【オンボーディング】
        ├── ONBOARDING_CHECKLIST.md
        └── INVITE_TEMPLATE.md
```

---

## ドキュメント一覧

### 設計フェーズ

| ファイル | 担当 | 内容 |
|---------|------|------|
| 01_IDEA_SHEET.md | 設計者 | アイデア・コンセプト |
| 02_REQUIREMENTS.md | 設計者+AI | 要件定義 |
| 03_BASIC_DESIGN.md | 設計者+AI | 基本設計（技術選定・DB・API） |
| 04_DETAILED_DESIGN.md | 設計者+AI | 詳細設計（画面・API詳細） |
| 05_DESIGN_CHECKLIST.md | 設計者+AI | 設計完了チェック |

### 実装・運用

| ファイル | 用途 |
|---------|------|
| CLAUDE.md | Claude Code の設定・ルール |
| PROJECT_CONFIG.md | プロジェクト固有情報・メンバー一覧 |
| NEXT_ACTION.md | 次回作業・進捗管理 |
| IMPLEMENTATION_CHECKLIST.md | 実装時の注意点 |

### 検証

| ファイル | 用途 |
|---------|------|
| VERIFICATION_CHECKLIST.md | 手動検証チェックリスト |
| UI_PATTERN_RULES.md | UI品質基準（ガーディアンAI用） |

---

## 自動チェック機能

### メンバー登録チェック

未登録メンバーは以下のタイミングでブロックされます：

| タイミング | 動作 |
|-----------|------|
| `npm install` | 警告表示 |
| `git commit` | 拒否 |
| GitHub PR | CI失敗 → マージ不可 |

### 解除方法

`docs/PROJECT_CONFIG.md` の「メンバー別設定」に自分を追加してください。

---

## バージョン

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 2.0.0 | 2026-01-13 | 統合版作成（設計フェーズ + オーナー版統合） |
| 1.0.0 | 2026-01-13 | 初版 |
