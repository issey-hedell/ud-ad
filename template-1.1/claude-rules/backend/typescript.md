## TypeScript コーディング規約

### 禁止パターン

**1. `any` 型の使用**
```typescript
// NG
const data = response as any;

// OK
const data: ApiResponse = response;
```

**2. 型アサーションでのエラー回避**
```typescript
// NG
const value = someData as unknown as TargetType;

// OK
if (isTargetType(someData)) {
  const value = someData;
}
```

**3. 非nullアサーション演算子の乱用**
```typescript
// NG
const name = user!.name;

// OK
if (user) {
  const name = user.name;
}
// または
const name = user?.name ?? 'デフォルト';
```

### 設計原則

**1. 型定義の集約**
```
src/types/
├── user.ts
├── api.ts
└── [domain].ts
```

**2. 設定・定数の外部化**
- APIエンドポイント → config
- 環境依存の値 → 環境変数
- マジックナンバー → 定数

**3. ユーティリティ型の活用**
```typescript
// Partial, Required, Pick, Omit などを活用
type UserUpdate = Partial<User>;
type UserBasic = Pick<User, 'id' | 'name'>;
```

### 推奨パターン

- 1ファイル = 最大300行
- 使われないコードは即削除
- インポート順序: 外部 → 内部 → 相対
- 明示的な型注釈を優先（推論可能でも）
