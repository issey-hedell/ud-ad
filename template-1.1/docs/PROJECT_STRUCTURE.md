# プロジェクト構成ガイド

このドキュメントは、テンプレートリポジトリの全体像を統合的に説明します。

---

## 1. プロジェクト概要

設計 → 実装 → テスト → デプロイ を自動化するテンプレート

### 特徴

- 設計ドキュメント一式（01〜07）
- CI/CD 自動化（GitHub Actions）
- 9種類のデプロイ先対応
- 5種類の監視ツール連携

### ドキュメントの役割

| ファイル | 対象 | 用途 |
|---------|------|------|
| README.md | 人間 | プロジェクト概要・使い方ガイド |
| CLAUDE.md | Claude | 実装時のルール・コーディング規約・禁止パターン |
| DISCUSSION_MODE_RULES.md | Claude | 壁打ち・設計相談時の振る舞いルール |

---

## 2. ディレクトリ構成

### 全体構成

```
template/
├── [ルートファイル]
│   ├── README.md                    # プロジェクト概要（人間用）
│   ├── CLAUDE.md                    # Claude実装ルール（Claude用）
│   ├── QUICK_GUIDE.md               # 1枚で分かる使い方
│   ├── QUICK_START.md               # CI/CDセットアップガイド
│   ├── DESIGN_WORKFLOW.md           # 設計ワークフロー説明
│   ├── TROUBLESHOOTING.md           # トラブルシューティング
│   ├── package.json                 # npm設定（メンバーチェック含む）
│   └── verify.sh                    # 検証スクリプト
│
├── [設定ファイル（example）]
│   ├── deploy-config.*.example      # デプロイ設定（9種類）
│   └── monitoring-config.yml.example # 監視設定
│
├── docs/                            # ドキュメント
│   ├── [設計ドキュメント 01-07]
│   ├── [Claude用ルール]
│   ├── [運用ドキュメント]
│   └── [サブディレクトリ]
│
├── scripts/                         # 自動化スクリプト
│
├── .github/                         # GitHub設定・CI/CD
│   ├── workflows/                   # GitHub Actions
│   ├── guardian-ai/                 # Phase 1: コード品質チェック
│   ├── test-automation/             # Phase 2: テスト自動化
│   ├── deploy-automation/           # Phase 3: デプロイ自動化
│   └── monitoring-automation/       # Phase 4: 監視自動化
│
└── .husky/                          # Git hooks
```

### ルートファイル詳細

#### ドキュメント（人間用）

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| README.md | ★ | プロジェクト概要。新規参加者が最初に見るファイル |
| QUICK_GUIDE.md | ★ | 設計〜実装フローの概要。1枚で全体像を把握 |
| QUICK_START.md | | CI/CDセットアップの詳細手順 |
| DESIGN_WORKFLOW.md | | 設計ワークフローの詳細説明 |
| TROUBLESHOOTING.md | | よくある問題と解決方法 |

#### ドキュメント（Claude用）

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| CLAUDE.md | ★ | 実装時のルール。Claude Codeが自動読み込み |
| .cc-rules.md | | Claude Code追加ルール |

#### 設定ファイル

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| package.json | ★ | npm設定。postinstallでメンバーチェック実行 |
| .gitignore | ★ | Git除外設定 |
| verify.sh | | リポジトリ検証スクリプト |

#### デプロイ設定（example）

| ファイル | 用途 |
|---------|------|
| deploy-config.vercel.example | Vercel向け |
| deploy-config.aws-s3.example | AWS S3 + CloudFront向け |
| deploy-config.aws-amplify.example | AWS Amplify向け |
| deploy-config.aws-ec2.example | AWS EC2向け（SSH経由） |
| deploy-config.aws-ecs.example | AWS ECS向け（コンテナ） |
| deploy-config.netlify.example | Netlify向け |
| deploy-config.firebase.example | Firebase Hosting向け |
| deploy-config.cloudflare.example | Cloudflare Pages向け |
| deploy-config.custom.example | カスタムコマンド |
| monitoring-config.yml.example | 監視設定 |

**使い方**: 必要なexampleファイルをコピーして `deploy-config.yml` にリネーム

### docs/ ディレクトリ詳細

#### 設計ドキュメント（01-07）

プロジェクトごとに**必ず埋める**ファイル。

