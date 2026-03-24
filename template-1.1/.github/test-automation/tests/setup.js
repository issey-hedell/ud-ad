import '@testing-library/jest-dom';

// グローバルなモック設定
global.fetch = vi.fn();

// テスト前のクリーンアップ
beforeEach(() => {
  vi.clearAllMocks();
});
