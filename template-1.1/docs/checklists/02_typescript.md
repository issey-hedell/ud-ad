# TypeScript チェックリスト

> TypeScriptの型定義と型エラー回避に関する注意点をまとめています。

---

## 実装前チェック

### 1. 型定義の確認

**チェック項目**:
- [ ] Prismaで生成された型を使用しているか
- [ ] `any` 型を使用していないか
- [ ] `unknown` 型をJSXで直接renderしていないか
- [ ] 型アサーション(`as`)で無理やり型を変換していないか

---

### 2. 禁止パターン

#### `any` 型の使用禁止

```typescript
// NG
const handleSelect = (item: any) => { ... }
const data = response as any;

// OK
const handleSelect = (item: Session) => { ... }
const data: ApiResponse = response;
```

#### 型アサーションでのエラー回避禁止

```typescript
// NG - 型エラーを握りつぶす
const value = someData as unknown as TargetType;

// OK - 型ガードで安全に分岐
function isTargetType(data: unknown): data is TargetType {
  return typeof data === 'object' && data !== null && 'property' in data;
}

if (isTargetType(someData)) {
  const value = someData;
}
```

---

### 3. unknown型の処理

`unknown`型の値をJSXで表示する場合は変換が必要。

**チェック項目**:
- [ ] `unknown`型をそのままJSXに渡していないか
- [ ] 適切な型変換を行っているか

**よくある間違い**:
```tsx
// NG: unknown型をそのまま表示
<pre>{log.beforeJson}</pre>  // beforeJsonがunknown型

// OK: String()でラップ
<pre>{String(JSON.stringify(log.beforeJson, null, 2))}</pre>

// OK: 型ガードで処理
{typeof log.beforeJson === 'object' && (
  <pre>{JSON.stringify(log.beforeJson, null, 2)}</pre>
)}
```

---

### 4. enum型の使用

Prismaのenum型を使用する場合の注意点。

**よくある間違い**:
```typescript
// NG: 文字列をそのまま渡す
const where = { action: actionFilter };  // actionFilterがstring型

// OK: 型アサーションで明示
const where = action && action !== 'all'
  ? { action: action as 'create' | 'update' | 'delete' }
  : {};
```

---

## よくあるエラー

### Type 'unknown' is not assignable to type 'ReactNode'

**エラーメッセージ**:
```
error TS2322: Type 'unknown' is not assignable to type 'ReactNode'
```

**原因**: `unknown`型の値をJSXで直接表示しようとしている

**解決方法**:
```tsx
// String()でラップ
{String(JSON.stringify(value, null, 2))}
```

---

### Property 'xxx' does not exist on type

**エラーメッセージ**:
```
error TS2339: Property 'xxx' does not exist on type 'YYY'
```

**原因**:
- 型定義に存在しないプロパティにアクセス
- Prismaスキーマとコードの不一致

**解決方法**:
1. 型定義を確認（Prismaの場合は`schema.prisma`）
2. 正しいプロパティ名に修正
3. 必要なら型定義を拡張

---

### Argument of type 'X' is not assignable to parameter of type 'Y'

**エラーメッセージ**:
```
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```

**解決方法**:
1. 期待される型を確認
2. 型ガードで型を絞り込む
3. どうしても必要な場合のみ型アサーション（`as`）を使用

---

## ベストプラクティス

### 1. 型定義ファイルの整理

```
src/types/
├── index.ts      # 共通の型をre-export
├── user.ts       # User関連の型
├── api.ts        # API関連の型
└── [domain].ts   # ドメイン別の型
```

### 2. ユーティリティ型の活用

```typescript
// Partial: 全プロパティをオプショナルに
type UpdateUser = Partial<User>;

// Pick: 特定のプロパティのみ抽出
type UserName = Pick<User, 'id' | 'name'>;

// Omit: 特定のプロパティを除外
type UserWithoutPassword = Omit<User, 'password'>;
```

### 3. 型ガード関数

```typescript
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}
```
