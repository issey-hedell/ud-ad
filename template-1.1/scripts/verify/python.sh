#!/bin/bash
# Python プロジェクト検証スクリプト

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/common.sh"

PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKEND_DIR="$PROJECT_ROOT/backend"

PASSED=0
FAILED=0

print_section "Python プロジェクト検証"

# バックエンドディレクトリの確認
if ! check_dir "$BACKEND_DIR"; then
  log_error "backend ディレクトリが見つかりません"
  exit 1
fi

cd "$BACKEND_DIR"

# 1. 仮想環境の確認
print_section "1. 環境チェック"
if check_dir "venv" || check_dir ".venv"; then
  log_success "仮想環境: 存在"
  ((PASSED++))
else
  log_warning "仮想環境が見つかりません（venv または .venv）"
fi

# 2. Lint チェック
print_section "2. Lint チェック (ruff)"
if command -v ruff &> /dev/null; then
  if run_command "ruff check app/" "ruff check"; then
    ((PASSED++))
  else
    ((FAILED++))
  fi
else
  log_warning "ruff がインストールされていません"
  ((FAILED++))
fi

# 3. 型チェック
print_section "3. 型チェック (mypy)"
if command -v mypy &> /dev/null; then
  if run_command "mypy app/" "mypy 型チェック"; then
    ((PASSED++))
  else
    ((FAILED++))
  fi
else
  log_warning "mypy がインストールされていません"
  ((FAILED++))
fi

# 4. テスト実行
print_section "4. テスト実行 (pytest)"
if command -v pytest &> /dev/null; then
  if run_command "pytest tests/ -v" "pytest テスト"; then
    ((PASSED++))
  else
    ((FAILED++))
  fi
else
  log_warning "pytest がインストールされていません"
  ((FAILED++))
fi

# 5. サーバー起動テスト
print_section "5. サーバー起動テスト"
if command -v uvicorn &> /dev/null; then
  log_info "uvicorn でサーバーを起動中..."

  # バックグラウンドで起動
  uvicorn app.main:app --host 0.0.0.0 --port 8000 &
  SERVER_PID=$!
  sleep 3

  # ヘルスチェック
  if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    log_success "サーバー起動: 成功"
    ((PASSED++))
  else
    log_error "サーバー起動: 失敗（ヘルスチェック失敗）"
    ((FAILED++))
  fi

  # サーバー停止
  kill $SERVER_PID 2>/dev/null || true
else
  log_warning "uvicorn がインストールされていません"
  ((FAILED++))
fi

# 結果サマリー
print_summary $PASSED $FAILED
exit $?
