# エラーログ

> このファイルは開発中に発生したエラーとその解決方法を記録します。
> 同じエラーが再発した際の参照用として活用してください。

---

## 記録フォーマット

```markdown
## [YYYY-MM-DD] [エラータイトル]

**発生箇所**: [ファイルパス:行番号]

**エラーメッセージ**:
```
[エラーメッセージをそのまま貼り付け]
```

**原因**: [エラーの原因]

**解決方法**: [どのように解決したか]

**関連コミット**: [コミットハッシュ（あれば）]

**備考**: [その他の注意点]
```

---

## 開発開始時チェックリスト

> **重要**: 新しい環境やデプロイ後に「動かない」と感じたら、まず以下を順番にチェック

### 1. 環境変数の確認
- [ ] `OPENAI_API_KEY` が設定されているか
- [ ] `BASIC_AUTH_ENABLED` が意図した値になっているか（本番でtrue、開発でfalse/未設定）
- [ ] Vercelの場合、`npx vercel env ls` で環境変数を確認

### 2. APIエンドポイントのテスト
```bash
# プロジェクト作成
curl -X POST https://YOUR_URL/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "Test"}'

# メッセージ送信（要: userId）
curl -X POST https://YOUR_URL/api/channels/CHANNEL_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"userId": "user", "content": "test @biz"}'
```

### 3. サーバーログの確認
- ローカル: ターミナル出力
- Vercel: `npx vercel logs YOUR_DEPLOYMENT_URL` または Vercelダッシュボード

### 4. デプロイ環境の制約
- [ ] Vercel/AWS Lambda = **ファイルシステム書き込み不可**（メモリ内ストレージにフォールバック）
- [ ] サーバーレス = リクエストごとにインスタンス再起動の可能性あり

### 5. 認証の確認
- Basic認証が有効な場合、ブラウザからのfetchリクエストも認証が必要
- 401エラー = 認証問題

### 6. ビルドエラーの確認
```bash
npm run build
```
- TypeScript型エラーは本番デプロイ時に発生することが多い
- ローカルで`npm run dev`は通っても`npm run build`で失敗するケースあり

---

## エラー一覧

### [2026-01-12] Vercel本番環境でプロジェクト作成・チャット発言が動作しない

**調査プロセス**（この順番でチェック）:

1. **ローカル開発サーバーでAPI確認**
   ```bash
   npm run dev
   curl -X POST http://localhost:3000/api/projects ...
   ```
   → 結果: ローカルでは動作

2. **本番API直接テスト**
   ```bash
   curl -X POST https://lens-liard.vercel.app/api/projects ...
   ```
   → 結果: `Authentication required` (401)

3. **Basic認証の確認**
   - `middleware.ts` を確認
   - `BASIC_AUTH_ENABLED=true` が設定されていた
   → 解決: Vercel環境変数から削除

4. **再度API確認**
   ```bash
   curl -X POST https://lens-liard.vercel.app/api/projects ...
   ```
   → 結果: `INTERNAL_ERROR: プロジェクトの作成に失敗しました`

5. **サーバーログ確認**
   ```bash
   npx vercel inspect DEPLOYMENT_URL --logs
   ```
   → 結果: ファイルシステムエラー（Vercelはread-only）

6. **ストレージ層の修正**
   - `IS_SERVERLESS` フラグを追加
   - メモリ内ストレージにフォールバック

**発生箇所**:
- `src/lib/storage/projects.ts`
- `src/lib/storage/channels.ts`
- `src/middleware.ts`

**原因**:
1. Basic認証が本番で有効だった
2. Vercelサーバーレス環境ではファイルシステムへの書き込みが不可

**解決方法**:
1. `BASIC_AUTH_ENABLED` 環境変数を削除
2. ストレージ層に `IS_SERVERLESS` 判定を追加し、メモリ内Mapにフォールバック

**教訓**:
- **デプロイ先の環境制約を事前に確認**（Vercel = サーバーレス = ファイルシステム書き込み不可）
- **環境変数の状態を確認**（`npx vercel env ls`）
- **curlで直接API確認**することでフロントエンド/バックエンド問題を切り分け

