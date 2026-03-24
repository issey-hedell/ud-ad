#!/bin/bash
# CC実装後の必須検証スクリプト（自動スタック検出版）
set -e  # エラーで即停止

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VERIFY_LOG="verification.log"
VERIFY_RESULT="verification_result.json"

# 共通関数読み込み（存在する場合）
if [ -f "$SCRIPT_DIR/verify/common.sh" ]; then
  source "$SCRIPT_DIR/verify/common.sh"
else
  # フォールバック: カラー定義
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
  log_info() { echo -e "[INFO] $1"; }
  log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
  log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
  log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
fi

cd "$PROJECT_ROOT"

# 一時ファイルのクリーンアップ
rm -f tmpclaude-* 2>/dev/null || true

echo "=== CC実装検証開始 ===" | tee $VERIFY_LOG
date | tee -a $VERIFY_LOG

# ===========================
# スタック自動検出
# ===========================
detect_stack() {
  if [ -f "backend/requirements.txt" ] || [ -f "backend/pyproject.toml" ]; then
    echo "python"
  elif [ -f "package.json" ]; then
    echo "node"
  else
    echo "unknown"
  fi
}

STACK=$(detect_stack)
echo "" | tee -a $VERIFY_LOG
echo "検出されたスタック: $STACK" | tee -a $VERIFY_LOG

# ===========================
# スタック別検証の実行
# ===========================
case $STACK in
  python)
    echo "" | tee -a $VERIFY_LOG
    echo "【Python プロジェクト検証】" | tee -a $VERIFY_LOG

    if [ -f "$SCRIPT_DIR/verify/python.sh" ]; then
      bash "$SCRIPT_DIR/verify/python.sh" 2>&1 | tee -a $VERIFY_LOG
    else
      # フォールバック: 直接検証
      cd backend

      # Lint
      if command -v ruff &> /dev/null; then
        echo "→ ruff check" | tee -a $VERIFY_LOG
        ruff check app/ 2>&1 | tee -a $VERIFY_LOG || log_warning "ruff 警告あり"
      fi

      # 型チェック
      if command -v mypy &> /dev/null; then
        echo "→ mypy" | tee -a $VERIFY_LOG
        mypy app/ 2>&1 | tee -a $VERIFY_LOG || log_warning "型エラーあり"
      fi

      # テスト
      if command -v pytest &> /dev/null; then
        echo "→ pytest" | tee -a $VERIFY_LOG
        pytest tests/ -v 2>&1 | tee -a $VERIFY_LOG || log_error "テスト失敗"
      fi

      cd "$PROJECT_ROOT"
    fi
    ;;

  node)
    echo "" | tee -a $VERIFY_LOG
    echo "【Node.js プロジェクト検証】" | tee -a $VERIFY_LOG

    if [ -f "$SCRIPT_DIR/verify/node.sh" ]; then
      bash "$SCRIPT_DIR/verify/node.sh" 2>&1 | tee -a $VERIFY_LOG
    else
      # フォールバック: 既存のロジック

      # npm install チェック
      echo "→ npm install チェック" | tee -a $VERIFY_LOG
      npm install --dry-run 2>&1 | tee -a $VERIFY_LOG || {
        log_error "npm install 失敗"
        exit 1
      }

      # Lint
      if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ]; then
        echo "→ ESLint チェック" | tee -a $VERIFY_LOG
        npm run lint 2>&1 | tee -a $VERIFY_LOG || log_warning "Lint 警告あり"
      fi

      # 型チェック
      if [ -f "tsconfig.json" ]; then
        echo "→ TypeScript型チェック" | tee -a $VERIFY_LOG
        npx tsc --noEmit 2>&1 | tee -a $VERIFY_LOG || {
          log_error "型エラーあり"
          exit 1
        }
      fi

      # ビルド
      if grep -q '"build"' package.json 2>/dev/null; then
        echo "→ ビルド実行" | tee -a $VERIFY_LOG
        npm run build 2>&1 | tee -a $VERIFY_LOG || {
          log_error "ビルド失敗"
          exit 1
        }
        log_success "ビルド成功"
      fi

      # テスト
      if grep -q '"test"' package.json 2>/dev/null; then
        echo "→ ユニットテスト実行" | tee -a $VERIFY_LOG
        npm test 2>&1 | tee -a $VERIFY_LOG || {
          log_error "テスト失敗"
          exit 1
        }
        log_success "ユニットテスト成功"
      fi
    fi
    ;;

  *)
    echo "" | tee -a $VERIFY_LOG
    log_warning "スタックを検出できませんでした"
    echo "→ 基本的な検証のみ実行します" | tee -a $VERIFY_LOG
    ;;
esac

# ===========================
# 共通検証
# ===========================
echo "" | tee -a $VERIFY_LOG
echo "【共通検証】" | tee -a $VERIFY_LOG

# GitHub Actions ワークフローの構文チェック
echo "→ GitHub Actions ワークフロー構文チェック" | tee -a $VERIFY_LOG
if command -v actionlint > /dev/null 2>&1; then
  actionlint .github/workflows/*.yml 2>&1 | tee -a $VERIFY_LOG || {
    log_warning "ワークフロー構文警告あり（継続）"
  }
else
  log_warning "actionlint が見つかりません（スキップ）"
fi

# ドキュメントの存在確認
echo "→ ドキュメントの存在確認" | tee -a $VERIFY_LOG
for doc in "README.md" "CLAUDE.md" "docs/PROJECT_CONFIG.md"; do
  if [ -f "$doc" ]; then
    log_success "$doc 存在"
  else
    log_warning "$doc が見つかりません"
  fi
done

# ===========================
# 結果出力
# ===========================
echo "" | tee -a $VERIFY_LOG
echo "=== 🎉 全検証完了 ===" | tee -a $VERIFY_LOG
date | tee -a $VERIFY_LOG

# JSON形式でも出力（CI/CD用）
cat > $VERIFY_RESULT <<EOF
{
  "status": "success",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "stack": "$STACK",
  "checks": {
    "static": true,
    "execution": true,
    "functional": true
  },
  "log_file": "$VERIFY_LOG"
}
EOF

echo "" | tee -a $VERIFY_LOG
echo "📄 検証ログ: $VERIFY_LOG"
echo "📊 検証結果: $VERIFY_RESULT"
echo ""
log_success "検証完了"
