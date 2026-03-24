# SQLAlchemy チェックリスト

## 実装前チェック

### 1. モデル定義
- [ ] テーブル名が __tablename__ で指定されているか
- [ ] カラム型が適切か
- [ ] リレーション定義が正しいか（relationship, ForeignKey）
- [ ] インデックスが必要な箇所に index=True があるか

### 2. クエリ
- [ ] N+1 問題を回避しているか（joinedload, selectinload）
- [ ] 必要なカラムのみ取得しているか
- [ ] フィルタ条件が適切か

### 3. セッション管理
- [ ] セッションの生成・クローズが適切か
- [ ] commit / rollback が適切か
- [ ] with 文や Depends で自動管理されているか

### 4. トランザクション
- [ ] 複数の更新操作がトランザクション内で行われているか
- [ ] エラー時にロールバックされるか

## よくあるパターン

### N+1 回避
```python
# NG: N+1
users = db.query(User).all()
for user in users:
    print(user.posts)  # 毎回クエリ

# OK: joinedload
from sqlalchemy.orm import joinedload
users = db.query(User).options(joinedload(User.posts)).all()
```

### セッション管理（FastAPI）
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### トランザクション
```python
try:
    user = User(name="test")
    db.add(user)
    db.flush()  # IDを取得

    post = Post(title="test", author_id=user.id)
    db.add(post)

    db.commit()
except Exception:
    db.rollback()
    raise
```

### バルク操作
```python
# 大量インサート
db.bulk_insert_mappings(User, [
    {"name": "user1"},
    {"name": "user2"},
])
db.commit()
```

## 実装後チェック

- [ ] マイグレーションが正しく生成されるか
- [ ] クエリログでN+1が発生していないか
- [ ] テストでデータが正しく永続化されるか
