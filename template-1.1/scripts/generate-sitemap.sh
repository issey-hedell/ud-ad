#!/usr/bin/env bash
set -euo pipefail

# generate-sitemap.sh
# Usage: ./scripts/generate-sitemap.sh [--input docs/sitemap-examples/*.mmd] [--out docs/sitemap.svg]

INPUT=""
OUT="docs/sitemap.svg"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input) INPUT="$2"; shift 2;;
    --out) OUT="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [ -z "$INPUT" ]; then
  echo "No input provided. Generating from docs/sitemap-examples/*.mmd"
  mapfile -t files < <(ls docs/sitemap-examples/*.mmd 2>/dev/null || true)
else
  files=("$INPUT")
fi

if [ ${#files[@]} -eq 0 ]; then
  echo "No .mmd files found. Create one under docs/sitemap-examples/"; exit 1
fi

# Use mermaid-cli (mmdc) if available
if ! command -v mmdc >/dev/null 2>&1; then
  echo "Warning: mermaid-cli (mmdc) not found. Install with 'npm i -g @mermaid-js/mermaid-cli' to generate SVGs."
  echo "Available inputs:"; printf "%s\n" "${files[@]}"; exit 0
fi

# If multiple files, generate named svgs next to OUT
for f in "${files[@]}"; do
  name=$(basename "$f" .mmd)
  outpath="docs/sitemaps/${name}.svg"
  mkdir -p "$(dirname "$outpath")"
  echo "Generating $outpath from $f"
  mmdc -i "$f" -o "$outpath"
done

echo "Generated: docs/sitemaps/"
