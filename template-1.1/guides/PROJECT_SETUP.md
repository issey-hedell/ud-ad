# 新規プロジェクト作成ガイド

---

## 概要

このガイドでは、テンプレートから新規プロジェクトを作成する手順を説明します。

---

## 前提条件

- **アプリ版 Claude Code を使用**（VSCode 版は不可）
- GitHub CLI (`gh`) がインストールされている
- GitHub にログイン済み（`gh auth login`）
- テンプレートリポジトリへのアクセス権がある
- **テンプレートのローカルコピーは不要**（GitHub から直接クローン）

### なぜアプリ版？

VSCode の Claude Code はワークスペース内でしか動作しないため、
新規プロジェクト作成のような「フォルダをまたぐ作業」には向いていません。

### GitHub CLI の確認

```powershell
gh --version
gh auth status
```

---

## 作成手順

### 1. アプリ版 Claude Code を起動

プロジェクトを作成したいフォルダで起動（例: `C:\Users\xxx\projects\`）

### 2. 以下を伝える

```
https://github.com/issey-hedell/template の CLAUDE.md を読んで、
新規プロジェクトを作成したい
```

### 3. Claude Code がナビゲート

```
[1] プロジェクト名を聞かれる → 回答
      ↓
[2] Claude Code が自動で以下を実行:
    - GitHub リポジトリ作成
    - テンプレートをクローン（GitHub から直接）
    - リモート接続
      ↓
[3] PROJECT_CONFIG.md にメンバー登録
      ↓
[4] 設計フェーズ開始（01_IDEA_SHEET.md から）
```

---

## 手動で作成する場合

Claude Code を使わずに手動で作成する場合の手順:

### 1. GitHub リポジトリを作成

```powershell
gh repo create issey-hedell/[プロジェクト名] --private --confirm
```

### 2. テンプレートをクローン

```powershell
git clone https://github.com/issey-hedell/template.git [プロジェクト名]
cd [プロジェクト名]
```

### 3. リモートを変更

```powershell
git remote set-url origin https://github.com/issey-hedell/[プロジェクト名].git
```

### 4. 初回プッシュ

```powershell
git push -u origin main
```

### 5. メンバー登録

`docs/PROJECT_CONFIG.md` を開いて、自分の情報を追加:

```markdown
| OSユーザー名 | 表示名 | 環境 | プロジェクトパス |
|-------------|--------|------|-----------------|
| sator | 佐藤 | Windows | C:\Users\sator\projects\[プロジェクト名] |
```

### 6. 設計開始

Claude Code に以下のように伝える:

```
docs/DISCUSSION_MODE_RULES.md を読んで、
01_IDEA_SHEET.md の作成を手伝って
```

---

## プロジェクト作成後のフロー

```
【設計フェーズ】01 → 02 → 03 → 04 → 05 → 06 → 07
      ↓
【実装フェーズ】CLAUDE.md を読んでコーディング
      ↓
【検証フェーズ】VERIFICATION_CHECKLIST.md で確認
      ↓
【ローンチ】
```

詳細は `QUICK_GUIDE.md` を参照。

---

## トラブルシューティング

### `gh` コマンドが見つからない

```powershell
# インストール
winget install GitHub.cli

# または手動でパスを通す
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\GitHub CLI", "User")
```

### 認証エラー

```powershell
gh auth login
```

### テンプレートへのアクセス権がない

リポジトリオーナーにコラボレーター追加を依頼してください。

---

## 関連ドキュメント

- `QUICK_GUIDE.md` - 全体の使い方
- `CLAUDE.md` - Claude Code の設定
- `docs/PROJECT_CONFIG.md` - プロジェクト設定
