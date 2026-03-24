# Claude Code 設定

> このファイルを読んだら、以下のフローに従って行動してください。

---

## 1. セッション開始フロー

```
【セッション開始】
      ↓
[1] pwd でパス取得 → OSユーザー名を抽出
      ↓
[2] docs/PROJECT_CONFIG.md でメンバー確認
      ↓
    登録済み？ ─No→ 登録を案内して待機
      ↓ Yes
[3] docs/NEXT_ACTION.md を読む（現在の状況を把握）
      ↓
[4] docs/AUTO_UPDATE_FILES.yaml をチェック → 更新があれば反映
      ↓
[5] ユーザーの発言を待つ
      ↓
[6] モード判定（下記参照）
      ↓
    作業開始
```

---

## 2. メンバー確認

### OSユーザー名の抽出

パスから抽出：
- `C:\Users\xxx\...` → `xxx`
- `/Users/xxx/...` → `xxx`
- `/home/xxx/...` → `xxx`

### 登録済みの場合

```
「〇〇さん（xxx）ですね。NEXT_ACTION.md を確認します。」
```

### 未登録の場合

```
【初回セットアップが必要です】

OSユーザー名「xxx」がメンバー一覧にありません。

1. docs/PROJECT_CONFIG.md を開く
2. 「メンバー別設定」に自分を追加
3. git add → commit → push
4. 「設定完了」と教えてください
```

設定完了するまで作業は開始しない。

---

## 3. モード判定（重要）

ユーザーの発言で分岐する：

### 新規プロジェクト作成モード

**トリガーワード:**
- 「新規プロジェクト」「プロジェクト作成」「新しいプロジェクト」

**振る舞い:**
→ 下記「4. 新規プロジェクト作成」に従う

### 設計モード

**トリガーワード:**
- 「相談」「どう思う」「考えたい」「悩んでる」「壁打ち」「設計」「アイデア」

**振る舞い:**
→ 下記「5. 設計モード」に従う

### 実装モード

**トリガーワード:**
- 「作って」「実装して」「修正して」「追加して」「直して」「コード」

**振る舞い:**
→ 下記「6. 実装モード」に従う

### 不明な場合

```
何をしましょうか？

1. 新規プロジェクトを作成
2. 設計・アイデアの相談
3. 実装・コーディング
4. その他
```

と確認する。

---

## 4. 新規プロジェクト作成

ユーザーが「新規プロジェクトを作成したい」と言ったら、以下のフローでナビゲートする。

> **注意**: リポジトリ作成は issey-hedell（管理者）のみ実行可能。
> メンバーは作成済みリポジトリをクローンして作業を開始する。

### 作成フロー（管理者向け）

```
[1] プロジェクト名を聞く
      ↓
[2] GitHub リポジトリを作成
      ↓
[3] テンプレートをクローン → 新リポジトリに接続
      ↓
[4] GitHub Secrets を設定
      ↓
[5] 初回 push → ブランチ保護が自動設定される
      ↓
[6] PROJECT_CONFIG.md にユーザーを登録
      ↓
[7] 設計フェーズ開始（01_IDEA_SHEET.md から）
```

### 実行コマンド（管理者向け）

```powershell
# 1. プロジェクト名を変数に設定（ユーザーに聞いた名前）
$PROJECT_NAME = "project-name"

# 2. GitHub リポジトリ作成（プライベート）
gh repo create issey-hedell/$PROJECT_NAME --private --confirm

# 3. テンプレートをクローン
git clone https://github.com/issey-hedell/template.git $PROJECT_NAME
cd $PROJECT_NAME

# 4. リモートを新リポジトリに変更
git remote set-url origin https://github.com/issey-hedell/$PROJECT_NAME.git

# 5. GitHub Secrets を設定（必須）
gh secret set CLAUDE_API_KEY --repo issey-hedell/$PROJECT_NAME
gh secret set PAT_TOKEN --repo issey-hedell/$PROJECT_NAME
# オプション: gh secret set SLACK_WEBHOOK_URL --repo issey-hedell/$PROJECT_NAME

# 6. 初回プッシュ（これでブランチ保護が自動設定される）
git push -u origin main
```

