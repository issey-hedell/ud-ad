# 2026-01-13 管理画面実装時のエラーログ

> このファイルは管理画面（Admin Dashboard）実装時に発生したエラーとその解決方法を記録しています。

---

## 概要

| 項目 | 内容 |
|------|------|
| 作業内容 | 管理画面6ページ + API 8エンドポイント実装 |
| エラー件数 | 6件 |
| 主な原因 | DB接続設定、Prismaスキーマ不整合、TypeScript型エラー |

---

## エラー一覧

### 1. Supabase接続エラー - Tenant or user not found

**発生箇所**: データベース接続全般

**エラーメッセージ**:
```
Error: Tenant or user not found
```

**原因**:
`.env`ファイルのDATABASE_URLが古い形式（直接接続URL `db.xxx.supabase.co`）を使用していた。
この形式はIPv6が必要だが、ローカル環境やVercelではIPv4のみのため接続できない。

**解決方法**:
Supabase Shared Connection Pooler形式のURLに変更：
```bash
# 変更前（直接接続 - IPv6必要）
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# 変更後（Shared Pooler - IPv4対応）
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

**備考**:
- Supabaseダッシュボード → Settings → Database → Connection Pooling → "Using the Shared Pooler" で正確なURLを確認
- リージョンは `aws-1-ap-northeast-1`（東京）
- `DATABASE_URL` はポート6543（pgbouncer経由）、`DIRECT_URL` はポート5432（マイグレーション用）

---

### 2. TypeScriptビルドエラー - billing API

**発生箇所**: `src/app/api/billing/*.ts`

**エラーメッセージ**:
```
error TS2339: Property 'plan' does not exist on type 'PrismaClient'
error TS2339: Property 'subscription' does not exist on type 'PrismaClient'
error TS2339: Property 'stripeCustomerId' does not exist on type 'User'
```

**原因**:
billing関連のAPIがまだDBに存在しない`Plan`、`Subscription`テーブル、および`User`テーブルの`stripeCustomerId`フィールドを参照していた。

**解決方法**:
billing APIファイルをスタブ化（一時的に501を返す）：
```typescript
// src/app/api/billing/plans/route.ts
export async function GET() {
  return NextResponse.json({
    plans: [],
    message: 'Billing feature coming soon'
  });
}
```

**備考**:
- billing機能は将来実装予定
- `Plan`、`Subscription`テーブルをPrismaスキーマに追加してマイグレーション実行後、元の実装に戻す

---

### 3. TypeScriptエラー - Category descriptionフィールド

**発生箇所**: `src/app/api/admin/categories/route.ts`

**エラーメッセージ**:
```
error TS2353: Object literal may only specify known properties, and 'description' does not exist in type
```

**原因**:
Categoryモデルには`description`フィールドが存在しない（`type`, `name`, `displayOrder`, `enabled`のみ）。
管理画面のカテゴリAPIで存在しないフィールドを参照しようとしていた。

**解決方法**:
1. `description`フィールドの参照を削除
2. `type`フィールドを追加（cost, revenue, kpiのenum）
3. `fieldMappings`を`autoMappings`と`confirmedMappings`に分けてカウント

```typescript
// 修正後
const categories = await prisma.category.findMany({
  include: {
    _count: {
      select: {
        autoMappings: true,
        confirmedMappings: true,
      },
    },
  },
});
```

**備考**:
- Prismaスキーマを必ず確認してからAPIを実装すること
- `prisma/schema.prisma`がソースオブトゥルース

---

### 4. TypeScriptエラー - AuditLog entityId必須

**発生箇所**: `src/app/api/admin/settings/route.ts`

**エラーメッセージ**:
```
error TS2322: Property 'entityId' is missing in type
```

**原因**:
AuditLogモデルでは`entityId`が必須フィールドだが、DELETEハンドラで削除前にIDを取得していなかった。

**解決方法**:
削除前に対象のIDを取得してから監査ログに記録：
```typescript
// 修正後
const config = await prisma.systemConfig.delete({
  where: { configKey: key },
});

await prisma.auditLog.create({
  data: {
    userId: admin.id,
    action: 'delete',
    entityType: 'system_config',
    entityId: config.id,  // 削除したレコードのIDを使用
    afterJson: { key },
  },
});
```

---

### 5. TypeScriptエラー - React Fragment key

**発生箇所**: `src/app/(admin)/admin/audit-logs/page.tsx`

**エラーメッセージ**:
```
Each child in a list should have a unique "key" prop.
```

**原因**:
複数の`<tr>`を返すためにReact Fragmentを使用していたが、keyが設定されていなかった。

**解決方法**:
`<React.Fragment key={log.id}>`を使用：
```tsx
import React from "react";

{filteredLogs.map((log) => (
  <React.Fragment key={log.id}>
    <tr>...</tr>
    {expandedLog === log.id && <tr>...</tr>}
  </React.Fragment>
))}
```

---

### 6. TypeScriptエラー - unknown型をReactNodeに

**発生箇所**: `src/app/(admin)/admin/audit-logs/page.tsx:182`

**エラーメッセージ**:
```
error TS2322: Type 'unknown' is not assignable to type 'ReactNode'
```

**原因**:
`beforeJson`と`afterJson`が`unknown`型のため、JSX内で直接renderできなかった。

**解決方法**:
`String()`でラップして文字列に変換：
```tsx
// 修正後
<pre>
  {String(JSON.stringify(log.beforeJson, null, 2))}
</pre>
```

---

## 学んだこと・今後の注意点

1. **Supabase接続**: 常にShared Pooler形式のURLを使用する
2. **Prismaスキーマ確認**: API実装前に必ず`prisma/schema.prisma`を確認
3. **リレーション名**: `@relation`で定義された正確な名前を使用
4. **削除操作のログ**: 削除前にIDを取得してから監査ログに記録
5. **React Fragment**: mapで複数要素を返す場合は`<React.Fragment key={id}>`を使用
6. **unknown型**: JSX内で表示する場合は`String()`でラップ
