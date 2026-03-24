const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./utils/logger');

/**
 * リスク判定ルール
 */
const RISK_RULES = {
  low: [
    'css-change',
    'style-change',
    'prettier-fix',
    'eslint-fix',
    'comment-change',
    'import-sort',
    'unused-variable',
    'console-log'
  ],
  medium: [
    'ui-component-change',
    'ui-pattern',
    'useState-added',
    'useEffect-added',
    'props-change',
    'event-handler-change',
    'type-error',
    'design-rule'
  ],
  high: [
    'api-call-change',
    'database-schema-change',
    'auth-logic-change',
    'env-variable-change',
    'security',
    'dependency-added',
    'cors-change',
    'authentication',
    'authorization'
  ]
};

/**
 * リスク評価
 */
function evaluateRisk(issues) {
  if (!issues || issues.length === 0) {
    return {
      level: 'low',
      issues: [],
      highRiskIssues: [],
      mediumRiskIssues: [],
      lowRiskIssues: []
    };
  }

  const highRiskIssues = issues.filter(issue =>
    issue.severity === 'high' ||
    RISK_RULES.high.some(rule => issue.type.includes(rule))
  );

  const mediumRiskIssues = issues.filter(issue =>
    issue.severity === 'medium' ||
    RISK_RULES.medium.some(rule => issue.type.includes(rule))
  );

  const lowRiskIssues = issues.filter(issue =>
    issue.severity === 'low' ||
    RISK_RULES.low.some(rule => issue.type.includes(rule))
  );

  let level = 'low';

  if (highRiskIssues.length > 0) {
    level = 'high';
  } else if (mediumRiskIssues.length > 0) {
    level = 'medium';
  }

  logger.info(`Risk evaluation: ${level}`);
  logger.info(`High: ${highRiskIssues.length}, Medium: ${mediumRiskIssues.length}, Low: ${lowRiskIssues.length}`);

  return {
    level,
    issues,
    highRiskIssues,
    mediumRiskIssues,
    lowRiskIssues
  };
}

module.exports = {
  evaluateRisk
};
