# クイックガイド（1枚で分かる使い方）

---

## 誰が・いつ・何を使う？

| 担当 | フェーズ | やること | Claudeに読ませるファイル |
|------|---------|---------|------------------------|
| 設計者 | アイデア | 01_IDEA_SHEET.md を作成 | なし or DISCUSSION_MODE_RULES.md |
| 設計者+AI | 要件定義 | 02_REQUIREMENTS.md 作成 | DISCUSSION_MODE_RULES.md |
| 設計者+AI | 基本設計 | 03_BASIC_DESIGN.md 作成 | DISCUSSION_MODE_RULES.md |
| 設計者+AI | 詳細設計 | 04_DETAILED_DESIGN.md 作成 | DISCUSSION_MODE_RULES.md |
| 設計者+AI | 設計チェック | 05_DESIGN_CHECKLIST.md 確認 | DISCUSSION_MODE_RULES.md |
| 設計者+AI | 画面設計 | 06_SITEMAP.md 作成 | DISCUSSION_MODE_RULES.md |
| 設計者+AI | UIルール | 07_UI_PATTERN_RULES.md 作成 | DISCUSSION_MODE_RULES.md |
| Claude Code | 実装 | コードを書く | CLAUDE.md（自動で読み込み） |
| 実装者 | 検証 | VERIFICATION_CHECKLIST.md 確認 | なし（手動確認） |

---

## 設計者：アイデアを作成する

### やり方1：Claudeにアイデアを整理してもらう（推奨）

```
docs/01_IDEA_SHEET.md のテンプレートを読んでください。

以下のアイデアを整理して、テンプレートを埋めてください。

【アイデア】
・〇〇みたいなサービス作りたい
・ターゲットは△△な人
・参考UI: https://...
・これとこれができればOK
```

→ Claudeが 01_IDEA_SHEET.md を埋めて出力
→ 確認・修正して次のフェーズへ

### やり方2：壁打ちしながら整理する

```
docs/DISCUSSION_MODE_RULES.md を読んでください。
アイデアを整理したいので、壁打ち相手になってください。

〇〇みたいなサービスを考えてるんだけど...
```

→ Claudeと対話しながらアイデアを固める
→ 最後に 01_IDEA_SHEET.md を出力してもらう

---

## 設計者+AI：設計書を作成する

### 手順

```
docs/DISCUSSION_MODE_RULES.md を読んでください。
docs/01_IDEA_SHEET.md を読んで、
02_REQUIREMENTS.md（要件定義）を一緒に作成してください。
```

→ 02 が完成したら 03 → 04 → 05 → 06 → 07 の順で進める

### 各フェーズの指示例

**要件定義**
```
01_IDEA_SHEET.md を読んで、02_REQUIREMENTS.md を作成してください。
```

**基本設計**
```
01と02を読んで、03_BASIC_DESIGN.md を作成してください。
```

**詳細設計**
```
01〜03を読んで、04_DETAILED_DESIGN.md を作成してください。
```

**設計チェック**
```
01〜04を読んで、05_DESIGN_CHECKLIST.md をチェックしてください。
抜け漏れがあれば教えてください。
```

**画面設計**
```
01〜05を読んで、06_SITEMAP.md を作成してください。
```

**UIルール**
```
01〜06を読んで、07_UI_PATTERN_RULES.md を作成してください。
```

---

## Claude Code：実装する

### 手順

1. `CLAUDE.md` をプロジェクトルートに置く（自動で読み込まれる）

2. Claude Code に指示：
```
まず CLAUDE.md を読んでから作業してください。

【依頼内容】
〇〇を実装してください。
設計書は docs/ にあります。
```

3. 進捗は `docs/NEXT_ACTION.md` で管理

---

## 実装者：検証する

### 手順

1. `docs/VERIFICATION_CHECKLIST.md` を開く
2. チェック項目に沿って動作確認
3. バグがあれば「バグ報告」セクションに記録
4. 全項目OKでローンチ

---

## 実装開始の条件（重要）

**以下が全部揃うまで実装を開始しない**

- [ ] 01_IDEA_SHEET.md が記入済み
- [ ] 02_REQUIREMENTS.md が作成済み
- [ ] 03_BASIC_DESIGN.md が作成済み
- [ ] 04_DETAILED_DESIGN.md が作成済み
- [ ] 05_DESIGN_CHECKLIST.md が全項目OK
- [ ] 06_SITEMAP.md が作成済み
- [ ] 07_UI_PATTERN_RULES.md が作成済み

---

## ファイル一覧

```
project/
├── CLAUDE.md                    ← 実装時に自動読み込み
├── QUICK_GUIDE.md               ← このファイル
├── README.md                    ← 詳細な説明
│
└── docs/
    ├── 【設計フェーズ（01-07）】
    │   ├── 01_IDEA_SHEET.md         ← 設計者が作成
    │   ├── 02_REQUIREMENTS.md       ← 設計者+AIが作成
    │   ├── 03_BASIC_DESIGN.md       ← 設計者+AIが作成
    │   ├── 04_DETAILED_DESIGN.md    ← 設計者+AIが作成
    │   ├── 05_DESIGN_CHECKLIST.md   ← 設計者+AIが確認
    │   ├── 06_SITEMAP.md            ← 設計者+AIが作成
    │   └── 07_UI_PATTERN_RULES.md   ← 設計者+AIが作成
    │
    ├── 【プロジェクト設定】
    │   └── PROJECT_CONFIG.md        ← 環境・メンバー設定
    │
    ├── 【実装フェーズ】
    │   ├── NEXT_ACTION.md           ← 進捗管理
    │   └── IMPLEMENTATION_CHECKLIST.md ← 実装時注意点
    │
    ├── 【技術別チェックリスト】
    │   └── checklists/
    │
    ├── 【検証】
    │   └── VERIFICATION_CHECKLIST.md ← 検証用
    │
    ├── 【エラー・シークレット】
    │   ├── error-logs/
    │   └── SECRETS.md
    │
    ├── 【運用ルール】
    │   ├── DISCUSSION_MODE_RULES.md   ← 設計時に読ませる
    │   └── CLAUDE_CODE_OPERATION.md ← 運用ルール
    │
    └── 【オンボーディング】
        ├── ONBOARDING_CHECKLIST.md  ← 初回セットアップ
        └── INVITE_TEMPLATE.md       ← 招待テンプレート
```

---

## 新メンバーの方へ

1. `docs/onboarding/ONBOARDING_CHECKLIST.md` を開く
2. チェックリストに沿って初回セットアップ
3. `docs/PROJECT_CONFIG.md` に自分を登録
4. 完了後、作業開始

**登録しないと commit できません！**