---

### [2026-01-12] OpenAI API未設定時にメッセージ送信が500エラー

**調査プロセス**:

1. **メッセージ送信テスト**
   ```bash
   curl -X POST .../api/channels/ID/messages \
     -d '{"userId": "user", "content": "test @biz"}'
   ```
   → 結果: `INTERNAL_ERROR`

2. **サーバーログ確認**
   ```
   OpenAI API error: Error: The OPENAI_API_KEY environment variable is missing
   ```

3. **コード確認**
   - `generateCommanderResponse` がエラーをthrowしていた
   - Commander応答生成失敗 = 全体失敗

**発生箇所**: `src/lib/openai.ts:281`

**原因**: OpenAI APIキー未設定時に例外がthrowされ、ユーザーメッセージも保存されなかった

**解決方法**:
1. `getOpenAI()` が `null` を返すよう変更
2. `generateCommanderResponse` の戻り値を `string | null` に変更
3. エラー時は `null` を返し、呼び出し側でスキップ

**教訓**:
- **外部API依存の機能は、API無効時でも基本機能は動作するように設計**
- **エラーハンドリングは「全体失敗」ではなく「部分失敗」を許容**

---

### [2026-01-12] ビルド時TypeScript型エラー

**調査プロセス**:

1. **Vercelデプロイ失敗**
   ```
   Type error: Argument of type 'string | null' is not assignable to parameter of type 'string'
   ```

2. **影響範囲の確認**
   - `generateCommanderResponse` の戻り値を `string | null` に変更
   - 呼び出し箇所すべてでnullチェックが必要

**発生箇所**:
- `src/app/api/meetings/[id]/messages/route.ts:112`
- `src/lib/openai.ts:336`（extractQuestions内）

**原因**: 関数の戻り値型を変更したが、すべての呼び出し箇所を更新していなかった

**解決方法**:
1. 各呼び出し箇所に `if (!response) continue;` などのnullチェックを追加

**教訓**:
- **関数シグネチャ変更時は、`npm run build` で全体ビルド確認**
- **`npm run dev` は型エラーを見逃すことがある**

---

## カテゴリ別インデックス

### Next.js関連
- （記録なし）

### TypeScript関連
- （記録なし）

### OpenAI API関連
- （記録なし）

### ビルド関連
- （記録なし）

---

## よくあるエラーと解決パターン

### 1. Next.js - Module not found

**エラー**:
```
Module not found: Can't resolve '@/lib/xxx'
```

**解決方法**:
- tsconfig.jsonのpaths設定を確認
- ファイルパスのタイポを確認
- 拡張子が正しいか確認

### 2. TypeScript - Type error

**エラー**:
```
Type 'X' is not assignable to type 'Y'
```

**解決方法**:
- 型定義を確認
- 必要に応じて型アサーションを使用
- インターフェースの定義を見直す

### 3. OpenAI API - Rate Limit

**エラー**:
```
RateLimitError: Rate limit exceeded
```

**解決方法**:
- リトライロジックを実装
- バックオフ戦略を適用
- 同時リクエスト数を制限

### 4. JSON Parse Error

**エラー**:
```
SyntaxError: Unexpected token in JSON
```

**解決方法**:
- JSONファイルの構文を確認
- 末尾のカンマがないか確認
- エンコーディングを確認

### 5. Next.js - API Route Error

**エラー**:
```
Error: API resolved without sending a response
```

**解決方法**:
- 必ずレスポンスを返すようにする
- async/awaitの使い方を確認
- エラーハンドリングを追加

### 6. Tailwind - Class not applied

**エラー**: スタイルが適用されない

**解決方法**:
- tailwind.config.tsのcontentパスを確認
- クラス名のタイポを確認
- ビルドキャッシュをクリア

---

### [2026-01-12] NextAuth.js useSearchParams() Suspenseエラー

**発生箇所**: `src/app/login/page.tsx`

**エラーメッセージ**:
```
Error: useSearchParams() should be wrapped in a suspense boundary at page "/login"
```

