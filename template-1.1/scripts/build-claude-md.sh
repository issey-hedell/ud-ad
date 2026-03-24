#!/bin/bash
# CLAUDE.md ビルドスクリプト
# 使用方法: ./build-claude-md.sh <backend> <frontend> <orm>

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLAUDE_RULES_DIR="$PROJECT_ROOT/claude-rules"
OUTPUT_FILE="$PROJECT_ROOT/CLAUDE.md"

BACKEND=${1:-"none"}
FRONTEND=${2:-"none"}
ORM=${3:-"none"}

echo "CLAUDE.md を生成中..."
echo "  バックエンド: $BACKEND"
echo "  フロントエンド: $FRONTEND"
echo "  ORM: $ORM"

# ベースファイルから開始
if [ -f "$CLAUDE_RULES_DIR/base.md" ]; then
  cat "$CLAUDE_RULES_DIR/base.md" > "$OUTPUT_FILE"
else
  echo "警告: base.md が見つかりません。既存のCLAUDE.mdを使用します。"
  exit 0
fi

# バックエンドルールを追加
if [ "$BACKEND" != "none" ] && [ -f "$CLAUDE_RULES_DIR/backend/$BACKEND.md" ]; then
  echo "" >> "$OUTPUT_FILE"
  cat "$CLAUDE_RULES_DIR/backend/$BACKEND.md" >> "$OUTPUT_FILE"
fi

# フロントエンドルールを追加
if [ "$FRONTEND" != "none" ] && [ -f "$CLAUDE_RULES_DIR/frontend/$FRONTEND.md" ]; then
  echo "" >> "$OUTPUT_FILE"
  cat "$CLAUDE_RULES_DIR/frontend/$FRONTEND.md" >> "$OUTPUT_FILE"
fi

# ORMルールを追加
if [ "$ORM" != "none" ] && [ -f "$CLAUDE_RULES_DIR/orm/$ORM.md" ]; then
  echo "" >> "$OUTPUT_FILE"
  cat "$CLAUDE_RULES_DIR/orm/$ORM.md" >> "$OUTPUT_FILE"
fi

echo "CLAUDE.md を生成しました: $OUTPUT_FILE"
