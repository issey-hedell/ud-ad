# discover-secrets.ps1
# シークレット候補ファイルを検索するスクリプト（Windows版）
#
# 使い方:
#   .\scripts\discover-secrets.ps1
#   .\scripts\discover-secrets.ps1 -BaseDir ".." -Copy

param(
    [string]$BaseDir = "..",
    [switch]$Copy,
    [string]$OutDir = "docs/secrets-candidates"
)

$Patterns = @("*.env", "*.env.*", "*.secret", "*.yml", "*.yaml", "*.json", "*.conf")
$GrepTerms = @("DATABASE_URL", "SUPABASE", "VERCEL", "SENTRY", "API_KEY", "API_SECRET", "NEXT_PUBLIC_", "PAT", "GITHUB_TOKEN", "TOKEN", "SERVICE_ROLE")

Write-Host "Scanning $BaseDir for candidate files..."

# 出力ディレクトリ作成
if (-not (Test-Path $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$CandidatesJson = Join-Path $OutDir "candidates.json"
$Candidates = @()

# ファイル検索
$Files = @()
foreach ($pattern in $Patterns) {
    $found = Get-ChildItem -Path $BaseDir -Filter $pattern -Recurse -ErrorAction SilentlyContinue |
             Where-Object { $_.FullName -notmatch "node_modules|\.git|secrets-candidates" }
    $Files += $found
}

Write-Host "Found $($Files.Count) candidate files. Processing..."

foreach ($file in $Files) {
    $keys = @()
    
    # ファイルの最初の200行を読み込み
    $lines = Get-Content $file.FullName -TotalCount 200 -ErrorAction SilentlyContinue
    
    foreach ($line in $lines) {
        # KEY=value パターンを検索
        if ($line -match '^[\s]*([A-Za-z0-9_\-]+)[\s]*=') {
            $keys += $Matches[1]
        }
        
        # 特定のキーワードを検索
        foreach ($term in $GrepTerms) {
            if ($line -match $term) {
                $keys += $term
            }
        }
    }
    
    # 重複を除去
    $uniqueKeys = $keys | Select-Object -Unique
    
    # 相対パス取得
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    
    $Candidates += @{
        file = $relativePath
        keys = $uniqueKeys
    }
    
    Write-Host "Processed: $relativePath (keys: $($uniqueKeys.Count))"
    
    # コピーオプションが指定された場合、マスク済みファイルを作成
    if ($Copy) {
        $destPath = Join-Path $OutDir ($relativePath + ".masked")
        $destDir = Split-Path $destPath -Parent
        
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        # 値をマスク
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        $masked = $content -replace '(^[\s]*[A-Za-z0-9_\-]+[\s]*=).*$', '$1<REDACTED>'
        $masked | Out-File -FilePath $destPath -Encoding utf8
    }
}

# JSON出力
$Candidates | ConvertTo-Json -Depth 3 | Out-File -FilePath $CandidatesJson -Encoding utf8

Write-Host ""
Write-Host "Done. Candidate summary written to $CandidatesJson"
Write-Host "NOTE: Use -Copy to create masked copies of candidate files."
