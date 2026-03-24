/**
 * メンバー登録チェックスクリプト
 * 
 * 用途:
 * - npm install 時に自動実行（警告表示）
 * - git commit 時に実行（--strict で失敗終了）
 * 
 * 使い方:
 * - node scripts/check-member.js        → 警告表示のみ
 * - node scripts/check-member.js --strict → 未登録なら終了コード1
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// OSユーザー名を取得
const username = os.userInfo().username;

// PROJECT_CONFIG.md のパス
const configPath = path.join(__dirname, '../docs/PROJECT_CONFIG.md');

// ファイルが存在するか確認
if (!fs.existsSync(configPath)) {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  ⚠️  PROJECT_CONFIG.md が見つかりません                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  docs/PROJECT_CONFIG.md を作成してください。                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  if (process.argv.includes('--strict')) {
    process.exit(1);
  }
  process.exit(0);
}

// ファイルを読み込み
const config = fs.readFileSync(configPath, 'utf8');

// メンバー一覧セクションにユーザー名が含まれているかチェック
const isRegistered = config.includes(username);

if (!isRegistered) {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  ⚠️  初回セットアップが必要です                              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  あなた（${username.padEnd(12)}）はメンバー登録されていません。  ║
║                                                            ║
║  以下の手順で登録してください：                              ║
║                                                            ║
║  1. docs/PROJECT_CONFIG.md を開く                          ║
║  2. 「メンバー別設定」テーブルに自分の行を追加：             ║
║                                                            ║
║     | ${username.padEnd(10)} | あなたの名前 | Win/Mac | パス |   ║
║                                                            ║
║  3. git commit & push                                      ║
║                                                            ║
║  詳細: docs/onboarding/ONBOARDING_CHECKLIST.md             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  if (process.argv.includes('--strict')) {
    console.log('❌ メンバー登録が完了するまで commit できません\n');
    process.exit(1);
  }
} else {
  // 登録済みの場合（--strict モードでない場合は表示しない）
  if (process.argv.includes('--strict')) {
    console.log(`✅ メンバー確認OK: ${username}`);
  }
}

process.exit(0);
