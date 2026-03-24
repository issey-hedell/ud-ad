## React コーディング規約

### 禁止パターン

**1. React.FC の使用**
```typescript
// NG
export const Component: React.FC<Props> = ({ value }) => { ... }

// OK
export const Component = ({ value }: Props) => { ... }
```

**2. 名前空間インポート（React）**
```typescript
// NG
import React from 'react';
React.useState(0);

// OK
import { useState } from 'react';
useState(0);
```

例外: `<React.Fragment key={id}>` は名前空間インポートが必要

**3. useEffect での直接的な非同期処理**
```typescript
// NG
useEffect(async () => {
  const data = await fetchData();
}, []);

// OK
useEffect(() => {
  const fetchData = async () => {
    const data = await fetch();
  };
  fetchData();
}, []);
```

**4. 配列のインデックスをkeyに使用**
```typescript
// NG
{items.map((item, index) => <Item key={index} />)}

// OK
{items.map((item) => <Item key={item.id} />)}
```

### 設計原則

**1. 共通UIのコンポーネント化**
```
src/components/
├── layout/    # Header, Footer, Layout
├── ui/        # Button, Input, Modal, Toast
└── features/  # 機能別
```

**2. カスタムフックの活用**
```typescript
// ロジックの再利用
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // ...
  return { user, login, logout };
}
```

**3. 状態管理の適切な選択**
- ローカル状態 → useState
- 共有状態 → Context / Zustand / Jotai
- サーバー状態 → TanStack Query / SWR

### 推奨パターン

- 1コンポーネント = 最大300行
- Propsは明示的に型定義
- 条件付きレンダリングは早期リターン
- メモ化は必要な場合のみ（React.memo, useMemo, useCallback）