**原因**: Next.js 15では`useSearchParams()`をSuspense境界なしで使用するとビルドエラー

**解決方法**:
```typescript
// LoginFormコンポーネントを分離
function LoginForm() {
  const searchParams = useSearchParams();
  // ...
}

// Suspenseでラップ
export default function LoginPage() {
  return (
    <Suspense fallback={...}>
      <LoginForm />
    </Suspense>
  );
}
```

**教訓**:
- Next.js 15では`useSearchParams()`、`usePathname()`などのClient Hooksは必ずSuspense境界が必要

---

### [2026-01-12] Vercel KVメモリキャッシュ優先によるデータ不整合

**発生箇所**: `src/lib/storage/channels.ts:getChannel()`

**症状**:
- チャンネルにファイルをアップロードしても、AIがファイル内容を参照しない
- KVにはデータがあるのに、APIレスポンスに`contextPrompt`が含まれない

**原因**:
```typescript
// ❌ 問題のあるコード: メモリキャッシュを優先
export async function getChannel(id: string) {
  if (IS_SERVERLESS) {
    const memChannel = memoryStore.get(id);  // 古いデータを返す
    if (memChannel) return memChannel;
    // KVから取得...
  }
}
```

Vercelのサーバーレス環境では：
1. リクエストAでチャンネルを作成 → KVに保存 → メモリにキャッシュ
2. ファイルアップロード（別のLambdaインスタンス）→ KVを更新
3. リクエストB（最初のインスタンス）→ メモリの古いデータを返す

**解決方法**:
```typescript
// ✅ 修正後: KVを優先
export async function getChannel(id: string) {
  if (IS_SERVERLESS) {
    if (isKVAvailable()) {
      const kvChannel = await kvGetChannel(id);  // 常に最新を取得
      if (kvChannel) {
        memoryStore.set(id, kvChannel);  // キャッシュ更新
        return kvChannel;
      }
    }
    // KVが利用不可の場合のみメモリから
    const memChannel = memoryStore.get(id);
    if (memChannel) return memChannel;
  }
}
```

**教訓**:
- **サーバーレス環境ではメモリキャッシュを信頼しない**
- 複数インスタンスが同時に動作するため、メモリの状態は不整合になりやすい
- 永続化ストレージ（KV、DB）を優先して取得する

---

### [2026-01-12] AIがコンテキストファイルの内容を参照しない

**発生箇所**: `src/lib/openai.ts:generateCommanderResponse()`

**症状**:
- `contextPrompt`がシステムプロンプトに追加されている
- しかしAIは「ファイルがどこにあるか」と質問し返す
- 特にPMの構造分析モードで顕著

**原因**:
1. システムプロンプトに`contextPrompt`を追加するだけでは不十分
2. ユーザープロンプトに「背景情報を参照せよ」という指示がなかった
3. PMは「構造分析」に集中するため、背景情報を能動的に引用しない

**解決方法**:
```typescript
// 背景情報がある場合は参照指示を追加
const contextReference = opts.channelContextPrompt?.trim()
  ? '\n\n※システムプロンプトに含まれている【背景情報・コンテキスト】の内容を参照して回答してください。ファイルの具体的な内容について質問された場合は、その内容を引用・要約して回答してください。'
  : '';

const prompt = `【会話履歴】
${conversationContext}

【直近のメッセージ】
${currentMessage}

上記の会話に対して、あなたの視点から応答してください。${contextReference}`;
```

**教訓**:
- AIにコンテキストを渡すだけでは不十分、**明示的に「参照せよ」と指示する**
- 特に役割が限定されているAI（PM等）は、追加情報を無視しがち

---

### [2026-01-12] PMが英語で応答する

**発生箇所**: `src/lib/openai.ts` PMシステムプロンプト

**症状**:
- PMの応答が英語になる
- 特に構造分析モード（Current Questions、Unresolved Points等）で顕著

**原因**:
- 英語ベースの構造的思考プロンプトをそのまま使用
- 「日本語で応答」の指示が弱い

**解決方法**:
```typescript
pm: `あなたはLENSのpm_commander（構造的思考アシスタント）です。
※重要：すべての応答は必ず日本語で行ってください。英語での応答は禁止です。

