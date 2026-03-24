const fs = require('fs').promises;
const path = require('path');
const analyzer = require('./analyzer');
const checker = require('./checker');
const riskEvaluator = require('./risk-evaluator');
const { logger } = require('./utils/logger');

async function main() {
  try {
    logger.info('Guardian AI starting...');

    // 1. 環境変数チェック
    const requiredEnvVars = ['CLAUDE_API_KEY', 'GITHUB_TOKEN', 'BRANCH', 'REPOSITORY'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // 2. 出力ディレクトリ作成
    const outputDir = path.join(__dirname, '../output');
    await fs.mkdir(outputDir, { recursive: true });

    // 3. 差分ファイル解析
    logger.info('Analyzing changed files...');
    const changedFiles = await analyzer.getChangedFiles();
    logger.info(`Found ${changedFiles.length} changed files`);

    if (changedFiles.length === 0) {
      logger.info('No files to check');
      await saveResults(outputDir, { issues: [], riskLevel: 'low' });
      return;
    }

    // 4. ルールファイル読み込み
    logger.info('Loading rules...');
    const rules = await loadRules();

    // 5. コードチェック実行
    logger.info('Running code checks...');
    const checkResults = await checker.checkCode(changedFiles, rules);

    // 6. リスク評価
    logger.info('Evaluating risk...');
    const riskEvaluation = riskEvaluator.evaluateRisk(checkResults.issues);

    // 7. 結果保存
    await saveResults(outputDir, {
      issues: checkResults.issues,
      riskLevel: riskEvaluation.level,
      summary: checkResults.summary
    });

    logger.info(`Guardian AI completed. Risk level: ${riskEvaluation.level}`);

  } catch (error) {
    logger.error('Guardian AI failed:', error);
    process.exit(1);
  }
}

async function loadRules() {
  const repoRoot = path.join(__dirname, '../../../');

  const rules = {
    uiPatternRules: '',
    designerModeRules: '',
    detailedDesign: ''
  };

  // UI_PATTERN_RULES.md
  try {
    const uiPatternPath = path.join(repoRoot, 'docs/UI_PATTERN_RULES.md');
    rules.uiPatternRules = await fs.readFile(uiPatternPath, 'utf-8');
  } catch (error) {
    logger.warn('UI_PATTERN_RULES.md not found, skipping');
  }

  // DESIGNER_MODE_RULES.md
  try {
    const designerModePath = path.join(repoRoot, 'docs/DESIGNER_MODE_RULES.md');
    rules.designerModeRules = await fs.readFile(designerModePath, 'utf-8');
  } catch (error) {
    logger.warn('DESIGNER_MODE_RULES.md not found, skipping');
  }

  // 04_DETAILED_DESIGN.md
  try {
    const detailedDesignPath = path.join(repoRoot, 'docs/04_DETAILED_DESIGN.md');
    rules.detailedDesign = await fs.readFile(detailedDesignPath, 'utf-8');
  } catch (error) {
    logger.warn('04_DETAILED_DESIGN.md not found, skipping');
  }

  return rules;
}

async function saveResults(outputDir, results) {
  // risk_level.txt
  await fs.writeFile(
    path.join(outputDir, 'risk_level.txt'),
    results.riskLevel
  );

  // issues.json
  await fs.writeFile(
    path.join(outputDir, 'issues.json'),
    JSON.stringify(results.issues, null, 2)
  );

  // fixes.json（自動修正可能な問題のみ）
  const fixableIssues = results.issues.filter(i => i.fix && i.fix.canAutoFix);
  await fs.writeFile(
    path.join(outputDir, 'fixes.json'),
    JSON.stringify(fixableIssues, null, 2)
  );
}

main();
