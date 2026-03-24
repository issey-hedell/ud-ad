# Python / FastAPI チェックリスト

## 実装前チェック

### 1. 型ヒント
- [ ] 関数の引数に型ヒントがあるか
- [ ] 戻り値に型ヒントがあるか
- [ ] Optional / Union は明示されているか

### 2. Pydantic スキーマ
- [ ] リクエスト/レスポンスに Pydantic モデルを使用しているか
- [ ] バリデーションルールが適切か
- [ ] Field() でメタデータを設定しているか

### 3. 依存性注入
- [ ] Depends() を使用しているか
- [ ] DBセッションは deps.py で管理しているか
- [ ] 認証は Depends(get_current_user) で行っているか

### 4. エラーハンドリング
- [ ] HTTPException で適切なステータスコードを返しているか
- [ ] 例外を握りつぶしていないか
- [ ] ログ出力があるか

### 5. セキュリティ
- [ ] SQLインジェクション対策（ORM使用）
- [ ] 認証・認可の確認
- [ ] CORS設定

## よくあるパターン

### エンドポイント
```python
@router.get("/{id}", response_model=ItemResponse)
async def get_item(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ItemResponse:
    item = item_service.get_by_id(db, id)
    if not item:
        raise HTTPException(404, "Item not found")
    return item
```

### サービスレイヤー
```python
class ItemService:
    def get_by_id(self, db: Session, item_id: int) -> Item | None:
        return db.query(Item).filter(Item.id == item_id).first()

    def create(self, db: Session, data: ItemCreate) -> Item:
        item = Item(**data.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
```

## 実装後チェック

- [ ] mypy で型チェックがパスするか
- [ ] ruff/flake8 で Lint エラーがないか
- [ ] pytest でテストがパスするか
- [ ] API ドキュメント（/docs）が正しく表示されるか
