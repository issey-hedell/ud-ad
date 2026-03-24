# プロジェクト初期化ウィザード（PowerShell版）
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Write-Host "========================================"
Write-Host "プロジェクト初期化ウィザード"
Write-Host "========================================"

# 1. バックエンド選択
Write-Host ""
Write-Host "[1/4] バックエンドを選択してください:"
Write-Host "  1) Python + FastAPI"
Write-Host "  2) Node.js + Express"
Write-Host "  3) Node.js + Next.js (API Routes)"
Write-Host "  4) なし（フロントエンドのみ）"
$Backend = Read-Host "選択 (1-4)"

$BackendStack = switch ($Backend) {
    "1" { "python-fastapi" }
    "2" { "node-express" }
    "3" { "node-nextjs" }
    "4" { "none" }
    default { Write-Host "無効な選択です"; exit 1 }
}

# 2. フロントエンド選択
Write-Host ""
Write-Host "[2/4] フロントエンドを選択してください:"
Write-Host "  1) React"
Write-Host "  2) Vue.js"
Write-Host "  3) Vanilla JS"
Write-Host "  4) なし（APIのみ）"
$Frontend = Read-Host "選択 (1-4)"

$FrontendStack = switch ($Frontend) {
    "1" { "react" }
    "2" { "vue" }
    "3" { "vanilla" }
    "4" { "none" }
    default { Write-Host "無効な選択です"; exit 1 }
}

# 3. データベース選択
Write-Host ""
Write-Host "[3/4] データベースを選択してください:"
Write-Host "  1) PostgreSQL"
Write-Host "  2) MySQL"
Write-Host "  3) MongoDB"
Write-Host "  4) Supabase"
Write-Host "  5) Firebase"
$Database = Read-Host "選択 (1-5)"

$DatabaseStack = switch ($Database) {
    "1" { "postgresql" }
    "2" { "mysql" }
    "3" { "mongodb" }
    "4" { "supabase" }
    "5" { "firebase" }
    default { Write-Host "無効な選択です"; exit 1 }
}

# 4. デプロイ先選択
Write-Host ""
Write-Host "[4/4] デプロイ先を選択してください:"
Write-Host "  1) AWS EC2"
Write-Host "  2) AWS ECS"
Write-Host "  3) Vercel"
Write-Host "  4) Netlify"
Write-Host "  5) その他"
$Deploy = Read-Host "選択 (1-5)"

$DeployStack = switch ($Deploy) {
    "1" { "aws-ec2" }
    "2" { "aws-ecs" }
    "3" { "vercel" }
    "4" { "netlify" }
    "5" { "other" }
    default { Write-Host "無効な選択です"; exit 1 }
}

# ORM自動選択
if ($BackendStack -eq "python-fastapi") {
    $OrmStack = "sqlalchemy"
} elseif ($BackendStack -eq "node-express" -or $BackendStack -eq "node-nextjs") {
    Write-Host ""
    Write-Host "[追加] ORMを選択してください:"
    Write-Host "  1) Prisma"
    Write-Host "  2) TypeORM"
    $Orm = Read-Host "選択 (1-2)"
    $OrmStack = switch ($Orm) {
        "1" { "prisma" }
        "2" { "typeorm" }
        default { Write-Host "無効な選択です"; exit 1 }
    }
} else {
    $OrmStack = "none"
}

Write-Host ""
Write-Host "========================================"
Write-Host "選択内容の確認"
Write-Host "========================================"
Write-Host "バックエンド: $BackendStack"
Write-Host "フロントエンド: $FrontendStack"
Write-Host "データベース: $DatabaseStack"
Write-Host "ORM: $OrmStack"
Write-Host "デプロイ先: $DeployStack"
Write-Host ""
$Confirm = Read-Host "この設定でよろしいですか？ (y/n)"

if ($Confirm -ne "y") {
    Write-Host "キャンセルしました"
    exit 0
}

Write-Host ""
Write-Host "プロジェクトを初期化しています..."

# 設定をファイルに保存
$Config = @{
    backend = $BackendStack
    frontend = $FrontendStack
    database = $DatabaseStack
    orm = $OrmStack
    deploy = $DeployStack
    initialized = (Get-Date -Format "o")
}
$Config | ConvertTo-Json | Out-File -FilePath "$ProjectRoot\.stack-config.json" -Encoding UTF8

# バックエンド構造のコピー
$BackendStructure = "$ProjectRoot\stacks\backend\$BackendStack\structure"
if ($BackendStack -ne "none" -and (Test-Path $BackendStructure)) {
    Write-Host "バックエンド構造をコピー中..."
    Copy-Item -Path "$BackendStructure\*" -Destination $ProjectRoot -Recurse -Force -ErrorAction SilentlyContinue
}

# フロントエンド構造のコピー
$FrontendStructure = "$ProjectRoot\stacks\frontend\$FrontendStack\structure"
if ($FrontendStack -ne "none" -and (Test-Path $FrontendStructure)) {
    Write-Host "フロントエンド構造をコピー中..."
    Copy-Item -Path "$FrontendStructure\*" -Destination $ProjectRoot -Recurse -Force -ErrorAction SilentlyContinue
}

# チェックリストのコピー
$ActiveChecklists = "$ProjectRoot\docs\checklists\active"
if (-not (Test-Path $ActiveChecklists)) {
    New-Item -ItemType Directory -Path $ActiveChecklists -Force | Out-Null
}
Write-Host "チェックリストをコピー中..."

# 共通チェックリスト
$CommonChecklists = "$ProjectRoot\docs\checklists\common"
if (Test-Path $CommonChecklists) {
    Copy-Item -Path "$CommonChecklists\*.md" -Destination $ActiveChecklists -Force -ErrorAction SilentlyContinue
}

# CLAUDE.md のビルド
Write-Host "CLAUDE.md を生成中..."
& "$ScriptDir\build-claude-md.ps1" $BackendStack $FrontendStack $OrmStack

Write-Host ""
Write-Host "========================================"
Write-Host "初期化が完了しました！"
Write-Host "========================================"
Write-Host ""
Write-Host "次のステップ:"
Write-Host "1. docs/PROJECT_CONFIG.md にプロジェクト情報を記入"
Write-Host "2. メンバー登録を行う"
Write-Host "3. 設計フェーズ（01_IDEA_SHEET.md）を開始"
Write-Host ""
Write-Host "設定ファイル: .stack-config.json"