// ... 中略 ...

【デフォルトの出力構造】（日本語で出力）

応答時は常に以下の構造を使用（見出しも日本語で）：

1. 現在の問い（あれば）
2. 未解決の点
// ...

※再度強調：出力は必ず日本語で。見出しも内容もすべて日本語です。`,
```

**教訓**:
- プロンプトの**冒頭と末尾の両方**で言語指示を強調する
- 見出し等のテンプレートも日本語で明示する

---

## LENS固有のエラーパターン

### Commander応答エラー

**状況**: @biz等のメンションに応答しない

**確認事項**:
- メンション検出ロジックが正しいか
- OpenAI APIキーが設定されているか
- システムプロンプトが正しいか

### JSON保存エラー

**状況**: 会議データが保存されない

**確認事項**:
- data/meetingsディレクトリが存在するか
- ファイル書き込み権限があるか
- JSONシリアライズが正しいか

### 構造抽出エラー

**状況**: 問いが抽出されない

**確認事項**:
- AIレスポンスのパースが正しいか
- 信頼度閾値が適切か
- イベントログが正しく渡されているか

---

---

### [2026-01-13] 翻訳機能が「翻訳に失敗しました」エラー

**発生箇所**: `src/lib/deepl.ts:parseTranslationRequest()`

**症状**:
- `@translator お腹がすいた　これを英語にできる？` で「翻訳に失敗しました」
- DeepL APIキーは設定済み、API自体は動作する
- パターンマッチに失敗 → フォールバック処理 → 空文字列を翻訳しようとして失敗

**調査プロセス**:

1. **エラーメッセージ確認**
   ```
   [DEBUG] Translator - parsed request: null
   [DEBUG] Translator - translation failed for:
   ```
   → `parseTranslationRequest`が`null`を返している

2. **パターンマッチのテスト**
   ```javascript
   // パターン1: /(.+?)を(日本語|英語|...)に(翻訳|訳し|して|できる)/
   // 「お腹がすいた　これを英語にできる？」にマッチ
   // → match1[1] = 「お腹がすいた　これ」（「これ」が含まれてしまう）
   ```

3. **問題特定**
   - パターン1が先にマッチし、「これ」も翻訳対象に含まれる
   - パターン1.5（指示語パターン）より先にパターン1がマッチしていた

**原因**:
1. パターンの優先順位が間違っていた（パターン1が先にマッチ）
2. 指示語（「これ」「それ」）の前に空白があることを要求していなかった

**解決方法**:
```typescript
// 修正前: パターン1が先
function parseTranslationRequest(rawMessage: string) {
  // パターン1: 「〜を英語に翻訳」
  const pattern1 = /(.+?)を(日本語|英語|...)に(翻訳|訳し|して|できる)/;
  // パターン1.5: 「これを英語に」（後で実行）
}

// 修正後: パターン1.5を先にチェック + 空白を要求
function parseTranslationRequest(rawMessage: string) {
  // パターン1.5を先にチェック: 空白 + 指示語 + 言語
  const pattern1b = /[\s　]+(これ|それ|あれ|...)を(日本語|英語|...)に(できる|して|...)?[？?]?/;
  const match1b = message.match(pattern1b);
  if (match1b) {
    // 空白の前のテキストを翻訳対象とする
    const textBefore = message.substring(0, message.indexOf(match1b[0])).trim();
    if (textBefore) return { text: textBefore, targetLang };
  }

  // パターン1: 「〜を英語に翻訳」（後で実行）
  const pattern1 = /(.+?)を(日本語|英語|...)に(翻訳|訳し|して|できる)/;
}
```

**テスト結果**:
```
Input: "お腹がすいた　これを英語にできる？"
Result: { text: 'お腹がすいた', targetLang: 'EN', pattern: '1.5' }  ✅

Input: "Hello World これを日本語にして"
Result: { text: 'Hello World', targetLang: 'JA', pattern: '1.5' }  ✅

Input: "Helloを日本語に翻訳して"
Result: { text: 'Hello', targetLang: 'JA', pattern: '1' }  ✅
```

