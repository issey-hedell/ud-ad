const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('./utils/logger');

/**
 * 変更されたファイル一覧を取得
 */
async function getChangedFiles() {
  try {
    const changedFiles = process.env.CHANGED_FILES || '';
    const fileList = changedFiles.split('\n').filter(f => f.trim());

    const results = [];

    for (const file of fileList) {
      // バイナリファイルやnode_modulesは除外
      if (shouldSkipFile(file)) {
        continue;
      }

      try {
        const repoRoot = path.join(__dirname, '../../../');
        const filePath = path.join(repoRoot, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const language = detectLanguage(file);

        results.push({
          path: file,
          content: content,
          language: language,
          lines: content.split('\n').length
        });
      } catch (error) {
        logger.warn(`Failed to read file: ${file}`, error.message);
      }
    }

    return results;
  } catch (error) {
    logger.error('Failed to get changed files:', error);
    return [];
  }
}

/**
 * スキップすべきファイルかどうか判定
 */
function shouldSkipFile(filePath) {
  const skipPatterns = [
    /node_modules/,
    /\.git\//,
    /\.next\//,
    /dist\//,
    /build\//,
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.gif$/,
    /\.svg$/,
    /\.ico$/,
    /\.woff$/,
    /\.woff2$/,
    /\.ttf$/,
    /\.eot$/,
    /\.pdf$/,
    /\.zip$/,
    /package-lock\.json$/,
    /yarn\.lock$/
  ];

  return skipPatterns.some(pattern => pattern.test(filePath));
}

/**
 * ファイルの言語を検出
 */
function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.scss': 'scss',
    '.html': 'html',
    '.json': 'json',
    '.md': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml'
  };

  return languageMap[ext] || 'text';
}

module.exports = {
  getChangedFiles
};
