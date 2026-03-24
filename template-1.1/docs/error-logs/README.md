# エラーログ

> このフォルダには開発中に発生したエラーとその解決方法を記録します。
> 同じエラーが再発した際の参照用として活用してください。

---

## ログ一覧

| 日付 | ファイル | 内容 |
| 2026-01-15 | [2026-01-15_guardian-ai---code-quality-check.md](./2026-01-15_guardian-ai---code-quality-check.md) | Guardian AI - Code Quality Check 失敗 |
|------|----------|------|
| 2026-01-13 | [2026-01-13_admin-dashboard.md](./2026-01-13_admin-dashboard.md) | 管理画面実装時のエラー |

---

## 記録フォーマット

新しいエラーログを追加する際は、以下のフォーマットに従ってください：

### ファイル命名規則

```
YYYY-MM-DD_[機能名またはセッション名].md
```

例：
- `2026-01-13_admin-dashboard.md`
- `2026-01-14_billing-integration.md`
- `2026-01-15_auth-fix.md`

### エラー記録フォーマット

```markdown
## [エラータイトル]

**発生箇所**: [ファイルパス:行番号]

**エラーメッセージ**:
```
[エラーメッセージをそのまま貼り付け]
```

**原因**: [エラーの原因]

**解決方法**: [どのように解決したか]

**関連コミット**: [コミットハッシュ（あれば）]

**備考**: [その他の注意点]
```

---

## カテゴリ別インデックス

### 認証関連
- （記録なし）

### データベース関連
- [2026-01-13] Supabase接続エラー - Tenant or user not found

### ビルド関連
- [2026-01-13] TypeScriptビルドエラー - billing API
- [2026-01-13] TypeScriptエラー - Category descriptionフィールド
- [2026-01-13] TypeScriptエラー - AuditLog entityId必須
- [2026-01-13] TypeScriptエラー - React Fragment key
- [2026-01-13] TypeScriptエラー - unknown型をReactNodeに

### デプロイ関連
- （記録なし）

---

## よくあるエラーと解決パターン

### 1. Next.js - Dynamic Server Usage

**エラー**:
```
Error: Dynamic server usage: Route /xxx couldn't be rendered statically because it used `cookies`.
```

**解決方法**:
- `export const dynamic = 'force-dynamic'` を追加
- または `export const revalidate = 0` を設定

### 2. Prisma - Client not generated

**エラー**:
```
Error: @prisma/client did not initialize yet.
```

**解決方法**:
```bash
npx prisma generate
```

### 3. TypeScript - Module not found

**エラー**:
```
Cannot find module '@/xxx' or its corresponding type declarations.
```

**解決方法**:
- `tsconfig.json` の `paths` 設定を確認
- パスエイリアスが正しく設定されているか確認

### 4. Vercel - Environment Variables

**エラー**:
```
Error: Environment variable "XXX" is missing
```

**解決方法**:
```bash
# 環境変数を設定
echo "値" | npx vercel env add XXX production

# 再デプロイ
npx vercel --prod --force
```

### 5. Supabase - Connection URL形式

**エラー**:
```
Error: Tenant or user not found
```

**解決方法**:
Supabaseの接続URLは2種類ある：
1. **直接接続** (`db.xxx.supabase.co`) - IPv6必要、ローカルでは動かないことが多い
2. **Shared Pooler** (`aws-X-region.pooler.supabase.com`) - IPv4対応、推奨

```bash
# Shared Pooler形式を使用（推奨）
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 6. Prismaスキーマとの不整合

**症状**: APIで存在しないフィールドやリレーションを参照してTypeScriptエラー

**解決方法**:
1. `prisma/schema.prisma`を必ず確認
2. `npx prisma db pull`で最新のスキーマを取得
3. リレーション名は`@relation`で定義された名前を使用

```prisma
// スキーマ例
model Category {
  autoMappings      FieldMapping[] @relation("AutoCategory")
  confirmedMappings FieldMapping[] @relation("ConfirmedCategory")
}

// APIでの使用
_count: {
  select: {
    autoMappings: true,       // OK
    confirmedMappings: true,  // OK
    fieldMappings: true,      // NG - 存在しない
  }
}
```

---

## エラー追加時の手順

1. 新しいファイルを作成: `YYYY-MM-DD_機能名.md`
2. テンプレートをコピーして内容を記入
3. このREADME.mdの「ログ一覧」に追加
4. 該当するカテゴリにインデックスを追加
5. 普遍的な内容であれば`checklists/`や`IMPLEMENTATION_CHECKLIST.md`にも反映
