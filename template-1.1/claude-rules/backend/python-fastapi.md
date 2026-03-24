## Python / FastAPI コーディング規約

### 禁止パターン

**1. 型ヒントの省略**
```python
# NG
def get_user(user_id):
    return db.query(User).filter(User.id == user_id).first()

# OK
def get_user(user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()
```

**2. 例外の握りつぶし**
```python
# NG
try:
    do_something()
except:
    pass

# OK
try:
    do_something()
except SpecificError as e:
    logger.error(f"エラー: {e}")
    raise HTTPException(500, str(e))
```

**3. 生SQL直書き**
```python
# NG
db.execute(f"SELECT * FROM users WHERE id = {user_id}")

# OK
db.query(User).filter(User.id == user_id).first()
```

**4. マジックナンバー**
```python
# NG
if status == 1:
    ...

# OK
from app.constants import TaskStatus
if status == TaskStatus.IN_PROGRESS:
    ...
```

**5. 同期関数での I/O ブロック**
```python
# NG（FastAPIの非同期コンテキストで）
def get_data():
    return requests.get(url)  # ブロッキング

# OK
async def get_data():
    async with httpx.AsyncClient() as client:
        return await client.get(url)
```

### 設計原則

**1. レイヤー分離**
```
app/
├── api/          # HTTPリクエスト/レスポンス
├── services/     # ビジネスロジック
├── models/       # DBモデル（SQLAlchemy）
├── schemas/      # 入出力スキーマ（Pydantic）
└── utils/        # ユーティリティ
```

**2. 依存性注入**
```python
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    ...
```

**3. 設定の外部化**
```python
from app.config import settings
settings.DATABASE_URL
```

**4. Pydantic モデルの活用**
```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True
```

### 推奨パターン

- 1ファイル = 最大300行
- 1関数 = 最大50行
- インポート順: stdlib → third-party → local
- 非同期関数は async def を使用
- docstring は関数の目的を簡潔に記載