> **自動化**: 初回 push 時に GitHub Actions（setup-repository.yml）が発火し、
> ブランチ保護（main/develop への直接 push 禁止、PR 必須、Guardian AI チェック必須）が自動設定されます。

### メンバー向け（クローンのみ）

```powershell
# 1. リポジトリをクローン
git clone https://github.com/issey-hedell/$PROJECT_NAME.git
cd $PROJECT_NAME

# 2. PROJECT_CONFIG.md に自分を登録
# → 手動で編集

# 3. 設計フェーズ開始
```

### 作成後の案内

```
プロジェクト「〇〇」を作成しました。

次のステップ:
1. PROJECT_CONFIG.md にあなたの情報を登録してください
2. 登録後、設計フェーズ（01_IDEA_SHEET.md）を始めましょう

何から相談しますか？
```

---

## 5. 設計モード

設計の相談・壁打ち時の振る舞い。

### 基本姿勢

- **議論相手として振る舞う**（作業者ではない）
- **結論を急がない**（相手の思考を整理する）
- **最終判断は相手に委ねる**（選択肢を提示し、決めるのは相手）
- **不明点は必ず質問する**（曖昧なまま進めない）

### 対話の進め方

1. **問題の構造を整理する**
```
【現状】
〇〇 → △△ → □□

【問題点】
ここがボトルネック
```

2. **選択肢を複数提示する**
```
### A. 〇〇する方法
- メリット:
- デメリット:

### B. △△する方法
- メリット:
- デメリット:
```

3. **推奨があれば示す**
```
僕の意見としては A を推奨。理由は...
どう思う？
```

4. **不明点は質問する**
```
確認させてください。
これは〇〇という理解でいい？
```

5. **相手の判断を待つ**
```
どのアプローチがしっくり来る？
```

6. **決まったらドキュメント化**

### 禁止事項

- いきなり結論を出さない
- 相手の代わりに決めない
- 曖昧なまま進めない
- 長文で一気に説明しない
- 作業者モードにならない（コードを書き始めない）

---

## 6. 実装モード

コードを書く時の振る舞い。

### 実装前の確認

1. `docs/NEXT_ACTION.md` を読んだか
2. 設計書（01-07）が完成しているか
3. 何を実装するか明確か

### コーディング規約

#### 禁止パターン

**1. `any` 型の使用**
```typescript
// NG
const data = response as any;

// OK
const data: ApiResponse = response;
```

**2. 型アサーションでのエラー回避**
```typescript
// NG
const value = someData as unknown as TargetType;

// OK
if (isTargetType(someData)) {
  const value = someData;
}
```

**3. React.FC の使用**
```typescript
// NG
export const Component: React.FC<Props> = ({ value }) => { ... }

// OK
export const Component = ({ value }: Props) => { ... }
```

**4. 名前空間インポート（React）**
```typescript
// NG
import React from 'react';
React.useState(0);

// OK
import { useState } from 'react';
useState(0);
```

例外: `<React.Fragment key={id}>` は名前空間インポートが必要

#### 設計原則

**1. 共通UIのコンポーネント化**
```
src/components/
├── layout/    # Header, Footer, Layout
├── ui/        # Button, Input, Modal, Toast
└── features/  # 機能別
```

**2. 設定・定数の外部化**
- APIエンドポイント → config
- 環境依存の値 → 環境変数
- マジックナンバー → 定数

**3. 型定義の集約**
```
src/types/
├── user.ts
├── api.ts
└── [domain].ts
```

#### 推奨パターン

- 1コンポーネント = 最大300行
- 使われないコードは即削除
- インポート順序: 外部 → 内部 → 相対

### コード品質保証（多重レビュー）

**重要: コードを提出する前に、必ず以下のセルフレビューを実施すること。**

「エラーはないはず」ではなく「エラーがある前提」で何度も見返す。

#### セルフレビュー手順（実装完了ごとに必ず実行）

1. **構文・型チェック（1回目）**
   - import / export の整合性
   - 型定義の不一致がないか
   - 未定義変数・関数の参照がないか

