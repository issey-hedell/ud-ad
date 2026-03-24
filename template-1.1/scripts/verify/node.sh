#!/bin/bash
# Node.js プロジェクト検証スクリプト

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/common.sh"

PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

PASSED=0
FAILED=0

print_section "Node.js プロジェクト検証"

cd "$PROJECT_ROOT"

# package.json の確認
if ! check_file "package.json"; then
  log_error "package.json が見つかりません"
  exit 1
fi

# 1. 依存関係の確認
print_section "1. 依存関係チェック"
if check_dir "node_modules"; then
  log_success "node_modules: 存在"
  ((PASSED++))
else
  log_warning "node_modules が見つかりません。npm install を実行してください"
  ((FAILED++))
fi

# 2. Lint チェック
print_section "2. Lint チェック"
if npm run lint --if-present 2>/dev/null; then
  log_success "Lint: 成功"
  ((PASSED++))
else
  log_error "Lint: 失敗"
  ((FAILED++))
fi

# 3. 型チェック
print_section "3. 型チェック"
if npm run type-check --if-present 2>/dev/null; then
  log_success "型チェック: 成功"
  ((PASSED++))
else
  if grep -q '"type-check"' package.json 2>/dev/null; then
    log_error "型チェック: 失敗"
    ((FAILED++))
  else
    log_warning "type-check スクリプトが定義されていません"
  fi
fi

# 4. ビルド
print_section "4. ビルド"
if npm run build --if-present 2>/dev/null; then
  log_success "ビルド: 成功"
  ((PASSED++))
else
  if grep -q '"build"' package.json 2>/dev/null; then
    log_error "ビルド: 失敗"
    ((FAILED++))
  else
    log_warning "build スクリプトが定義されていません"
  fi
fi

# 5. テスト実行
print_section "5. テスト実行"
if npm test --if-present 2>/dev/null; then
  log_success "テスト: 成功"
  ((PASSED++))
else
  if grep -q '"test"' package.json 2>/dev/null; then
    log_error "テスト: 失敗"
    ((FAILED++))
  else
    log_warning "test スクリプトが定義されていません"
  fi
fi

# 6. 開発サーバー起動テスト（オプション）
print_section "6. 開発サーバー起動テスト"
if grep -q '"dev"' package.json 2>/dev/null; then
  log_info "開発サーバーを起動中..."

  # バックグラウンドで起動
  npm run dev &
  SERVER_PID=$!
  sleep 5

  # localhost:3000 へのアクセス確認
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    log_success "開発サーバー起動: 成功"
    ((PASSED++))
  else
    log_warning "開発サーバー起動: 応答なし（ポート3000）"
  fi

  # サーバー停止
  kill $SERVER_PID 2>/dev/null || true
else
  log_warning "dev スクリプトが定義されていません"
fi

# 結果サマリー
print_summary $PASSED $FAILED
exit $?
