# ディレクトリ構成ガイド

このドキュメントでは、テンプレートリポジトリの全体構成と各ファイルの役割を説明します。

---

## 全体構成

```
template/
├── README.md                    # プロジェクト概要（人間用）
├── CLAUDE.md                    # Claude実装ルール（Claude用）
├── package.json                 # npm設定
├── .gitignore                   # Git除外設定
├── .cc-rules.md                 # Claude Code追加ルール
│
├── config-examples/             # デプロイ・監視設定例
│   ├── deploy-aws-amplify.yml
│   ├── deploy-aws-ec2.yml
│   ├── deploy-aws-ecs.yml
│   ├── deploy-aws-s3.yml
│   ├── deploy-cloudflare.yml
│   ├── deploy-custom.yml
│   ├── deploy-firebase.yml
│   ├── deploy-netlify.yml
│   ├── deploy-vercel.yml
│   └── monitoring.yml
│
├── guides/                      # ガイドドキュメント
│   ├── QUICK_GUIDE.md           # 1枚で分かる使い方
│   ├── QUICK_START.md           # CI/CDセットアップガイド
│   ├── DESIGN_WORKFLOW.md       # 設計ワークフロー説明
│   └── TROUBLESHOOTING.md       # トラブルシューティング
│
├── docs/                        # プロジェクトドキュメント
│   ├── [設計ドキュメント 01-07]
│   ├── [Claude用ルール]
│   ├── [運用ドキュメント]
│   └── [サブディレクトリ]
│
├── scripts/                     # 自動化スクリプト
│   ├── check-member.js
│   ├── verify.sh
│   └── ...
│
├── .github/                     # GitHub設定・CI/CD
│   ├── workflows/
│   ├── guardian-ai/
│   ├── test-automation/
│   ├── deploy-automation/
│   └── monitoring-automation/
│
└── .husky/                      # Git hooks
```

---

## ルートファイル詳細

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| README.md | ★ | プロジェクト概要。新規参加者が最初に見るファイル |
| CLAUDE.md | ★ | 実装時のルール。Claude Codeが自動読み込み |
| package.json | ★ | npm設定。postinstallでメンバーチェック実行 |
| .gitignore | ★ | Git除外設定 |
| .cc-rules.md | | Claude Code追加ルール |

---

## config-examples/ ディレクトリ詳細

デプロイ・監視の設定例ファイル。必要なものをコピーして使用。

| ファイル | 用途 |
|---------|------|
| deploy-vercel.yml | Vercel向け |
| deploy-aws-s3.yml | AWS S3 + CloudFront向け |
| deploy-aws-amplify.yml | AWS Amplify向け |
| deploy-aws-ec2.yml | AWS EC2向け（SSH経由） |
| deploy-aws-ecs.yml | AWS ECS向け（コンテナ） |
| deploy-netlify.yml | Netlify向け |
| deploy-firebase.yml | Firebase Hosting向け |
| deploy-cloudflare.yml | Cloudflare Pages向け |
| deploy-custom.yml | カスタムコマンド |
| monitoring.yml | 監視設定 |

**使い方**: 必要なファイルをコピーして `deploy-config.yml` にリネーム

---

## guides/ ディレクトリ詳細

ガイドドキュメント。人間が読むための説明書。

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| QUICK_GUIDE.md | ★ | 設計〜実装フローの概要。1枚で全体像を把握 |
| QUICK_START.md | | CI/CDセットアップの詳細手順 |
| DESIGN_WORKFLOW.md | | 設計ワークフローの詳細説明 |
| TROUBLESHOOTING.md | | よくある問題と解決方法 |

---

## docs/ ディレクトリ詳細

### 設計ドキュメント（01-07）

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

### Claude用ルール

Claudeに**読ませるだけ**のファイル。編集不要。

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| DISCUSSION_MODE_RULES.md | ★ | 壁打ち・設計相談時の振る舞いルール |
| CLAUDE_CODE_OPERATION.md | | Claude Code運用ルール |
| IMPLEMENTATION_CHECKLIST.md | | 実装時チェックリスト |
| VERIFICATION_CHECKLIST.md | | 検証時チェックリスト |

### 運用ドキュメント

プロジェクト運用中に**随時更新**するファイル。

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| PROJECT_CONFIG.md | ★ | プロジェクト設定・メンバー一覧 |
| NEXT_ACTION.md | ★ | 次回作業・決定事項 |
| SECRETS.md | | シークレット管理ガイド |
| TEST_INTEGRATION.md | | テスト統合ガイド |
| DIRECTORY_STRUCTURE.md | | このファイル |
| PROJECT_STRUCTURE.md | | プロジェクト構造詳細 |

### サブディレクトリ

| ディレクトリ | 必須 | 役割 |
|-------------|:----:|------|
| checklists/ | | 技術別チェックリスト（Prisma, React等） |
| error-logs/ | | エラーログ記録 |
| onboarding/ | | 新メンバー向けドキュメント |
| secrets-candidates/ | | シークレット候補ファイル（マスク済み） |

---

## scripts/ ディレクトリ詳細

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| check-member.js | ★ | メンバー登録チェック（npm postinstall, pre-commit） |
| verify.sh | | リポジトリ検証スクリプト |
| discover-secrets.sh | | シークレット候補検出（Unix） |
| discover-secrets.ps1 | | シークレット候補検出（Windows） |
| bootstrap-secrets.sh | | GitHub Secrets一括登録 |
| generate-sitemap.sh | | サイトマップ生成 |

---

## .github/ ディレクトリ詳細

### workflows/（GitHub Actions）

| ファイル | 必須 | 役割 | トリガー |
|---------|:----:|------|---------|
| guardian-ai.yml | ★ | Phase 1: コード品質チェック | PR作成時 |
| test.yml | ★ | Phase 2: テスト実行 | Phase 1完了後 |
| deploy.yml | ★ | Phase 3: 自動デプロイ | Phase 2完了後 |
| monitoring.yml | ★ | Phase 4: 監視設定 | Phase 3完了後 |
| member-check.yml | ★ | メンバー登録チェック | PR作成時 |

### 自動化モジュール

| ディレクトリ | 役割 |
|-------------|------|
| guardian-ai/ | コード品質チェック・自動修正 |
| test-automation/ | テスト実行・レポート生成 |
| deploy-automation/ | 9種類のプロバイダーへのデプロイ |
| monitoring-automation/ | 5種類の監視ツール連携 |

---

## .husky/ ディレクトリ詳細

| ファイル | 必須 | 役割 |
|---------|:----:|------|
| pre-commit | ★ | コミット前チェック（メンバー登録確認） |

---

## ファイル分類早見表

### 対象者別

| 対象 | ファイル |
|------|---------|
| 人間（初回） | README.md → guides/QUICK_GUIDE.md |
| 人間（設定） | docs/PROJECT_CONFIG.md, docs/NEXT_ACTION.md |
| Claude（設計） | docs/DISCUSSION_MODE_RULES.md |
| Claude（実装） | CLAUDE.md |
| GitHub Actions | .github/workflows/*.yml |

### フェーズ別

| フェーズ | 使用ファイル |
|---------|-------------|
| 設計 | docs/01-07_*.md, docs/DISCUSSION_MODE_RULES.md |
| 実装 | CLAUDE.md, docs/IMPLEMENTATION_CHECKLIST.md |
| テスト | docs/VERIFICATION_CHECKLIST.md |
| 運用 | docs/NEXT_ACTION.md, docs/error-logs/ |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-01-14 | ルート整理（config-examples/, guides/ 新設） |
| 2026-01-13 | 初版作成 |
