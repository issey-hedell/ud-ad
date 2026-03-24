# 実装チェックリスト

> **重要**: 新機能実装やコード修正前に、このチェックリストを確認してください。
> 過去のエラーから学んだ注意点をまとめています。

---

## 実装前チェック

### 1. Prismaスキーマ確認

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

**よくある間違い**:
```typescript
// NG: スキーマにないフィールドを参照
const data = { description: "xxx" };  // descriptionがモデルにない場合

// NG: リレーション名が間違っている
include: { fieldMappings: true }  // 正しくは autoMappings, confirmedMappings

// OK: スキーマ通りの名前を使用
include: {
  _count: {
    select: {
      autoMappings: true,
      confirmedMappings: true,
    },
  },
}
```

---

### 2. 型定義の確認

**チェック項目**:
- [ ] Prismaで生成された型を使用しているか
- [ ] `any`型を使用していないか
- [ ] `unknown`型をJSXで直接renderしていないか

**よくある間違い**:
```typescript
// NG: unknown型をそのままrender
<pre>{log.beforeJson}</pre>  // beforeJsonがunknown型

// OK: String()でラップ
<pre>{String(JSON.stringify(log.beforeJson, null, 2))}</pre>
```

---

### 3. 必須フィールドの確認

データ作成時に必須フィールドが抜けていないか確認：

**チェック項目**:
- [ ] `create`時に必須フィールドが全て含まれているか
- [ ] 削除操作のログ記録時にIDを事前取得しているか

**よくある間違い**:
```typescript
// NG: entityIdを取得せずにログ作成
await prisma.record.delete({ where: { key } });
await prisma.auditLog.create({
  data: {
    entityId: ???,  // 削除後はIDが取得できない
  },
});

// OK: 削除前にIDを取得
const record = await prisma.record.delete({ where: { key } });
await prisma.auditLog.create({
  data: {
    entityId: record.id,  // 削除結果からIDを取得
  },
});
```

---

### 4. React コンポーネント

**チェック項目**:
- [ ] `map`で複数要素を返す場合、`key`が設定されているか
- [ ] 条件付きレンダリングで複数要素を返す場合、`React.Fragment`に`key`があるか

**よくある間違い**:
```tsx
// NG: Fragmentにkeyがない
{items.map((item) => (
  <>
    <tr>...</tr>
    {expanded && <tr>...</tr>}
  </>
))}

// OK: React.Fragmentにkeyを設定
import React from "react";

{items.map((item) => (
  <React.Fragment key={item.id}>
    <tr>...</tr>
    {expanded && <tr>...</tr>}
  </React.Fragment>
))}
```

---

## 環境・接続設定

### 5. Supabase接続URL

**必ずShared Pooler形式を使用**：

```bash
# NG: 直接接続（IPv6必要、多くの環境で動作しない）
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# OK: Shared Pooler形式（IPv4対応、推奨）
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

**ポート番号**:
- `6543`: pgbouncer経由（アプリケーション用）
- `5432`: 直接接続（マイグレーション用）

---

### 6. 環境変数

**チェック項目**:
- [ ] 新しい環境変数を追加した場合、Vercelにも設定したか
- [ ] `.env.example`を更新したか

```bash
# Vercelに環境変数を追加
echo "値" | npx vercel env add VARIABLE_NAME production

# 再デプロイ
npx vercel --prod --force
```

---

## API実装

### 7. 未実装機能の参照

DBにまだ存在しないテーブル/フィールドを参照していないか確認：

**チェック項目**:
- [ ] 参照しているテーブルがPrismaスキーマに存在するか
- [ ] 参照しているフィールドがモデルに存在するか

**よくある間違い**:
```typescript
// NG: まだ存在しないテーブルを参照
const plans = await prisma.plan.findMany();  // Planテーブルが未作成

// OK: 機能が未実装の場合はスタブ化
export async function GET() {
  return NextResponse.json({
    plans: [],
    message: 'Coming soon'
  });
}
```

---

### 8. 権限チェック

管理者機能では必ず権限チェックを実装：

```typescript
async function verifyAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) return null;

  // Supabaseで認証
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user) return null;

  // DBでroleチェック
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== 'admin') return null;

  return dbUser;
}
```

---

## デプロイ前チェック

### 9. TypeScriptビルド

```bash
# ビルドエラーがないか確認
npm run build
```

**チェック項目**:
- [ ] TypeScriptエラーがないか
- [ ] 未使用のインポートがないか
- [ ] `any`型の使用がないか

---

### 10. 動作確認

**チェック項目**:
- [ ] ローカルで動作確認したか
- [ ] エッジケース（空データ、大量データ）をテストしたか
- [ ] エラーハンドリングが適切か

---

## ハルシネーション防止

### AI（Claude）との協業時の注意

1. **スキーマの確認を依頼する**
   - 「このモデルのフィールドを確認して」
   - 「prisma/schema.prismaを読んで」

2. **存在確認を依頼する**
   - 「このテーブルはDBに存在する？」
   - 「このリレーション名は正しい？」

3. **型エラーの原因を確認する**
   - 「このTypeScriptエラーの原因は？」
   - 「スキーマと比較して何が間違っている？」

---

## クイックリファレンス

| シチュエーション | 確認事項 |
|-----------------|----------|
| 新しいAPI作成 | Prismaスキーマ確認、型定義確認 |
| DB操作追加 | フィールド名・リレーション名確認 |
| 削除機能実装 | 削除前にID取得してログ記録 |
| mapでrender | key属性の設定 |
| unknown型表示 | String()でラップ |
| 環境変数追加 | Vercelにも設定 |
| Supabase接続 | Shared Pooler URL使用 |

---

## 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| `error-logs/README.md` | エラーログ一覧 |
| `NEXT_ACTION.md` | 次回作業・決定事項 |
| `CLAUDE.md` | 開発ルール・規約 |
| `checklists/` | カテゴリ別チェックリスト |
