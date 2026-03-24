## Vanilla JavaScript コーディング規約

### 禁止パターン

**1. var の使用**
```javascript
// NG
var count = 0;

// OK
const count = 0;
let mutableValue = 0;
```

**2. グローバル変数の乱用**
```javascript
// NG
window.userData = response;

// OK
const state = {
  userData: null
};
```

**3. innerHTML での未サニタイズ代入**
```javascript
// NG
element.innerHTML = userInput;

// OK
element.textContent = userInput;
// または
element.innerHTML = DOMPurify.sanitize(userInput);
```

**4. document.write の使用**
```javascript
// NG
document.write('<div>content</div>');

// OK
const div = document.createElement('div');
div.textContent = 'content';
document.body.appendChild(div);
```

**5. eval の使用**
```javascript
// NG
eval(userInput);

// OK
// eval は使用しない。代替手段を検討
```

### 設計原則

**1. モジュール分割**
```
static/js/
├── api.js          # API呼び出し共通
├── auth.js         # 認証関連
├── utils.js        # ユーティリティ
└── pages/
    ├── login.js    # ページ固有ロジック
    └── dashboard.js
```

**2. イベント委譲**
```javascript
// 動的要素にも対応
document.addEventListener('click', (e) => {
  if (e.target.matches('.delete-btn')) {
    handleDelete(e.target.dataset.id);
  }
});
```

**3. API呼び出しの共通化**
```javascript
// api.js
async function fetchApi(endpoint, options = {}) {
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

  return response.json();
}
```

**4. DOM操作のヘルパー**
```javascript
// utils.js
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') el.className = value;
    else if (key.startsWith('data')) el.dataset[key.slice(4).toLowerCase()] = value;
    else el.setAttribute(key, value);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  });
  return el;
}
```

### 推奨パターン

- 1ファイル = 最大300行
- ES6+ の機能を活用（アロー関数、テンプレートリテラル、分割代入）
- Promiseよりasync/awaitを優先
- 即時実行関数でスコープを限定
