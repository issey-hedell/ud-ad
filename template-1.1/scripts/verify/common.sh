#!/bin/bash
# 共通関数

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# セクションヘッダー
print_section() {
  echo ""
  echo "========================================"
  echo " $1"
  echo "========================================"
}

# コマンド実行（結果を表示）
run_command() {
  local cmd="$1"
  local description="$2"

  echo ""
  log_info "$description"
  echo "  $ $cmd"
  echo ""

  if eval "$cmd"; then
    log_success "$description: 成功"
    return 0
  else
    log_error "$description: 失敗"
    return 1
  fi
}

# ファイル存在チェック
check_file() {
  local file="$1"
  if [ -f "$file" ]; then
    return 0
  else
    return 1
  fi
}

# ディレクトリ存在チェック
check_dir() {
  local dir="$1"
  if [ -d "$dir" ]; then
    return 0
  else
    return 1
  fi
}

# 結果サマリー
print_summary() {
  local passed=$1
  local failed=$2
  local total=$((passed + failed))

  echo ""
  echo "========================================"
  echo " 検証結果サマリー"
  echo "========================================"
  echo ""
  echo -e "  成功: ${GREEN}$passed${NC} / $total"
  echo -e "  失敗: ${RED}$failed${NC} / $total"
  echo ""

  if [ $failed -eq 0 ]; then
    log_success "すべての検証が成功しました"
    return 0
  else
    log_error "$failed 件の検証が失敗しました"
    return 1
  fi
}
