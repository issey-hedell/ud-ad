/**
 * API通信モジュール
 */

const API_BASE_URL = '/api/v1';

/**
 * APIリクエスト
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise}
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // 認証トークンがあれば追加
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // bodyがオブジェクトならJSON文字列に変換
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // 401エラーならログインページへ
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    // JSONレスポンスをパース
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.detail || 'エラーが発生しました', response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('ネットワークエラーが発生しました', 0, null);
  }
}

/**
 * APIエラークラス
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * GETリクエスト
 * @param {string} endpoint
 * @param {Object} params - クエリパラメータ
 * @returns {Promise}
 */
async function get(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${endpoint}?${query}` : endpoint;
  return fetchApi(url, { method: 'GET' });
}

/**
 * POSTリクエスト
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
async function post(endpoint, body = {}) {
  return fetchApi(endpoint, { method: 'POST', body });
}

/**
 * PUTリクエスト
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
async function put(endpoint, body = {}) {
  return fetchApi(endpoint, { method: 'PUT', body });
}

/**
 * PATCHリクエスト
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise}
 */
async function patch(endpoint, body = {}) {
  return fetchApi(endpoint, { method: 'PATCH', body });
}

/**
 * DELETEリクエスト
 * @param {string} endpoint
 * @returns {Promise}
 */
async function del(endpoint) {
  return fetchApi(endpoint, { method: 'DELETE' });
}

// API オブジェクト
const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  ApiError,
};

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
