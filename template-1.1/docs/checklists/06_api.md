# API実装 チェックリスト

> Next.js API Routes実装時の注意点をまとめています。

---

## 実装前チェック

### 1. ルート設計

**チェック項目**:
- [ ] RESTfulな命名になっているか
- [ ] 適切なHTTPメソッドを使用しているか
- [ ] 動的ルートのパラメータ名が正しいか

**命名規則**:
```
/api/users           GET（一覧）, POST（作成）
/api/users/[id]      GET（詳細）, PUT（更新）, DELETE（削除）
/api/admin/users     管理者用エンドポイント
```

---

### 2. 権限チェック

**チェック項目**:
- [ ] 認証が必要なエンドポイントで認証チェックがあるか
- [ ] 管理者用エンドポイントで権限チェックがあるか
- [ ] チェック失敗時に適切なステータスコードを返しているか

**実装パターン**:
```typescript
async function verifyAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser(accessToken);
  return user;
}

async function verifyAdmin() {
  const user = await verifyAuth();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== 'admin') return null;

  return dbUser;
}

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
  }
  // ...
}
```

---

### 3. エラーハンドリング

**チェック項目**:
- [ ] try-catchでエラーをキャッチしているか
- [ ] 適切なステータスコードを返しているか
- [ ] エラーログを出力しているか
- [ ] ユーザーに適切なエラーメッセージを返しているか

**実装パターン**:
```typescript
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // バリデーション
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: '名前は必須です' }, { status: 400 });
    }

    // 処理
    const result = await prisma.item.create({ data: { name } });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '処理に失敗しました' },
      { status: 500 }
    );
  }
}
```

---

### 4. 監査ログ

管理操作では監査ログを記録。

**チェック項目**:
- [ ] 作成/更新/削除操作でログを記録しているか
- [ ] 誰が（userId）何を（action, entityType, entityId）したかを記録しているか
- [ ] 変更前後のデータを記録しているか（必要に応じて）

**実装パターン**:
```typescript
// 作成
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'create',
    entityType: 'item',
    entityId: item.id,
    afterJson: { name },
  },
});

// 更新
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'update',
    entityType: 'item',
    entityId: item.id,
    beforeJson: oldData,
    afterJson: newData,
  },
});

// 削除（削除前にIDを取得）
const item = await prisma.item.delete({ where: { id } });
await prisma.auditLog.create({
  data: {
    userId: user.id,
    action: 'delete',
    entityType: 'item',
    entityId: item.id,
    beforeJson: item,
  },
});
```

---

## よくあるエラー

### Route handler did not return a Response

**エラーメッセージ**:
```
Error: Route handler did not return a Response
```

**原因**: ハンドラがResponseを返していない

**解決方法**:
```typescript
// NG: 何も返していない
export async function GET() {
  const data = await fetchData();
  // return がない
}

// OK: Responseを返す
export async function GET() {
  const data = await fetchData();
  return NextResponse.json({ data });
}
```

---

## ベストプラクティス

### 1. ステータスコードの使い分け

| コード | 意味 | 使用場面 |
|--------|------|----------|
| 200 | OK | 成功（GET, PUT, DELETE） |
| 201 | Created | 作成成功（POST） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証が必要 |
| 403 | Forbidden | 権限がない |
| 404 | Not Found | リソースが存在しない |
| 500 | Internal Server Error | サーバーエラー |

### 2. レスポンス形式の統一

```typescript
// 成功
return NextResponse.json({ data: result });
return NextResponse.json({ items: list, total: count });

// エラー
return NextResponse.json({ error: 'エラーメッセージ' }, { status: 4xx });
```

### 3. ページネーション

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({ skip, take: limit }),
    prisma.item.count(),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
```
