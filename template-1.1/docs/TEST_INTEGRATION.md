# テスト統合ガイド

## テストディレクトリの構成

このテンプレートには2つのテストディレクトリがあります：

### 1. `.github/test-automation/tests/`
**用途**: テンプレート自体の動作確認用テスト

- テンプレートの CI/CD パイプラインが正しく動作するか検証
- Phase 1-4 の自動化システムのテスト
- **実プロジェクトでは使用しない**

**テストファイル例**:
```
.github/test-automation/tests/
├── unit/
│   └── sample.test.js       # テンプレート動作確認用
└── e2e/
    └── workflow.spec.js     # CI/CDパイプライン検証用
```

---

### 2. プロジェクトルート（実装用）
**用途**: 実際のプロジェクトのテストコード

新規プロジェクトでは、以下のいずれかの構成でテストを配置してください：

#### パターンA: `tests/` ディレクトリ（推奨）
```
project-root/
├── src/
│   └── your-code.js
├── tests/
│   ├── unit/
│   │   └── your-code.test.js
│   └── e2e/
│       └── app.spec.js
└── package.json
```

#### パターンB: `__tests__/` ディレクトリ（Jest 標準）
```
project-root/
├── src/
│   └── your-code.js
│   └── __tests__/
│       └── your-code.test.js
└── package.json
```

#### パターンC: コロケーション（ファイルと同じ場所）
```
project-root/
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   └── Button.test.jsx
│   └── utils/
│       ├── helper.js
│       └── helper.test.js
└── package.json
```

---

## Test Automation（Phase 2）の設定

### デフォルト設定
`.github/workflows/test.yml` は以下のパスでテストを実行します：

```yaml
# Unit Tests (Vitest)
working-directory: .github/test-automation
run: npm run test:unit

# E2E Tests (Playwright)
working-directory: .github/test-automation
run: npm run test:e2e
```

---

### 実プロジェクトのテストを実行する方法

#### ステップ1: package.json にテストスクリプトを追加

プロジェクトルートの `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

#### ステップ2: test.yml を修正

`.github/workflows/test.yml` に実プロジェクトのテスト実行を追加:

```yaml
      # 既存のテンプレートテスト（Phase 1-4 の動作確認）
      - name: Run template tests
        working-directory: .github/test-automation
        run: |
          npm run test:unit
          npm run test:e2e

      # 実プロジェクトのテスト（新規追加）
      - name: Run project tests
        run: |
          npm run test:unit
          npm run test:e2e
```

#### ステップ3: vitest.config.js を作成

プロジェクトルートに `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js', 'src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage'
    }
  }
});
```

#### ステップ4: playwright.config.js を作成

プロジェクトルートに `playwright.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

---

## 推奨ワークフロー

### 新規プロジェクト立ち上げ時

1. **テンプレートから新規リポジトリ作成**
2. **プロジェクトルートにテストディレクトリ作成**
   ```bash
   mkdir -p tests/unit tests/e2e
   ```
3. **package.json にテストスクリプト追加**
4. **test.yml に実プロジェクトのテスト実行を追加**
5. **テストコードを書き始める**

### テンプレート検証時（開発者向け）

- `.github/test-automation/tests/` のテストは**触らない**
- これはテンプレート自体の CI/CD が動作するか確認するためのもの

---

## トラブルシューティング

### Q: テストが実行されない
A: `package.json` に `test:unit` と `test:e2e` スクリプトがあるか確認してください。

### Q: .github/test-automation/tests/ は削除していい？
A: いいえ。Phase 1-4 の動作確認に必要です。削除すると CI/CD が失敗します。

### Q: 実プロジェクトのテストはどこに書けばいい？
A: `tests/` または `src/` 配下に配置してください（パターンA, B, C から選択）。

---

## まとめ

- `.github/test-automation/tests/` = **テンプレート検証用**（触らない）
- `tests/` または `src/` = **実プロジェクトのテスト**（ここに書く）
- test.yml を修正して、実プロジェクトのテスト実行を追加する
