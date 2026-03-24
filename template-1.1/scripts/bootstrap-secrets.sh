#!/usr/bin/env bash
set -euo pipefail

# bootstrap-secrets.sh
# Usage:
#   ./scripts/bootstrap-secrets.sh --org my-org --file .env.secrets [--dry-run]

ORG=""
FILE=".env.secrets"
DRY_RUN=false

show_help(){
  cat <<EOF
Usage: $0 --org ORG --file FILE [--dry-run]
  --org ORG      : GitHub organization
  --file FILE    : file containing KEY=VALUE pairs (no quotes), values kept locally
  --dry-run      : show commands without executing
  --help         : show this help

This script reads KEY=VALUE lines and (optionally) calls 'gh secret set NAME --org ORG -b "VALUE"'
Make sure you have 'gh' authenticated and the account has permission to set org secrets.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --org) ORG="$2"; shift 2;;
    --file) FILE="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    --help) show_help; exit 0;;
    *) echo "Unknown arg: $1"; show_help; exit 1;;
  esac
done

if [ -z "$ORG" ]; then
  echo "--org is required"; show_help; exit 1
fi

if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"; exit 1
fi

echo "Reading keys from $FILE"

# parse lines
while IFS= read -r line || [ -n "$line" ]; do
  # skip empty and comments
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi
  if [[ "$line" =~ ^([A-Za-z0-9_\-]+)[[:space:]]*=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    raw_value="${BASH_REMATCH[2]}"
    # Trim leading spaces
    value="$(echo "$raw_value" | sed -E "s/^\s+//; s/\s+$//")"

    echo "Key: $key"

    if [ "$DRY_RUN" = true ]; then
      echo "DRY RUN - gh secret set $key --org $ORG -b '***REDACTED***'"
    else
      echo "Registering $key into org $ORG..."
      # Use gh CLI to set secret
      printf "%s" "$value" | gh secret set "$key" --org "$ORG" -b -
      echo "Registered: $key"
    fi
  else
    echo "Skipping invalid line: $line"
  fi
done < "$FILE"

echo "Completed. Remember not to commit $FILE or any file that contains raw secret values."
