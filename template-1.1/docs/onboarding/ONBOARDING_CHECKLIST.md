# 新メンバー オンボーディングチェックリスト

> このチェックリストに沿って初回セットアップを完了してください。
> 完了するまで commit・PR はブロックされます。

---

## 管理者がやること（招待側）

- [ ] GitHubリポジトリに招待
- [ ] Slack/Discord に招待（該当する場合）
- [ ] Vercel チームに招待（該当する場合）
- [ ] このチェックリストのリンクを送付

---

## 新メンバーがやること

### 1. 環境構築

**Windows の場合**:
```powershell
# プロジェクトディレクトリに移動
cd C:\Users\{あなたのユーザー名}\projects

# リポジトリをクローン
git clone {{REPO_URL}}
cd {{PROJECT_NAME}}

# 依存関係インストール
npm install
```

**Mac の場合**:
```bash
# プロジェクトディレクトリに移動
cd ~/projects

# リポジトリをクローン
git clone {{REPO_URL}}
cd {{PROJECT_NAME}}

# 依存関係インストール
npm install
```

- [ ] リポジトリをクローンした
- [ ] `npm install` を実行した
- [ ] 警告メッセージ「初回セットアップが必要です」が表示された

---

### 2. メンバー登録

`docs/PROJECT_CONFIG.md` を開き、「メンバー別設定」テーブルに自分の行を追加：

```markdown
| OSユーザー名 | GitHubユーザー名 | 表示名 | 環境 | プロジェクトパス |
|-------------|-----------------|--------|------|-----------------|
| your_os_username | your_github_username | あなたの名前 | Windows/Mac | あなたのパス |
```

**確認方法**:
- OSユーザー名: 
  - Windows: `echo %USERNAME%` を実行
  - Mac: `whoami` を実行
- GitHubユーザー名: GitHubの右上のアイコンをクリックして確認

- [ ] `docs/PROJECT_CONFIG.md` を開いた
- [ ] 「メンバー別設定」に自分の行を追加した

---

### 3. コミット & プッシュ

**Windows（PowerShell）**:
```powershell
git add docs/PROJECT_CONFIG.md
git commit -m "メンバー登録: {{あなたの名前}}"
git push origin main
```

**Mac（Terminal）**:
```bash
git add docs/PROJECT_CONFIG.md
git commit -m "メンバー登録: {{あなたの名前}}"
git push origin main
```

- [ ] 変更をコミットした
- [ ] プッシュが成功した

---

### 4. ドキュメントを読む

以下のドキュメントを読んでください：

- [ ] `QUICK_GUIDE.md` を読んだ（全体の流れ）
- [ ] `CLAUDE.md` を読んだ（開発ルール）
- [ ] `docs/IMPLEMENTATION_CHECKLIST.md` を読んだ（実装時の注意点）

---

### 5. ローカル動作確認

```bash
npm run dev
```

- [ ] ローカルでアプリが起動した
- [ ] ブラウザで動作確認できた

---

### 6. 管理者に完了報告

以下の情報を管理者に報告してください：

```
【オンボーディング完了報告】

名前: {{あなたの名前}}
OSユーザー名: {{your_os_username}}
GitHubユーザー名: {{your_github_username}}
環境: Windows / Mac

セットアップ完了しました。
```

- [ ] 管理者に完了報告した

---

## 完了！

これで開発を始められます。

次のステップ:
1. `docs/NEXT_ACTION.md` を確認して現在のタスクを把握
2. 担当タスクがあれば着手
3. 不明点があればSlack/Discordで質問

---

## 困ったら

### `npm install` でエラーが出る

```bash
# Node.js のバージョンを確認（18以上が必要）
node -v

# npm キャッシュをクリア
npm cache clean --force
npm install
```

### `git push` で Permission denied

- GitHubにSSHキーが登録されているか確認
- `git remote -v` でURLを確認（HTTPS/SSH）

### その他

Slack/Discord の #help チャンネルで質問してください。
