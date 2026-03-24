const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./utils/logger');

/**
 * 自動修正を適用
 */
async function applyFixes() {
  try {
    const fixesPath = path.join(__dirname, '../output/fixes.json');
    const fixesContent = await fs.readFile(fixesPath, 'utf-8');
    const fixes = JSON.parse(fixesContent);

    if (fixes.length === 0) {
      logger.info('No fixes to apply');
      return;
    }

    logger.info(`Applying ${fixes.length} fixes...`);

    // ファイルごとにグループ化
    const fileGroups = {};
    for (const fix of fixes) {
      if (!fileGroups[fix.file]) {
        fileGroups[fix.file] = [];
      }
      fileGroups[fix.file].push(fix);
    }

    // 各ファイルに修正を適用
    const repoRoot = path.join(__dirname, '../../../');

    for (const [filePath, fileFixes] of Object.entries(fileGroups)) {
      const fullPath = path.join(repoRoot, filePath);

      try {
        let content = await fs.readFile(fullPath, 'utf-8');

        // 行番号の降順でソート（後ろから修正することで行番号がずれない）
        fileFixes.sort((a, b) => b.line - a.line);

        for (const fix of fileFixes) {
          if (fix.fix && fix.fix.canAutoFix && fix.fix.code) {
            content = applyFixToLine(content, fix.line, fix.fix.code);
            logger.info(`Applied fix to ${filePath}:${fix.line}`);
          }
        }

        await fs.writeFile(fullPath, content, 'utf-8');
        logger.info(`Fixed file: ${filePath}`);

      } catch (error) {
        logger.error(`Failed to fix ${filePath}:`, error);
      }
    }

    logger.info('All fixes applied');

  } catch (error) {
    logger.error('Failed to apply fixes:', error);
    throw error;
  }
}

/**
 * 特定の行に修正を適用
 */
function applyFixToLine(content, lineNumber, fixCode) {
  const lines = content.split('\n');

  if (lineNumber > 0 && lineNumber <= lines.length) {
    lines[lineNumber - 1] = fixCode;
  }

  return lines.join('\n');
}

// スクリプトとして実行された場合
if (require.main === module) {
  applyFixes().catch(error => {
    logger.error('Fixer failed:', error);
    process.exit(1);
  });
}

module.exports = {
  applyFixes
};