2. **ランタイムエラーチェック（2回目）**
   - null / undefined アクセスの可能性
   - 非同期処理のエラーハンドリング漏れ
   - API レスポンスの型と実際のデータ構造の不一致
   - 環境変数・設定値の未定義

3. **統合チェック（3回目）**
   - コンポーネント間の props 受け渡し
   - ルーティングとページコンポーネントの対応
   - データベーススキーマとクエリの整合性
   - ミドルウェア・認証フローの抜け

4. **実行シミュレーション（4回目）**
   - ユーザー操作の流れを頭の中でトレースする
   - エッジケース（空データ、大量データ、未認証）を想定
   - ブラウザコンソールに出そうなエラーを予測

#### 禁止

- ❌ 1回の確認だけで「問題ありません」と報告
- ❌ 静的に見て問題ないから動くはず、という判断
- ❌ エラーが出てから初めて考える（事前に想定する）

#### レビュー結果の報告

セルフレビュー完了後、以下を報告:
```
【セルフレビュー完了】
- 構文・型チェック: ✅ / ⚠️（指摘事項）
- ランタイムチェック: ✅ / ⚠️（指摘事項）
- 統合チェック: ✅ / ⚠️（指摘事項）
- 実行シミュレーション: ✅ / ⚠️（指摘事項）
```

### 実装中の行動

**先を見越した提案をする:**
- 「これも必要では？」
- 「後で困りそう」
- 「共通化できる」

**確認すべきタイミング:**
- 複数アプローチの選択
- 大幅な変更
- セキュリティ関連
- 外部サービス連携

### 実装完了時

**必須: 検証スクリプトの実行**

```bash
bash scripts/verify.sh
```

検証スクリプトは以下を自動検証:
- 静的検証（構文、Lint、型チェック）
- 実行検証（ビルド、サーバー起動）
- 機能検証（テスト実行）

**報告すること:**
- 変更したファイル一覧
- `bash scripts/verify.sh` の実行結果（全文）
- 動作確認の方法
- 残っている課題
- 次にやるべきこと

**ドキュメント更新の確認:**

変更内容に関連するドキュメントがあれば、以下のフォーマットで提案する:

```
📄 ドキュメント更新の提案:
- 〇〇.md に △△ を追加しますか？

  (1) 今回だけ更新
  (2) 今後も自動更新
  (3) 更新しない

💡 今後も自動更新が必要なファイルがあれば
  「〇〇 自動更新」と伝えてください。
```

詳細は「10. ドキュメント自動更新」を参照。

詳細は `.cc-rules.md` を参照。

---

## 7. 共通ルール

### 言語設定

- すべての説明・出力は**日本語**
- コミットメッセージも日本語
- コードのコメントも日本語

### 環境判定

| 項目 | Windows | Mac |
|------|---------|-----|
| パス区切り | `\` | `/` |
| ターミナル | PowerShell | Terminal |
| 改行コード | CRLF | LF |
| スクリプト | `.ps1` | `.sh` |

コマンド提示時は環境に合わせる。

### 自律作業モード

以下の発言で発動:
- 「確認なしで進めて」
- 「席を外すので進めておいて」
- 「自律的に作業して」

**自律モード時:**
- エラーは自分で解決を試みる
- 作業完了後に結果を報告
- 重大問題（データ削除、本番障害）のみ停止

**自律モードでも守ること:**
- Git push は慎重に
- シークレットキーの扱いは慎重に
- 作業内容は必ず記録

### 完全自律モード

以下の発言で発動:
- 「完全自律モード」
- 「フルオートで」
- 「全部任せる」

**通常の自律モードとの違い:**

完全自律モードでは、**一切の確認・承認・質問を行わず**、すべてを自動的に進める。

**完全自律モード時のルール:**
- ユーザーへの確認は一切しない（設計判断、実装方針、ファイル変更すべて自己判断）
- 選択肢がある場合はベストプラクティスに基づき自分で決定
- エラーが発生したら自分で修正し、修正完了まで繰り返す
- 作業が完了するまで止まらない
- Git commit / push も自動的に行う（指示された範囲内で）
- ドキュメント更新も必要に応じて自動で行う
- すべての判断理由は作業完了後にまとめて報告

**完全自律モードでも守ること（絶対）:**
- シークレットキー・認証情報の漏洩防止
- 本番環境への破壊的操作の禁止
- セルフレビュー（多重レビュー）は必ず実施
- 検証スクリプト（verify.sh）の実行は省略しない

### デプロイ

```bash
# 1. プッシュ
git add -A && git commit -m "メッセージ" && git push

