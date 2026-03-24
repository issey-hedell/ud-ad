# CLAUDE.md ビルドスクリプト（PowerShell版）
# 使用方法: .\build-claude-md.ps1 <backend> <frontend> <orm>

param(
    [string]$Backend = "none",
    [string]$Frontend = "none",
    [string]$Orm = "none"
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ClaudeRulesDir = "$ProjectRoot\claude-rules"
$OutputFile = "$ProjectRoot\CLAUDE.md"

Write-Host "CLAUDE.md を生成中..."
Write-Host "  バックエンド: $Backend"
Write-Host "  フロントエンド: $Frontend"
Write-Host "  ORM: $Orm"

# ベースファイルから開始
$BaseFile = "$ClaudeRulesDir\base.md"
if (Test-Path $BaseFile) {
    Get-Content $BaseFile -Encoding UTF8 | Out-File $OutputFile -Encoding UTF8
} else {
    Write-Host "警告: base.md が見つかりません。既存のCLAUDE.mdを使用します。"
    exit 0
}

# バックエンドルールを追加
$BackendFile = "$ClaudeRulesDir\backend\$Backend.md"
if ($Backend -ne "none" -and (Test-Path $BackendFile)) {
    "" | Out-File $OutputFile -Append -Encoding UTF8
    Get-Content $BackendFile -Encoding UTF8 | Out-File $OutputFile -Append -Encoding UTF8
}

# フロントエンドルールを追加
$FrontendFile = "$ClaudeRulesDir\frontend\$Frontend.md"
if ($Frontend -ne "none" -and (Test-Path $FrontendFile)) {
    "" | Out-File $OutputFile -Append -Encoding UTF8
    Get-Content $FrontendFile -Encoding UTF8 | Out-File $OutputFile -Append -Encoding UTF8
}

# ORMルールを追加
$OrmFile = "$ClaudeRulesDir\orm\$Orm.md"
if ($Orm -ne "none" -and (Test-Path $OrmFile)) {
    "" | Out-File $OutputFile -Append -Encoding UTF8
    Get-Content $OrmFile -Encoding UTF8 | Out-File $OutputFile -Append -Encoding UTF8
}

Write-Host "CLAUDE.md を生成しました: $OutputFile"
