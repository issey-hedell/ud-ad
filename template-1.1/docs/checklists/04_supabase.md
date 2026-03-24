# Supabase チェックリスト

> Supabaseを使用する際の注意点をまとめています。

---

## 実装前チェック

### 1. 接続URL形式

**必ずShared Pooler形式を使用**

**チェック項目**:
- [ ] DATABASE_URLがShared Pooler形式か
- [ ] DIRECT_URLがマイグレーション用に設定されているか
- [ ] ポート番号が正しいか（6543/5432）

**URL形式**:
```bash
# NG: 直接接続（IPv6必要、多くの環境で動作しない）
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"

# OK: Shared Pooler形式（IPv4対応、推奨）
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

**ポート番号**:
| ポート | 用途 | 使用場面 |
|-------|------|---------|
| 6543 | pgbouncer経由 | アプリケーション（DATABASE_URL） |
| 5432 | 直接接続 | マイグレーション（DIRECT_URL） |

**確認方法**:
Supabaseダッシュボード → Settings → Database → Connection Pooling → "Using the Shared Pooler"

---

### 2. 認証設定

**チェック項目**:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`が設定されているか
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されているか
- [ ] サーバーサイドで`SUPABASE_SERVICE_ROLE_KEY`を使用しているか

**環境変数**:
```bash
# クライアントサイド（公開OK）
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# サーバーサイド（秘密）
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

---

### 3. 認証トークンの取得

**チェック項目**:
- [ ] Cookieからアクセストークンを取得しているか
- [ ] トークンが存在しない場合のエラーハンドリングがあるか

**実装パターン**:
```typescript
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

async function getUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return user;
}
```

---

## よくあるエラー

### Tenant or user not found

**エラーメッセージ**:
```
Error: Tenant or user not found
```

**原因**:
- DATABASE_URLが直接接続形式（IPv6が必要）
- ローカル環境やVercelからIPv6で接続できない

**解決方法**:
Shared Pooler形式のURLに変更：
```bash
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

### Invalid API key

**エラーメッセージ**:
```
Error: Invalid API key
```

**原因**:
- 環境変数が設定されていない
- 古いAPIキーを使用している

**解決方法**:
1. Supabaseダッシュボードで最新のAPIキーを確認
2. 環境変数を更新
3. サーバーを再起動

---

## ベストプラクティス

### 1. 環境別クライアント作成

```typescript
// lib/supabase/client.ts（クライアントサイド）
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// lib/supabase/server.ts（サーバーサイド）
import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
```

### 2. 権限チェックパターン

```typescript
async function verifyAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) return null;

  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== 'admin') return null;

  return dbUser;
}
```

### 3. リージョン確認

東京リージョンの場合：
```
aws-1-ap-northeast-1.pooler.supabase.com
```

他のリージョンはSupabaseダッシュボードで確認。
