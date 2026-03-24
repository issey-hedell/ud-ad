#!/usr/bin/env bash
set -euo pipefail

# discover-secrets.sh
# Usage:
#   From the repository root (or any path):
#     ./scripts/discover-secrets.sh --base-dir ../ --copy
#   Default base dir is the parent directory (..)

BASE_DIR=..
COPY=false
OUT_DIR="docs/secrets-candidates"
PATTERNS=(".env" ".env.local" ".env.*" "*.env" "secrets" "*.secret" "*.yml" "*.yaml" "*.json" "*.conf" "docker-compose*.yml" ".github/workflows/*.yml")
GREP_TERMS=("DATABASE_URL" "SUPABASE" "VERCEL" "SENTRY" "API_KEY" "API_SECRET" "NEXT_PUBLIC_" "PAT" "GITHUB_TOKEN" "TOKEN" "SERVICE_ROLE" "GA_MEASUREMENT_ID")

show_help(){
  cat <<EOF
Usage: $0 [--base-dir DIR] [--copy] [--out DIR] [--help]
  --base-dir DIR  : directory to scan (default: ..)
  --copy          : copy sanitized candidate files into ${OUT_DIR}
  --out DIR       : output directory for candidates (default: ${OUT_DIR})
  --help          : show this help

This script searches for files that likely contain secrets and prints a candidates.json and sanitized copies.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-dir) BASE_DIR="$2"; shift 2;;
    --copy) COPY=true; shift;;
    --out) OUT_DIR="$2"; shift 2;;
    --help) show_help; exit 0;;
    *) echo "Unknown arg: $1"; show_help; exit 1;;
  esac
done

mkdir -p "${OUT_DIR}"
CANDIDATES_JSON="${OUT_DIR}/candidates.json"
> "$CANDIDATES_JSON"

echo "Scanning ${BASE_DIR} for candidate files..."

# find candidate files
mapfile -t FILES < <(find "${BASE_DIR}" -type f \( $(printf -- '-iname "%s" -o ' "${PATTERNS[@]}") -false \) 2>/dev/null | sort -u)

# fallback: search by content if filename patterns found none
if [ ${#FILES[@]} -eq 0 ]; then
  echo "No candidate filenames matched; falling back to content search..."
  mapfile -t FILES < <(grep -RIl --exclude-dir="node_modules" --exclude-dir=".git" -e "$(IFS='|'; echo "${GREP_TERMS[*]}")" "${BASE_DIR}" || true)
fi

echo "Found ${#FILES[@]} candidate files. Processing..."

jq -n '{candidates: []}' > "$CANDIDATES_JSON"

for f in "${FILES[@]}"; do
  # skip files inside this repo's docs/secrets-candidates to avoid loops
  if [[ "$f" == *"docs/secrets-candidates"* ]]; then
    continue
  fi

  # search for keys in file
  keys=()
  while IFS= read -r line; do
    # find KEY= value patterns and common var names
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z0-9_\-]+)[[:space:]]*=[[:space:]]*(.*)$ ]]; then
      k="${BASH_REMATCH[1]}"
      keys+=("$k")
    else
      # grep for tokens like DATABASE_URL etc.
      for term in "${GREP_TERMS[@]}"; do
        if echo "$line" | grep -qi "$term"; then
          # attempt to extract an uppercase-like token around it
          token=$(echo "$line" | grep -oE '\b[A-Z0-9_]{4,}\b' | head -n1 || true)
          if [ -n "$token" ]; then
            keys+=("$token")
          fi
        fi
      done
    fi
  done < <(sed -n '1,200p' "$f")

  # unique keys
  IFS=$'\n' read -r -d '' -a uniq_keys < <(printf "%s\n" "${keys[@]}" | awk '!x[$0]++' && printf '\0') || true

  # sanitized copy
  rel=$(realpath --relative-to=. "$f" 2>/dev/null || printf "%s" "$f")
  dest="${OUT_DIR}/${rel}.masked"
  mkdir -p "$(dirname "$dest")"
  # mask values for KEY= formats
  sed -E 's/^([[:space:]]*[A-Za-z0-9_\-]+[[:space:]]*=)[[:space:]]*(.*)$/\1<REDACTED>/' "$f" > "$dest" 2>/dev/null || cp "$f" "$dest" 2>/dev/null

  # append to json
  jq --arg file "$rel" --argjson keys "$(printf '%s\n' "${uniq_keys[@]}" | jq -R . | jq -s .)" '.candidates += [{file: $file, keys: $keys}]' "$CANDIDATES_JSON" > "${CANDIDATES_JSON}.tmp" && mv "${CANDIDATES_JSON}.tmp" "$CANDIDATES_JSON"

  echo "Processed: $rel -> $dest (keys: ${#uniq_keys[@]})"

  if [ "$COPY" = false ]; then
    # leave only the json and masked files if user asked to copy (COPY=true)
    rm -f "$dest"
  fi

done

echo "Done. Candidate summary written to ${CANDIDATES_JSON}"

echo "NOTE: Masked copies are only created when --copy is provided. Values are redacted to prevent accidental leakage."

exit 0
