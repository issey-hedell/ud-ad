# Prisma / データベース チェックリスト

> Prismaを使用したデータベース操作時の注意点をまとめています。

---

## 実装前チェック

### 1. スキーマ確認

新しいAPIやデータベース操作を実装する前に**必ず**確認：

```bash
# スキーマファイルを確認
cat prisma/schema.prisma

# または最新のスキーマをDBから取得
npx prisma db pull
```

**チェック項目**:
- [ ] 使用するモデルが存在するか
- [ ] フィールド名が正確か（typoがないか）
- [ ] フィールドが必須（required）か任意（optional）か
- [ ] リレーション名が`@relation`で定義された名前と一致するか
- [ ] enum値が正しいか

---

### 2. リレーション名の確認

Prismaのリレーション名は `@relation` で定義された名前を使用する必要がある。

**チェック項目**:
- [ ] `include` で使用するリレーション名がスキーマと一致するか
- [ ] `_count` で使用するリレーション名がスキーマと一致するか

**よくある間違い**:
```typescript
// NG: スキーマにないリレーション名
include: { fieldMappings: true }

// OK: @relationで定義された名前を使用
include: {
  autoMappings: true,      // @relation("AutoCategory")
  confirmedMappings: true, // @relation("ConfirmedCategory")
}
```

**スキーマ例**:
```prisma
model Category {
  autoMappings      FieldMapping[] @relation("AutoCategory")
  confirmedMappings FieldMapping[] @relation("ConfirmedCategory")
}
```

---

### 3. 必須フィールドの確認

データ作成時に必須フィールドが抜けていないか確認。

**チェック項目**:
- [ ] `create` 時に必須フィールドが全て含まれているか
- [ ] 削除操作時にログ記録が必要な場合、削除前にIDを取得しているか

**よくある間違い**:
```typescript
// NG: 削除後はIDが取得できない
await prisma.record.delete({ where: { key } });
await prisma.auditLog.create({
  data: {
    entityId: ???,  // 削除後は取得不可
  },
});

// OK: 削除結果からIDを取得
const record = await prisma.record.delete({ where: { key } });
await prisma.auditLog.create({
  data: {
    entityId: record.id,
  },
});
```

---

### 4. マイグレーション

**チェック項目**:
- [ ] スキーマ変更後に `npx prisma generate` を実行したか
- [ ] 本番反映前に `npx prisma migrate deploy` を実行したか
- [ ] マイグレーションファイルがコミットされているか

```bash
# 開発環境でマイグレーション作成
npx prisma migrate dev --name [migration_name]

# 本番環境でマイグレーション適用
npx prisma migrate deploy

# クライアント再生成
npx prisma generate
```

---

## よくあるエラー

### Property does not exist on type 'PrismaClient'

**エラーメッセージ**:
```
error TS2339: Property 'xxx' does not exist on type 'PrismaClient'
```

**原因**:
- モデルがスキーマに存在しない
- `npx prisma generate` が実行されていない

**解決方法**:
1. `prisma/schema.prisma` でモデルを確認
2. `npx prisma generate` を実行
3. それでもダメなら `node_modules/.prisma` を削除して再生成

---

### Object literal may only specify known properties

**エラーメッセージ**:
```
error TS2353: Object literal may only specify known properties, and 'xxx' does not exist in type
```

**原因**: スキーマに存在しないフィールドを指定している

**解決方法**:
1. `prisma/schema.prisma` で正確なフィールド名を確認
2. 存在しないフィールドの参照を削除

---

### Client not generated

**エラーメッセージ**:
```
Error: @prisma/client did not initialize yet.
```

**解決方法**:
```bash
npx prisma generate
```

---

## ベストプラクティス

### 1. トランザクション使用

複数の操作を一括で行う場合：
```typescript
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.auditLog.create({ ... }),
]);
```

### 2. 選択的フィールド取得

必要なフィールドのみ取得してパフォーマンス向上：
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    // passwordは取得しない
  },
});
```

### 3. ページネーション

大量データの取得時：
```typescript
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```
