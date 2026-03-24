#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "プロジェクト初期化ウィザード"
echo "========================================"

# 1. バックエンド選択
echo ""
echo "[1/4] バックエンドを選択してください:"
echo "  1) Python + FastAPI"
echo "  2) Node.js + Express"
echo "  3) Node.js + Next.js (API Routes)"
echo "  4) なし（フロントエンドのみ）"
read -p "選択 (1-4): " BACKEND

case $BACKEND in
  1) BACKEND_STACK="python-fastapi" ;;
  2) BACKEND_STACK="node-express" ;;
  3) BACKEND_STACK="node-nextjs" ;;
  4) BACKEND_STACK="none" ;;
  *) echo "無効な選択です"; exit 1 ;;
esac

# 2. フロントエンド選択
echo ""
echo "[2/4] フロントエンドを選択してください:"
echo "  1) React"
echo "  2) Vue.js"
echo "  3) Vanilla JS"
echo "  4) なし（APIのみ）"
read -p "選択 (1-4): " FRONTEND

case $FRONTEND in
  1) FRONTEND_STACK="react" ;;
  2) FRONTEND_STACK="vue" ;;
  3) FRONTEND_STACK="vanilla" ;;
  4) FRONTEND_STACK="none" ;;
  *) echo "無効な選択です"; exit 1 ;;
esac

# 3. データベース選択
echo ""
echo "[3/4] データベースを選択してください:"
echo "  1) PostgreSQL"
echo "  2) MySQL"
echo "  3) MongoDB"
echo "  4) Supabase"
echo "  5) Firebase"
read -p "選択 (1-5): " DATABASE

case $DATABASE in
  1) DATABASE_STACK="postgresql" ;;
  2) DATABASE_STACK="mysql" ;;
  3) DATABASE_STACK="mongodb" ;;
  4) DATABASE_STACK="supabase" ;;
  5) DATABASE_STACK="firebase" ;;
  *) echo "無効な選択です"; exit 1 ;;
esac

# 4. デプロイ先選択
echo ""
echo "[4/4] デプロイ先を選択してください:"
echo "  1) AWS EC2"
echo "  2) AWS ECS"
echo "  3) Vercel"
echo "  4) Netlify"
echo "  5) その他"
read -p "選択 (1-5): " DEPLOY

case $DEPLOY in
  1) DEPLOY_STACK="aws-ec2" ;;
  2) DEPLOY_STACK="aws-ecs" ;;
  3) DEPLOY_STACK="vercel" ;;
  4) DEPLOY_STACK="netlify" ;;
  5) DEPLOY_STACK="other" ;;
  *) echo "無効な選択です"; exit 1 ;;
esac

# ORM自動選択（バックエンドに依存）
if [ "$BACKEND_STACK" = "python-fastapi" ]; then
  ORM_STACK="sqlalchemy"
elif [ "$BACKEND_STACK" = "node-express" ] || [ "$BACKEND_STACK" = "node-nextjs" ]; then
  echo ""
  echo "[追加] ORMを選択してください:"
  echo "  1) Prisma"
  echo "  2) TypeORM"
  read -p "選択 (1-2): " ORM
  case $ORM in
    1) ORM_STACK="prisma" ;;
    2) ORM_STACK="typeorm" ;;
    *) echo "無効な選択です"; exit 1 ;;
  esac
else
  ORM_STACK="none"
fi

echo ""
echo "========================================"
echo "選択内容の確認"
echo "========================================"
echo "バックエンド: $BACKEND_STACK"
echo "フロントエンド: $FRONTEND_STACK"
echo "データベース: $DATABASE_STACK"
echo "ORM: $ORM_STACK"
echo "デプロイ先: $DEPLOY_STACK"
echo ""
read -p "この設定でよろしいですか？ (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
  echo "キャンセルしました"
  exit 0
fi

echo ""
echo "プロジェクトを初期化しています..."

# 設定をファイルに保存
cat > "$PROJECT_ROOT/.stack-config.json" << EOF
{
  "backend": "$BACKEND_STACK",
  "frontend": "$FRONTEND_STACK",
  "database": "$DATABASE_STACK",
  "orm": "$ORM_STACK",
  "deploy": "$DEPLOY_STACK",
  "initialized": "$(date -Iseconds)"
}
EOF

# バックエンド構造のコピー
if [ "$BACKEND_STACK" != "none" ] && [ -d "$PROJECT_ROOT/stacks/backend/$BACKEND_STACK/structure" ]; then
  echo "バックエンド構造をコピー中..."
  cp -r "$PROJECT_ROOT/stacks/backend/$BACKEND_STACK/structure/"* "$PROJECT_ROOT/" 2>/dev/null || true
fi

# フロントエンド構造のコピー
if [ "$FRONTEND_STACK" != "none" ] && [ -d "$PROJECT_ROOT/stacks/frontend/$FRONTEND_STACK/structure" ]; then
  echo "フロントエンド構造をコピー中..."
  cp -r "$PROJECT_ROOT/stacks/frontend/$FRONTEND_STACK/structure/"* "$PROJECT_ROOT/" 2>/dev/null || true
fi

# チェックリストのコピー
mkdir -p "$PROJECT_ROOT/docs/checklists/active"
echo "チェックリストをコピー中..."

# 共通チェックリスト
if [ -d "$PROJECT_ROOT/docs/checklists/common" ]; then
  cp "$PROJECT_ROOT/docs/checklists/common/"*.md "$PROJECT_ROOT/docs/checklists/active/" 2>/dev/null || true
fi

# スタック固有チェックリスト
for STACK in "$BACKEND_STACK" "$FRONTEND_STACK" "$DATABASE_STACK" "$ORM_STACK" "$DEPLOY_STACK"; do
  if [ "$STACK" != "none" ]; then
    for DIR in backend frontend database orm deploy; do
      if [ -f "$PROJECT_ROOT/stacks/$DIR/$STACK/checklists/"*.md ]; then
        cp "$PROJECT_ROOT/stacks/$DIR/$STACK/checklists/"*.md "$PROJECT_ROOT/docs/checklists/active/" 2>/dev/null || true
      fi
    done
  fi
done

# CLAUDE.md のビルド
echo "CLAUDE.md を生成中..."
bash "$SCRIPT_DIR/build-claude-md.sh" "$BACKEND_STACK" "$FRONTEND_STACK" "$ORM_STACK"

echo ""
echo "========================================"
echo "初期化が完了しました！"
echo "========================================"
echo ""
echo "次のステップ:"
echo "1. docs/PROJECT_CONFIG.md にプロジェクト情報を記入"
echo "2. メンバー登録を行う"
echo "3. 設計フェーズ（01_IDEA_SHEET.md）を開始"
echo ""
echo "設定ファイル: .stack-config.json"
