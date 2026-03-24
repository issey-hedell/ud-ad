const fetch = require('node-fetch');
const { logger } = require('./utils/logger');

const SYSTEM_PROMPT = `あなたは GitHub のコードレビューを行うガーディアンAIです。

以下のルールに基づいて、コードの問題を検出し、修正案を提示してください。

【ルール】
1. UI_PATTERN_RULES.md: UIパターンの必須要素チェック
2. DESIGNER_MODE_RULES.md: 設計思想との整合性チェック
3. 04_DETAILED_DESIGN.md: 詳細設計書との整合性チェック

【チェック観点】
- UIコンポーネントに必須要素が揃っているか
- ローディング表示が実装されているか
- エラーハンドリングが適切か
- TypeScript の型定義が適切か
- セキュリティ上の問題がないか
- パフォーマンス上の問題がないか

【出力フォーマット】
JSON形式で以下を返してください：

{
  "issues": [
    {
      "file": "ファイルパス",
      "line": 行番号,
      "type": "問題の種類（ui-pattern/design-rule/type-error/security等）",
      "severity": "low/medium/high",
      "message": "問題の説明",
      "fix": {
        "canAutoFix": true/false,
        "code": "修正後のコード（自動修正可能な場合のみ）",
        "description": "修正方法の説明"
      }
    }
  ],
  "summary": "全体のサマリー"
}

【重要】
- 問題がない場合は issues を空配列にしてください
- 自動修正可能な問題には必ず fix.code を含めてください
- セキュリティ問題は severity を high にしてください
`;

/**
 * Claude APIでコードをチェック
 */
async function checkCode(changedFiles, rules) {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set');
    }

    // ファイル内容を整形
    const filesContent = changedFiles.map(f => `
## ファイル: ${f.path} (${f.language})

\`\`\`${f.language}
${f.content}
\`\`\`
`).join('\n\n');

    // ルール内容を整形
    let rulesContent = '';
    if (rules.uiPatternRules) {
      rulesContent += `\n## UI_PATTERN_RULES.md\n\n${rules.uiPatternRules}\n`;
    }
    if (rules.designerModeRules) {
      rulesContent += `\n## DESIGNER_MODE_RULES.md\n\n${rules.designerModeRules}\n`;
    }
    if (rules.detailedDesign) {
      rulesContent += `\n## 04_DETAILED_DESIGN.md\n\n${rules.detailedDesign}\n`;
    }

    const userMessage = `
以下の変更されたファイルをチェックしてください。

${filesContent}

【適用するルール】
${rulesContent}

上記のルールに基づいて、問題を検出し、JSON形式で返してください。
`;

    logger.info('Calling Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const contentText = data.content[0].text;

    logger.info('Claude API response received');

    // JSONを抽出（```json ... ``` で囲まれている場合に対応）
    let jsonText = contentText;
    const jsonMatch = contentText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const result = JSON.parse(jsonText);
    return result;

  } catch (error) {
    logger.error('Claude API call failed:', error);

    // エラー時はデフォルト値を返す
    return {
      issues: [],
      summary: `Error: ${error.message}`
    };
  }
}

module.exports = {
  checkCode
};
