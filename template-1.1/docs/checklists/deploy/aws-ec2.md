# AWS EC2 デプロイチェックリスト

## デプロイ前

### インフラ準備
- [ ] EC2 インスタンスが起動しているか
- [ ] セキュリティグループで必要なポートが開いているか
- [ ] SSH 接続が可能か
- [ ] 必要なランタイム（Python/Node.js）がインストールされているか

### アプリケーション準備
- [ ] 環境変数が設定されているか
- [ ] 依存パッケージがインストールされているか
- [ ] データベース接続が確認できるか
- [ ] 静的ファイルが配置されているか

### セキュリティ
- [ ] SSH キーが安全に管理されているか
- [ ] 不要なポートが閉じられているか
- [ ] アプリケーションが root 以外で実行されるか
- [ ] SSL/TLS 証明書が設定されているか

## デプロイ手順

```bash
# 1. SSH接続
ssh -i ~/.ssh/key.pem ec2-user@<IP>

# 2. コード更新
cd /var/www/app
git pull origin main

# 3. 依存関係更新（Python）
source venv/bin/activate
pip install -r requirements.txt

# 4. マイグレーション
alembic upgrade head

# 5. アプリ再起動
sudo systemctl restart app
```

## デプロイ後

### 動作確認
- [ ] アプリケーションが正常に起動しているか
- [ ] ヘルスチェックエンドポイントが応答するか
- [ ] 主要機能が動作するか
- [ ] ログにエラーがないか

### 監視
- [ ] CloudWatch ログが収集されているか
- [ ] アラートが設定されているか
- [ ] リソース使用率を確認したか

## ロールバック手順

```bash
# 1. 前のバージョンに戻す
git checkout <previous-commit>

# 2. 依存関係を前のバージョンに
pip install -r requirements.txt

# 3. 必要に応じてマイグレーションをダウングレード
alembic downgrade -1

# 4. アプリ再起動
sudo systemctl restart app
```
