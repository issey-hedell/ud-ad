# React チェックリスト

> Reactコンポーネント実装時の注意点をまとめています。

---

## 実装前チェック

### 1. key属性の確認

`map`で要素をレンダリングする場合、必ず一意の`key`が必要。

**チェック項目**:
- [ ] `map`で返す要素に`key`属性が設定されているか
- [ ] `key`の値が一意か（indexは非推奨）
- [ ] 条件付きで複数要素を返す場合、`React.Fragment`に`key`があるか

**よくある間違い**:
```tsx
// NG: keyがない
{items.map((item) => (
  <div>{item.name}</div>
))}

// NG: indexをkeyに使用（順序が変わる可能性がある場合）
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}

// OK: 一意のIDをkeyに使用
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

---

### 2. React.Fragment with key

複数の要素を返す場合で`key`が必要な時は`<React.Fragment>`を使用。

**よくある間違い**:
```tsx
// NG: <>ではkeyを設定できない
{items.map((item) => (
  <>
    <tr>...</tr>
    {expanded && <tr>...</tr>}
  </>
))}

// OK: React.Fragmentでkeyを設定
import React from "react";

{items.map((item) => (
  <React.Fragment key={item.id}>
    <tr>...</tr>
    {expanded && <tr>...</tr>}
  </React.Fragment>
))}
```

---

### 3. コンポーネント定義

**チェック項目**:
- [ ] `React.FC`を使用していないか（非推奨）
- [ ] propsの型が明示されているか
- [ ] 不要な`import React from 'react'`がないか

**よくある間違い**:
```tsx
// NG: React.FCは非推奨
export const Component: React.FC<Props> = ({ value }) => { ... }

// OK: 直接propsの型を指定
export const Component = ({ value }: Props) => { ... }

// OK: 分割代入で明示
interface Props {
  value: string;
  onClick: () => void;
}

export const Component = ({ value, onClick }: Props) => {
  return <button onClick={onClick}>{value}</button>;
};
```

---

### 4. hooks使用時の注意

**チェック項目**:
- [ ] useEffectの依存配列が正しく設定されているか
- [ ] 条件分岐の中でhooksを呼び出していないか
- [ ] useStateの初期値の型が正しいか

**よくある間違い**:
```tsx
// NG: 依存配列が空（fetchLogsが変更されても再実行されない）
useEffect(() => {
  fetchLogs();
}, []);

// NG: 条件分岐内でhooksを使用
if (condition) {
  const [state, setState] = useState(0);  // エラー
}

// OK: 依存配列を正しく設定
useEffect(() => {
  fetchLogs();
}, [actionFilter, page]);  // 依存する値を列挙
```

---

## よくあるエラー

### Each child in a list should have a unique "key" prop

**エラーメッセージ**:
```
Warning: Each child in a list should have a unique "key" prop.
```

**原因**: `map`で返される要素に`key`属性がない

**解決方法**:
```tsx
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}
```

---

### Cannot update a component while rendering a different component

**エラーメッセージ**:
```
Warning: Cannot update a component (`Parent`) while rendering a different component (`Child`)
```

**原因**: レンダリング中に別コンポーネントのstateを更新している

**解決方法**:
```tsx
// NG: レンダリング中にstateを更新
const Child = ({ setParentState }) => {
  setParentState(newValue);  // レンダリング中に呼び出し
  return <div>...</div>;
};

// OK: useEffectで更新
const Child = ({ setParentState }) => {
  useEffect(() => {
    setParentState(newValue);
  }, []);
  return <div>...</div>;
};
```

---

## ベストプラクティス

### 1. コンポーネントサイズ

- 1コンポーネント = 最大300行を目安
- 300行を超えたら分割を検討
- ロジックはカスタムフックに分離

### 2. カスタムフックの活用

```tsx
// hooks/useUsers.ts
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  return { users, loading };
};

// Component.tsx
const Component = () => {
  const { users, loading } = useUsers();
  // ...
};
```

### 3. 条件付きレンダリング

```tsx
// 短絡評価
{isLoading && <Spinner />}

// 三項演算子
{isLoading ? <Spinner /> : <Content />}

// 早期リターン
if (isLoading) return <Spinner />;
return <Content />;
```