**教訓**:
- **正規表現パターンは順序が重要**：より特殊なパターンを先に、一般的なパターンを後に
- **パターンマッチのテストを必ず書く**：複数の入力パターンでテスト
- **「〜を〇〇に」パターンは曖昧**：指示語（これ、それ）を含む場合は別処理が必要

---

### [2026-01-13] AIがコンテキストファイル内容を引用しない（PM/balanced）

**発生箇所**: `src/lib/openai.ts` PM/balanced システムプロンプト

**症状**:
- チャンネルにMDファイルをアップロード済み
- @pm や @balanced に「このファイルの内容を要約して」と質問
- AIは「ファイルの場所を教えてください」と返答
- `contextPrompt`はシステムプロンプトに含まれている（デバッグ確認済み）

**調査プロセス**:

1. **KVデータ確認**
   ```bash
   npx vercel inspect lens-liard.vercel.app --logs
   ```
   ```
   [KV] kvGetChannel success: { channelId: 'xxx', hasContextPrompt: true, contextPromptLength: 28208 }
   [DEBUG] channelContextPrompt added, length: 28208
   ```
   → KVにデータあり、システムプロンプトに追加されている

2. **AI応答の確認**
   - PMは「構造的思考アシスタント」として設計
   - 「ファイル内容を要約」は構造分析の範囲外と判断している
   - balancedも同様に、役割外の質問として扱っている

3. **問題特定**
   - システムプロンプトにコンテキストを追加するだけでは不十分
   - AIが能動的にコンテキストを参照するわけではない
   - 特に役割が限定されているAI（PM等）は、役割外の情報を無視する傾向

**原因**:
1. Commanderのシステムプロンプトに「コンテキストファイルへの対応」指示がなかった
2. ユーザープロンプトの「参照指示」が弱かった

**解決方法**:

1. **PMシステムプロンプトに追記**:
```typescript
pm: `...

【コンテキストファイルへの対応】

チャンネルにコンテキストファイル（背景資料）がアップロードされている場合：
- 「ファイルの内容を教えて」「要約して」「まとめて」などの依頼には、コンテキストの具体的な内容を引用・要約して回答する
- 構造的思考の枠組みにとらわれず、ユーザーの質問に直接回答する
- ファイル内容への質問は例外的に、情報提供として対応する

※再度強調：出力は必ず日本語で。`,
```

2. **balancedシステムプロンプトに追記**:
```typescript
balanced: `...
※重要：すべての応答は必ず日本語で行ってください。

【コンテキストファイルへの対応】
チャンネルにコンテキストファイル（背景資料）がアップロードされている場合：
- 「ファイルの内容を教えて」「要約して」「まとめて」などの依頼には、コンテキストの具体的な内容を引用・要約して回答する
- ユーザーの質問に直接回答する`,
```

3. **ユーザープロンプトの参照指示を強化**:
```typescript
const contextReference = opts.channelContextPrompt?.trim()
  ? `\n\n【重要：コンテキストファイルの活用指示】
このチャンネルには背景資料（コンテキストファイル）がアップロードされています。
- 質問に回答する際は、必ず【背景情報・コンテキスト】セクションの内容を確認してください
- 「ファイルの内容」「要約」「まとめ」などを求められた場合は、コンテキストの具体的な内容を引用・要約して回答してください
- 「このファイルについて」「登録されているファイル」への質問は、コンテキストに含まれる情報から回答してください
- コンテキストに含まれる情報を積極的に活用し、具体的な内容を引用してください`
  : '';
```

**教訓**:
- **AIにコンテキストを渡すだけでは不十分**：明示的に「参照せよ」「引用せよ」と指示する
- **役割限定型AIは役割外情報を無視する傾向**：例外処理を明示的に記載
- **システムプロンプトとユーザープロンプトの両方で指示**：冗長でも確実

---

## 備考

- エラーが発生したら、必ず原因と解決方法を記録する
- 同じエラーが3回以上発生したら、根本対策を検討する
- セキュリティ関連のエラーは特に詳細に記録する