| ファイル | 必須 | 役割 | いつ作成？ |
|---------|:----:|------|-----------|
| 01_IDEA_SHEET.md | ★ | アイデア整理・MVP定義 | Phase 1 |
| 02_REQUIREMENTS.md | ★ | 要件定義（機能/非機能） | Phase 2 |
| 03_BASIC_DESIGN.md | ★ | 基本設計（技術スタック・DB・API） | Phase 3 |
| 04_DETAILED_DESIGN.md | ★ | 詳細設計（画面・API仕様） | Phase 4 |
| 05_DESIGN_CHECKLIST.md | ★ | 設計完了チェック（全項目OKで実装開始） | Phase 5 |
| 06_SITEMAP.md | ★ | 画面一覧・遷移図 | Phase 3-4 |
| 07_UI_PATTERN_RULES.md | ★ | UIパターン定義 | Phase 4 |

#### Claude用ルール

Claudeに**読ませるだけ**のファイル。編集不要。

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| DISCUSSION_MODE_RULES.md | ★ | 壁打ち・設計相談時の振る舞いルール |
| CLAUDE_CODE_OPERATION.md | | Claude Code運用ルール |
| IMPLEMENTATION_CHECKLIST.md | | 実装時チェックリスト |
| VERIFICATION_CHECKLIST.md | | 検証時チェックリスト |

#### 運用ドキュメント

プロジェクト運用中に**随時更新**するファイル。

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| PROJECT_CONFIG.md | ★ | プロジェクト設定・メンバー一覧 |
| NEXT_ACTION.md | ★ | 次回作業・決定事項 |
| SECRETS.md | | シークレット管理ガイド |
| TEST_INTEGRATION.md | | テスト統合ガイド |

#### サブディレクトリ

| ディレクトリ | 必須 | 役割 |
|-------------|:----:|------|
| checklists/ | | 技術別チェックリスト（Prisma, React等） |
| error-logs/ | | エラーログ記録 |
| onboarding/ | | 新メンバー向けドキュメント |
| secrets-candidates/ | | シークレット候補ファイル（マスク済み） |

### scripts/ ディレクトリ詳細

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| check-member.js | ★ | メンバー登録チェック（npm postinstall, pre-commit） |
| discover-secrets.sh | | シークレット候補検出（Unix） |
| discover-secrets.ps1 | | シークレット候補検出（Windows） |
| bootstrap-secrets.sh | | GitHub Secrets一括登録 |
| generate-sitemap.sh | | サイトマップ生成 |

### .github/ ディレクトリ詳細

#### workflows/（GitHub Actions）

| ファイル | 必須 | 役割 | トリガー |
|---------|:----:|------|---------|
| guardian-ai.yml | ★ | Phase 1: コード品質チェック | PR作成時 |
| test.yml | ★ | Phase 2: テスト実行 | Phase 1完了後 |
| deploy.yml | ★ | Phase 3: 自動デプロイ | Phase 2完了後 |
| monitoring.yml | ★ | Phase 4: 監視設定 | Phase 3完了後 |
| member-check.yml | ★ | メンバー登録チェック | PR作成時 |

#### 自動化モジュール

| ディレクトリ | 役割 |
|-------------|------|
| guardian-ai/ | コード品質チェック・自動修正 |
| test-automation/ | テスト実行・レポート生成 |
| deploy-automation/ | 9種類のプロバイダーへのデプロイ |
| monitoring-automation/ | 5種類の監視ツール連携 |

### .husky/ ディレクトリ詳細

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| pre-commit | ★ | コミット前チェック（メンバー登録確認） |

---

## 3. 使い方

### 誰が・いつ・何を使う？

| 担当 | フェーズ | やること | Claudeに読ませるファイル |
|------|---------|---------|------------------------|
| 設計者 | アイデア | 01_IDEA_SHEET.md を作成 | なし or DESIGNER_MODE_RULES.md |
| 設計者+AI | 要件定義 | 02_REQUIREMENTS.md 作成 | DESIGNER_MODE_RULES.md |
| 設計者+AI | 基本設計 | 03_BASIC_DESIGN.md 作成 | DESIGNER_MODE_RULES.md |
| 設計者+AI | 詳細設計 | 04_DETAILED_DESIGN.md 作成 | DESIGNER_MODE_RULES.md |
| 設計者+AI | 最終確認 | 05_DESIGN_CHECKLIST.md 確認 | DESIGNER_MODE_RULES.md |
| Claude Code | 実装 | コードを書く | CLAUDE.md（自動で読み込み） |
| 実装者 | 検証 | VERIFICATION_CHECKLIST.md 確認 | なし（手動確認） |

### 新規プロジェクトを始める場合

