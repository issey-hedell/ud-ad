/**
 * 共通ユーティリティ
 */

// DOM操作ヘルパー
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * 要素を作成
 * @param {string} tag - タグ名
 * @param {Object} attrs - 属性
 * @param {Array} children - 子要素
 * @returns {HTMLElement}
 */
function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

/**
 * 要素を表示
 * @param {HTMLElement} el
 */
function show(el) {
  el.classList.remove('hidden');
}

/**
 * 要素を非表示
 * @param {HTMLElement} el
 */
function hide(el) {
  el.classList.add('hidden');
}

/**
 * 表示/非表示をトグル
 * @param {HTMLElement} el
 */
function toggle(el) {
  el.classList.toggle('hidden');
}

/**
 * ローディング表示
 * @param {HTMLElement} container
 */
function showLoading(container) {
  const loader = createElement('div', { className: 'loading' });
  container.innerHTML = '';
  container.appendChild(loader);
}

/**
 * アラートを表示
 * @param {string} message
 * @param {string} type - success, error, warning
 * @param {HTMLElement} container
 */
function showAlert(message, type, container) {
  const alert = createElement('div', { className: `alert alert-${type}` }, [message]);
  container.prepend(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * フォームデータをオブジェクトに変換
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function formToObject(form) {
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

/**
 * デバウンス
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 日付フォーマット
 * @param {Date|string} date
 * @param {string} format
 * @returns {string}
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

// エクスポート（モジュールとして使用する場合）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $,
    $$,
    createElement,
    show,
    hide,
    toggle,
    showLoading,
    showAlert,
    formToObject,
    debounce,
    formatDate,
  };
}
