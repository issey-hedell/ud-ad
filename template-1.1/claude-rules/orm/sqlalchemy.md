## SQLAlchemy コーディング規約

### 禁止パターン

**1. 生SQL直書き（パラメータ化なし）**
```python
# NG
db.execute(f"SELECT * FROM users WHERE id = {user_id}")

# OK
db.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user_id})
# または
db.query(User).filter(User.id == user_id).first()
```

**2. N+1 クエリ**
```python
# NG
users = db.query(User).all()
for user in users:
    print(user.posts)  # 毎回クエリが発行される

# OK
from sqlalchemy.orm import joinedload
users = db.query(User).options(joinedload(User.posts)).all()
```

**3. セッションのコミット忘れ**
```python
# NG
db.add(user)
# commit なし

# OK
db.add(user)
db.commit()
db.refresh(user)
```

**4. セッションのクローズ忘れ**
```python
# NG
def get_users():
    db = SessionLocal()
    return db.query(User).all()
    # セッションがクローズされない

# OK
def get_users():
    db = SessionLocal()
    try:
        return db.query(User).all()
    finally:
        db.close()
```

### 設計原則

**1. モデル定義**
```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")
```

**2. セッション管理（FastAPI）**
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 使用
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
```

**3. マイグレーション（Alembic）**
```bash
# マイグレーション作成
alembic revision --autogenerate -m "add user table"

# マイグレーション実行
alembic upgrade head
```

### 推奨パターン

- `joinedload` / `selectinload` でN+1を回避
- 必要なカラムのみ `query(User.id, User.name)` で取得
- 大量データには `yield_per()` でバッチ処理
- 複雑なクエリはリポジトリパターンで抽象化