Claude Code または Claude AI に以下のように伝えてください：

```
docs/DISCUSSION_MODE_RULES.md を読んで、新規プロジェクトの設計を手伝って
```

Claude がナビゲートしながら、以下の設計ドキュメントを一緒に埋めていきます：

| 順番 | ファイル | 内容 |
|------|---------|------|
| 01 | IDEA_SHEET.md | アイデア整理・MVP定義 |
| 02 | REQUIREMENTS.md | 要件定義 |
| 03 | BASIC_DESIGN.md | 基本設計 |
| 04 | DETAILED_DESIGN.md | 詳細設計 |
| 05 | DESIGN_CHECKLIST.md | 設計完了チェック |
| 06 | SITEMAP.md | 画面一覧・遷移図 |
| 07 | UI_PATTERN_RULES.md | UIパターン定義 |

### 実装を進める場合

設計が完了したら（05のチェックリストが全てOK）：

```
CLAUDE.md を読んで、実装を進めて
```

### 困ったとき・相談したいとき

```
docs/DISCUSSION_MODE_RULES.md を読んで、相談に乗って
```

### 実装開始の条件（重要）

**以下が全部揃うまで実装を開始しない**

- [ ] 01_IDEA_SHEET.md が記入済み
- [ ] 02_REQUIREMENTS.md が作成済み
- [ ] 03_BASIC_DESIGN.md が作成済み
- [ ] 04_DETAILED_DESIGN.md が作成済み
- [ ] 05_DESIGN_CHECKLIST.md が全項目OK

### CI/CDセットアップ

#### 前提条件

- GitHub アカウント
- Git がインストールされている
- Node.js 20以上がインストールされている
- GitHub CLI（`gh`コマンド）がインストールされている（推奨）

#### ステップ1: テンプレートから新規リポジトリを作成

**方法A: GitHub UIを使う**

1. https://github.com/issey-hedell/template にアクセス
2. 「Use this template」ボタンをクリック
3. 「Create a new repository」を選択
4. リポジトリ名を入力（例: `my-new-project`）
5. 「Create repository」をクリック

**方法B: GitHub CLIを使う**

```bash
gh repo create my-new-project --template issey-hedell/template --public
cd my-new-project
```

#### ステップ2: 設定ファイルを作成

**デプロイ設定（Phase 3用）**

使用するプロバイダーに応じて、対応するサンプルファイルをコピー：

```bash
# 例: Vercel を使う場合
cp deploy-config.vercel.example deploy-config.yml

# 例: AWS S3 を使う場合
cp deploy-config.aws-s3.example deploy-config.yml

# 例: Netlify を使う場合
cp deploy-config.netlify.example deploy-config.yml
```

**利用可能なプロバイダー設定サンプル**:

| プロバイダー | ファイル名 | 用途 |
|-------------|-----------|------|
| Vercel | `deploy-config.vercel.example` | Next.js, React SPA |
| AWS S3 | `deploy-config.aws-s3.example` | 静的サイト + CloudFront |
| AWS Amplify | `deploy-config.aws-amplify.example` | フルスタックアプリ |
| AWS EC2 | `deploy-config.aws-ec2.example` | SSH経由サーバーデプロイ |
| AWS ECS | `deploy-config.aws-ecs.example` | コンテナデプロイ |
| Netlify | `deploy-config.netlify.example` | JAMstack |
| Firebase | `deploy-config.firebase.example` | Firebase Hosting |
| Cloudflare | `deploy-config.cloudflare.example` | Cloudflare Pages |
| Custom | `deploy-config.custom.example` | カスタムコマンド |

**監視設定（Phase 4用）**

```bash
cp monitoring-config.yml.example monitoring-config.yml
```

#### ステップ3: GitHub Secrets を設定

使用するプロバイダーに応じて、必要なSecretsを設定します。詳細は QUICK_START.md を参照してください。

---

## 4. 設計ワークフロー

### 開発フロー

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

## 5. Phase 1-4 の概要

### Phase 1: Guardian AI（コード品質チェック）

- **トリガー**: PR作成時
- **ワークフロー**: `.github/workflows/guardian-ai.yml`
- **モジュール**: `.github/guardian-ai/`
- **機能**: コード品質チェック・自動修正

### Phase 2: Test Automation（テスト自動化）

- **トリガー**: Phase 1完了後
- **ワークフロー**: `.github/workflows/test.yml`
- **モジュール**: `.github/test-automation/`
- **機能**: テスト実行・レポート生成

