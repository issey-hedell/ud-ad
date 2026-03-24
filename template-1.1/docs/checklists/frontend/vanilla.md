# Vanilla JavaScript チェックリスト

## 実装前チェック

### 1. コード品質
- [ ] var を使用していないか（const/let を使用）
- [ ] グローバル変数を最小限にしているか
- [ ] 関数が単一責任になっているか

### 2. DOM操作
- [ ] innerHTML に未サニタイズの値を代入していないか
- [ ] イベントリスナーが適切に管理されているか
- [ ] 不要なDOM操作を繰り返していないか

### 3. API連携
- [ ] fetch のエラーハンドリングがあるか
- [ ] ローディング状態を表示しているか
- [ ] ネットワークエラー時の対応があるか

### 4. セキュリティ
- [ ] XSS 対策（textContent使用、DOMPurify）
- [ ] CSRF 対策
- [ ] 機密情報をJSに埋め込んでいないか

## よくあるパターン

### API呼び出し
```javascript
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### イベント委譲
```javascript
document.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    handleDelete(e.target.dataset.id);
  }
});
```

### 要素作成
```javascript
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else el.setAttribute(key, value);
  });
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  });
  return el;
}
```

## 実装後チェック

- [ ] ブラウザコンソールにエラーがないか
- [ ] 異なるブラウザで動作確認したか
- [ ] モバイル表示を確認したか
- [ ] パフォーマンス（読み込み時間）を確認したか
