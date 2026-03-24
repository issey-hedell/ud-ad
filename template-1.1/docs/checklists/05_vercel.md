# Vercel チェックリスト

> Vercelへのデプロイと環境変数管理に関する注意点をまとめています。

---

## 実装前チェック

### 1. 環境変数の設定

**チェック項目**:
- [ ] 必要な環境変数がVercelに設定されているか
- [ ] 環境（Production/Preview/Development）ごとに適切な値が設定されているか
- [ ] 秘密鍵が公開されていないか

**環境変数の確認**:
```bash
# 環境変数一覧
npx vercel env ls

# 環境変数の追加
echo "値" | npx vercel env add VARIABLE_NAME production
echo "値" | npx vercel env add VARIABLE_NAME preview
echo "値" | npx vercel env add VARIABLE_NAME development
```

---

### 2. デプロイ前確認

**チェック項目**:
- [ ] ローカルでビルドが成功するか（`npm run build`）
- [ ] TypeScriptエラーがないか
- [ ] 環境変数がVercelに設定されているか
- [ ] GitHubにコードがプッシュされているか

**ビルド確認**:
```bash
# ローカルでビルドテスト
npm run build

# 問題がなければデプロイ
npx vercel --prod
```

---

### 3. 自動デプロイ vs 手動デプロイ

プロジェクトによって異なるため、`PROJECT_CONFIG.md`で確認。

**手動デプロイの場合**:
```bash
# GitHubにプッシュ
git add -A && git commit -m "メッセージ" && git push

# Vercelにデプロイ（これを忘れると反映されない）
npx vercel --prod
```

---

## よくあるエラー

### Environment variable "XXX" is missing

**エラーメッセージ**:
```
Error: Environment variable "XXX" is missing
```

**原因**: Vercelに環境変数が設定されていない

**解決方法**:
```bash
# 環境変数を設定
echo "値" | npx vercel env add XXX production

# 再デプロイ
npx vercel --prod --force
```

---

### Build failed

**エラーメッセージ**:
```
Error: Build failed
```

**原因**:
- TypeScriptエラー
- 依存関係の問題
- 環境変数の不足

**解決方法**:
1. ローカルで`npm run build`を実行してエラーを確認
2. エラーを修正
3. 再デプロイ

---

### Dynamic server usage

**エラーメッセージ**:
```
Error: Dynamic server usage: Route /xxx couldn't be rendered statically because it used `cookies`.
```

**原因**: 静的生成できないルートがある

**解決方法**:
```typescript
// ルートファイルに追加
export const dynamic = 'force-dynamic';
// または
export const revalidate = 0;
```

---

## ベストプラクティス

### 1. デプロイ前チェックリスト

```bash
# 1. ビルド確認
npm run build

# 2. 環境変数確認
npx vercel env ls

# 3. デプロイ
npx vercel --prod

# 4. 動作確認
# ブラウザで本番URLを開いて確認
```

### 2. 強制再デプロイ

キャッシュの問題が疑われる場合：
```bash
npx vercel --prod --force
```

### 3. ログの確認

```bash
# ビルドログ
npx vercel logs [deployment-url]

# リアルタイムログ
npx vercel logs [deployment-url] --follow
```

### 4. ロールバック

問題が発生した場合：
```bash
# 直前のデプロイにロールバック
npx vercel rollback
```