# 2. デプロイ（PROJECT_CONFIG.md のコマンドを使用）
```

デプロイ前チェック:
- [ ] git push 完了
- [ ] デプロイコマンド実行
- [ ] 本番URLで動作確認

### ブランチ運用ルール

**push すれば自動で品質チェック → テスト → デプロイが実行される。**

```bash
# 作業してコミット・プッシュ
git add .
git commit -m "変更内容"
git push
```

**自動実行されるフロー:**
```
push（どのブランチでも）
    ↓
Guardian AI（静的チェック + Claude レビュー）
    ↓ 成功時のみ
Test Automation（ユニット・E2E テスト）
    ↓ 成功時のみ
Deploy（main→本番 / develop→ステージング / その他→プレビュー）
```

**エラーがあればデプロイされない。** 安心して push できる。

**ブランチ命名規則（推奨）:**
- `feat/機能名` - 新機能
- `fix/バグ名` - バグ修正
- `test/テスト名` - テスト追加
- 障害発生時の原因追跡が困難になる

### PRと自動マージ

**自動マージされるケース:**
- `feat/*`, `feature/*`, `fix/*`, `test/*` → develop or main
- ガーディアンAI → テスト → デプロイ → 全て成功で自動マージ

**自動マージされないケース:**
- `develop → main`（本番反映）

### 本番反映（develop → main）

ユーザーが「本番反映して」と言ったら、以下を実行:

```
1. develop と main の差分を確認
   git log main..develop --oneline

2. 変更内容を報告
   「以下の変更を本番に反映します:
    - feat/xxx: 機能A追加
    - fix/yyy: バグB修正

   よろしいですか？」

3. ユーザーがOK → マージ実行
   git checkout main
   git merge develop
   git push origin main
```

---

## 8. 関連ドキュメント

### 設計フェーズ（01-07）

| ファイル | 内容 |
|---------|------|
| `docs/01_IDEA_SHEET.md` | アイデア整理・MVP定義 |
| `docs/02_REQUIREMENTS.md` | 要件定義 |
| `docs/03_BASIC_DESIGN.md` | 基本設計 |
| `docs/04_DETAILED_DESIGN.md` | 詳細設計 |
| `docs/05_DESIGN_CHECKLIST.md` | 設計完了チェック |
| `docs/06_SITEMAP.md` | 画面一覧・遷移図 |
| `docs/07_UI_PATTERN_RULES.md` | UIパターン定義 |

### 運用ドキュメント

| ファイル | 内容 | 更新タイミング |
|---------|------|---------------|
| `docs/PROJECT_CONFIG.md` | プロジェクト設定 | プロジェクト開始時 |
| `docs/NEXT_ACTION.md` | 次回作業・決定事項 | （後で定義） |
| `docs/IMPLEMENTATION_CHECKLIST.md` | 実装時の注意点 | 新知見追加時 |
| `docs/VERIFICATION_CHECKLIST.md` | 検証チェックリスト | 検証時 |
| `docs/AUTO_UPDATE_FILES.yaml` | 自動更新対象ファイル設定 | 自動更新追加・解除時 |
| `docs/generated/` | 自動生成ドキュメント | 自動（セッション開始時・実装完了時） |
| `docs/error-logs/` | エラーログ | エラー発生時（自動収集） |

---

## 9. プロジェクト初期設定（あなたが誘導する）

プロジェクト作成後、以下の設定が必要かユーザーに確認する。

### Slack通知設定

Guardian AIやデプロイ失敗時にSlack通知を受け取りたい場合に設定。

**ユーザーへの案内:**
```
【Slack通知の設定】

チームへの通知を有効にしますか？
設定すると以下のタイミングでSlack通知が届きます:
- Guardian AIで中・高リスク検出時
- デプロイ失敗時

設定する場合、以下の手順で進めてください:

1. Slack App作成
   https://api.slack.com/apps → Create New App

2. Incoming Webhooks有効化
   App設定 → Incoming Webhooks → On

3. Webhook URL取得
   Add New Webhook to Workspace → チャンネル選択
   → Webhook URL をコピー

4. GitHubシークレットに登録
   gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/xxx"

不要であればスキップしても問題ありません。
```

### その他の初期設定

| 設定項目 | 必須 | 説明 |
|---------|------|------|
| `CLAUDE_API_KEY` | Yes | Guardian AI用（テンプレートから引継ぎ） |
| `PAT_TOKEN` | Yes | 自動PR・マージ用（テンプレートから引継ぎ） |
| `SLACK_WEBHOOK_URL` | No | Slack通知用 |
| デプロイ関連 | No | Vercel/AWS等の設定（`deploy-config.yml`で指定）|

---

## 10. ドキュメント自動更新

プロジェクト進行中に更新が必要なドキュメント（ディレクトリ構成、UI設計、API一覧など）を自動更新する仕組み。

### 設定ファイル

`docs/AUTO_UPDATE_FILES.yaml` で自動更新対象を管理。

```yaml
version: 1

files:
  - path: docs/generated/DIRECTORY_STRUCTURE.md
    type: directory_tree
    source: src/
    exclude:
      - node_modules/
      - .git/
    added_by: user
    added_at: 2026-01-15
    last_updated: 2026-01-15

settings:
  check_on_session_start: true
  suggest_on_implementation: true
```

### 対応する type

| type | 説明 | source の意味 |
|------|------|---------------|
| `directory_tree` | ディレクトリ構成図 | 対象ディレクトリ |
| `sitemap` | 画面一覧・遷移図 | pages/ や routes/ |
| `api_list` | API エンドポイント一覧 | routes/ や controllers/ |
| `component_list` | コンポーネント一覧 | components/ |
| `type_definitions` | 型定義一覧 | types/ や *.d.ts |
| `custom` | カスタム（Claude が判断） | 任意 |

### チェックタイミング

1. **セッション開始時**: `settings.check_on_session_start: true` の場合
2. **実装完了時**: `settings.suggest_on_implementation: true` の場合

### トリガーワード

**追加:**
- 「〇〇 自動更新」「〇〇 自動更新して」

例:
- 「ディレクトリ構成を自動更新して」
- 「API一覧を自動更新」

**解除:**
- 「〇〇 自動更新やめて」

例:
- 「ディレクトリ構成の自動更新やめて」

### Claude からの提案フォーマット

実装完了時やセッション開始時に、更新が必要なドキュメントを検出した場合:

```
📄 ドキュメント更新の提案:
- 〇〇.md に △△ を追加しますか？

  (1) 今回だけ更新
  (2) 今後も自動更新
  (3) 更新しない

💡 今後も自動更新が必要なファイルがあれば
  「〇〇 自動更新」と伝えてください。
```

### 自動更新の流れ

```
【セッション開始時】
AUTO_UPDATE_FILES.yaml を読む
    ↓
files 配列をチェック
    ↓
source に変更があるか確認
    ↓
変更あり → 対象ドキュメントを更新
    ↓
last_updated を更新

【実装完了時】
変更したファイルを分析
    ↓
関連するドキュメントがあるか確認
    ↓
あれば → 提案フォーマットで確認
    ↓
ユーザーが選択:
  (1) → 今回だけ更新
  (2) → 更新 + AUTO_UPDATE_FILES.yaml に追加
  (3) → スキップ
```

### 生成ドキュメントの配置

自動生成されるドキュメントは `docs/generated/` に配置:

```
docs/
├── generated/           # 自動生成ドキュメント
│   ├── DIRECTORY_STRUCTURE.md
│   ├── API_LIST.md
│   ├── COMPONENT_LIST.md
│   └── ...
├── AUTO_UPDATE_FILES.yaml
└── ...
```
