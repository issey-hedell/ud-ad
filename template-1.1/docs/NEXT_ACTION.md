# 次回アクション（NEXT_ACTION）

> **重要**: このファイルは毎回のセッション開始時に必ず確認してください。
> 重要な決定事項や次回作業内容がここに記録されています。

---

## 最新の状態（2026-01-14）

### 完了した作業

1. **テンプレート拡張（技術スタック選択システム）** (完了)
   - [x] stacks/ ディレクトリ構造の設計・実装
   - [x] プロジェクト初期化スクリプト（bash/PowerShell）
   - [x] CLAUDE.md のモジュール化（claude-rules/）
   - [x] チェックリストのモジュール化（docs/checklists/）
   - [x] Python/FastAPI スタック追加
   - [x] Vanilla JS スタック追加
   - [x] SQLAlchemy スタック追加
   - [x] CI/CD テンプレートの言語別対応
   - [x] verify.sh の自動スタック検出対応
   - [x] PROJECT_CONFIG.md の技術スタック対応

2. **ドキュメント更新** (完了)
   - [x] README.md 全面改訂
   - [x] QUICK_START.md 新規作成
   - [x] stacks/README.md 詳細化

---

## 次回作業

### 優先度：高

1. **追加スタックの実装**
   - [ ] Node.js/Express スタック追加
   - [ ] React フロントエンドスタック追加
   - [ ] MySQL/MongoDB データベーススタック追加

2. **初期化スクリプトのテスト**
   - [ ] 実際のプロジェクト作成でE2Eテスト
   - [ ] Windows/Mac 両環境での動作確認

---

### 優先度：中

1. **CI/CDワークフローの改善**
   - [ ] スタック自動検出によるワークフロー切り替え
   - [ ] マトリックスビルドの最適化

2. **ドキュメント拡充**
   - [ ] 各スタックの詳細ガイド作成
   - [ ] トラブルシューティングガイド

### 優先度：低

1. **追加デプロイ先対応**
   - [ ] AWS ECS スタック追加
   - [ ] Vercel スタック追加
   - [ ] Netlify スタック追加

---

## 更新履歴（History）

### 2026-01-14 [テンプレート拡張: 技術スタック選択システム]

**実装内容**:
- 技術スタック選択システム（stacks/）の設計・実装
- プロジェクト初期化スクリプト（bash/PowerShell対応）
- CLAUDE.md のモジュール化
- チェックリストのカテゴリ別整理
- Python/FastAPI, Vanilla JS, SQLAlchemy スタック追加
- CI/CD テンプレートの言語別対応
- verify.sh の自動スタック検出

**新規ファイル**:
```
stacks/
├── README.md
├── backend/python-fastapi/
│   ├── stack.json
│   └── structure/backend/（FastAPIテンプレート一式）
├── frontend/vanilla/
│   ├── stack.json
│   └── structure/frontend/（Vanilla JSテンプレート一式）
├── orm/sqlalchemy/stack.json
├── database/postgresql/stack.json
└── deploy/aws-ec2/stack.json

claude-rules/
├── base.md
├── backend/（python-fastapi.md, typescript.md）
├── frontend/（react.md, vanilla.md）
└── orm/（prisma.md, sqlalchemy.md）

docs/checklists/
├── README.md
├── common/（security.md, api.md, testing.md）
├── backend/python-fastapi.md
├── frontend/vanilla.md
├── orm/sqlalchemy.md
└── deploy/aws-ec2.md

scripts/
├── init-project.sh / .ps1
├── build-claude-md.sh / .ps1
└── verify/（common.sh, python.sh, node.sh）

.github/workflows/*.template（CI/CDテンプレート）

QUICK_START.md
```

**変更ファイル**:
- `README.md` - 全面改訂（新機能の説明追加）
- `scripts/verify.sh` - 自動スタック検出機能追加
- `docs/PROJECT_CONFIG.md` - 技術スタックセクション追加
- `stacks/README.md` - 詳細ドキュメント追加

**検証結果**:
- 全ファイル構造の存在確認: OK
- bashスクリプト構文チェック: OK
- stack.json バリデーション: OK
- verify.sh 実行テスト: OK

---

## 重要な決定事項

### 2026-01-14 [技術スタック定義形式]

**背景**: テンプレートを複数の技術スタックに対応させるため、スタック情報を構造化する必要があった

**決定内容**: 各スタックを `stack.json` で定義し、以下の情報を含める
- name, displayName, category, description
- files.include / files.exclude（ファイルパターン）
- dependencies（推奨する他カテゴリのスタック）
- claudeRules（CLAUDE.md に追加するルールファイル）

**理由**: JSON形式により機械的な処理が容易になり、初期化スクリプトでの自動処理が可能になる

### 2026-01-14 [CLAUDE.md のモジュール化]

**背景**: 技術スタックごとに異なるコーディング規約・ベストプラクティスがあり、1ファイルでの管理が困難

**決定内容**: `claude-rules/` ディレクトリにモジュール分割し、`build-claude-md.sh` で結合

**理由**:
- スタック選択に応じた動的な CLAUDE.md 生成が可能
- 各ルールの個別メンテナンスが容易
- 新スタック追加時の影響範囲が限定的

---

## 技術的メモ

### スタック自動検出ロジック（verify.sh）

```bash
detect_stack() {
  if [ -f "backend/requirements.txt" ] || [ -f "backend/pyproject.toml" ]; then
    echo "python"
  elif [ -f "package.json" ]; then
    echo "node"
  else
    echo "unknown"
  fi
}
```

### stack.json の構造

```json
{
  "name": "python-fastapi",
  "displayName": "Python + FastAPI",
  "category": "backend",
  "files": {
    "include": ["stacks/backend/python-fastapi/structure/**/*"],
    "exclude": []
  },
  "dependencies": {
    "orm": ["sqlalchemy"],
    "database": ["postgresql", "mysql"]
  },
  "claudeRules": "claude-rules/backend/python-fastapi.md"
}
```

---

## 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| `CLAUDE.md` | 開発ルール・規約 |
| `PROJECT_CONFIG.md` | プロジェクト固有情報 |
| `IMPLEMENTATION_CHECKLIST.md` | 実装チェックリスト |
| `checklists/README.md` | カテゴリ別チェックリスト |
| `error-logs/README.md` | エラーログ |

---

## ステータス凡例

| アイコン | 意味 |
|---------|------|
| (完了) | 実装済み・完了 |
| (進行中) | 進行中・一部実装 |
| (計画中) | 計画中・未着手 |
| (最優先) | 最優先 |
| (注意) | 注意・要確認 |
