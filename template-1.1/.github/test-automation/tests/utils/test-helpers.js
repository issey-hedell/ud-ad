/**
 * テスト用のヘルパー関数
 */

/**
 * 指定時間待機
 */
export async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ランダムな文字列を生成
 */
export function randomString(length = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * テストデータを生成
 */
export function generateTestData() {
  return {
    name: `Test ${randomString(8)}`,
    email: `test-${randomString(8)}@example.com`,
    timestamp: new Date().toISOString(),
  };
}
