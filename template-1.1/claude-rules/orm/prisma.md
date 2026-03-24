## Prisma コーディング規約

### 禁止パターン

**1. 生SQLの直接実行（エスケープなし）**
```typescript
// NG
await prisma.$executeRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`);

// OK
await prisma.$executeRaw`SELECT * FROM users WHERE id = ${userId}`;
// または
await prisma.user.findUnique({ where: { id: userId } });
```

**2. N+1 クエリ**
```typescript
// NG
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
}

// OK
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

**3. トランザクション外での複数更新**
```typescript
// NG
await prisma.user.update({ ... });
await prisma.post.update({ ... });

// OK（関連する更新はトランザクションで）
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.post.update({ ... })
]);
```

### 設計原則

**1. スキーマ設計**
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

**2. リレーションの明示**
```prisma
model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int

  @@index([authorId])
}
```

**3. マイグレーション管理**
```bash
# 開発中
npx prisma migrate dev --name add_user_table

# 本番
npx prisma migrate deploy
```

### 推奨パターン

- `include` で必要なリレーションのみ取得
- `select` で必要なフィールドのみ取得
- 大量データには `findMany` + `take` / `skip` でページネーション
- 複雑なクエリは Prisma Client Extensions で抽象化