### Phase 3: Deploy Automation（デプロイ自動化）

- **トリガー**: Phase 2完了後
- **ワークフロー**: `.github/workflows/deploy.yml`
- **モジュール**: `.github/deploy-automation/`
- **機能**: 9種類のプロバイダーへのデプロイ
  - Vercel, AWS S3, AWS Amplify, AWS EC2, AWS ECS
  - Netlify, Firebase, Cloudflare, Custom

### Phase 4: Monitoring Automation（監視自動化）

- **トリガー**: Phase 3完了後
- **ワークフロー**: `.github/workflows/monitoring.yml`
- **モジュール**: `.github/monitoring-automation/`
- **機能**: 5種類の監視ツール連携
  - Sentry, Datadog, New Relic, CloudWatch, Custom

---

## 6. その他

### テスト構成について

このテンプレートには2つのテストディレクトリがあります：

- `.github/test-automation/tests/`: テンプレート自体の動作確認用（触らない）
- `tests/` or `src/`: 実プロジェクトのテストコード（ここに書く）

詳細は docs/TEST_INTEGRATION.md を参照してください。

### 自動チェック機能

#### メンバー登録チェック

未登録メンバーは以下のタイミングでブロックされます：

| タイミング | 動作 |
|-----------|------|
| `npm install` | 警告表示 |
| `git commit` | 拒否 |
| GitHub PR | CI失敗 → マージ不可 |

#### 解除方法

`docs/PROJECT_CONFIG.md` の「メンバー別設定」に自分を追加してください。

### 新メンバーの方へ

1. `docs/onboarding/ONBOARDING_CHECKLIST.md` を開く
2. チェックリストに沿って初回セットアップ
3. `docs/PROJECT_CONFIG.md` に自分を登録
4. 完了後、作業開始

**登録しないと commit できません！**

### 新規プロジェクト作成時のチェックリスト

#### 必須ファイル（最小構成）

```
✅ CLAUDE.md
✅ README.md
✅ QUICK_GUIDE.md
✅ package.json
✅ .gitignore
✅ docs/
   ✅ 01_IDEA_SHEET.md
   ✅ 02_REQUIREMENTS.md
   ✅ 03_BASIC_DESIGN.md
   ✅ 04_DETAILED_DESIGN.md
   ✅ 05_DESIGN_CHECKLIST.md
   ✅ 06_SITEMAP.md
   ✅ 07_UI_PATTERN_RULES.md
   ✅ DISCUSSION_MODE_RULES.md
   ✅ PROJECT_CONFIG.md
   ✅ NEXT_ACTION.md
✅ scripts/
   ✅ check-member.js
✅ .husky/
   ✅ pre-commit
✅ .github/
   ✅ workflows/*.yml
   ✅ guardian-ai/
   ✅ test-automation/
   ✅ deploy-automation/
   ✅ monitoring-automation/
```

#### オプショナルファイル

```
☐ QUICK_START.md           # CI/CD詳細設定が必要な場合
☐ DESIGN_WORKFLOW.md       # ワークフロー詳細説明が必要な場合
☐ TROUBLESHOOTING.md       # トラブルシューティングが必要な場合
☐ verify.sh                # 検証スクリプトが必要な場合
☐ deploy-config.*.example  # 使用するプロバイダーのみ
☐ monitoring-config.yml.example
☐ docs/checklists/         # 技術別チェックリストが必要な場合
☐ docs/error-logs/         # エラーログ管理が必要な場合
☐ docs/onboarding/         # オンボーディングが必要な場合
☐ docs/secrets-candidates/ # シークレット管理が必要な場合
```

### ファイル分類早見表

#### 対象者別

| 対象 | ファイル |
|------|---------|
| 人間（初回） | README.md → QUICK_GUIDE.md |
| 人間（設定） | PROJECT_CONFIG.md, NEXT_ACTION.md |
| Claude（設計） | DISCUSSION_MODE_RULES.md |
| Claude（実装） | CLAUDE.md |
| GitHub Actions | .github/workflows/*.yml |

#### フェーズ別

| フェーズ | 使用ファイル |
|---------|-------------|
| 設計 | 01-07_*.md, DISCUSSION_MODE_RULES.md |
| 実装 | CLAUDE.md, IMPLEMENTATION_CHECKLIST.md |
| テスト | VERIFICATION_CHECKLIST.md |
| 運用 | NEXT_ACTION.md, error-logs/ |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-13 | 初版作成（既存ドキュメントを統合） |
