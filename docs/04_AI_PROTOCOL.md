# 04. AIプロトコル — ファイルベース連携仕様

## 概要

本ドキュメントは、AIエージェント（Claude Code等）が `testing-brain/` ディレクトリを通じて
テスト網羅性の管理を行うための **操作プロトコル** を定義する。

AIはこのドキュメントを読むことで、**何をどの順で、どのファイルに書けばよいか**を理解できる。

---

## プロトコルの基本ルール

### Rule 1: 常にJSONで書く
すべてのデータファイルはJSONまたはJSON Lines（.jsonl）形式。
人間にもAIにも読みやすく、パース可能な形式を維持する。

### Rule 2: 1サーフェス = 1ファイル
テスト対象の各画面・機能は `testing-brain/surfaces/` 配下に **1ファイルとして独立** させる。
巨大な単一ファイルの全書き換えを避け、部分更新を容易にする。

### Rule 3: ログは追記のみ
`ai-log.jsonl` は **追記（append）のみ** 許可。既存行の修正・削除は禁止。

### Rule 4: 冪等性の保証
同一のサーフェスファイルを同一内容で再書き込みしても、状態が変わらないこと。

---

## 操作フロー

AIエージェントは以下のフローに従って操作を行う。

### Phase 1: 初期化（Initialize）

対象プロジェクトを最初に解析する際に実行する。

```
1. testing-brain/config.json を読む（対象プロジェクトパス、除外パス等）
2. 対象プロジェクトのソースコードを解析する
3. 検出したサーフェスごとに testing-brain/surfaces/{surface-id}.json を作成する
4. testing-brain/surfaces/_index.json にサーフェス一覧を書き込む
5. testing-brain/progress.json に初期進捗を書き込む
6. testing-brain/ai-log.jsonl に初期化ログを追記する
```

### Phase 2: 観点追加（Add Viewpoints）

既存のサーフェスに対してテスト観点を追加する。

```
1. testing-brain/surfaces/{surface-id}.json を読む
2. ソースコードを解析し、追加すべき観点を特定する
3. viewpoints 配列に新しい観点を追加する
4. ファイルを書き戻す
5. progress.json を再計算して更新する
6. ai-log.jsonl にログを追記する
```

### Phase 3: ステータス更新（Update Status）

テストの消化結果を反映する。

```
1. testing-brain/surfaces/{surface-id}.json を読む
2. 該当する viewpoint の status を更新する
   - "untested" → "in_progress" → "passed"
   - "untested" → "omission"（テスト不要と判断した場合）
3. ファイルを書き戻す
4. progress.json を再計算して更新する
5. ai-log.jsonl にログを追記する
```

### Phase 4: 再帰発見（Recursive Discovery）

既存の観点を深掘りし、より詳細な観点を発見する。

```
1. testing-brain/surfaces/{surface-id}.json を読む
2. 各 viewpoint について、さらに細分化すべき観点がないか検討する
3. 必要であれば viewpoint の children に子観点を追加する
4. ファイルを書き戻す
5. progress.json を再計算して更新する
```

---

## AI向けクイックリファレンス

### ファイルパス一覧

| ファイル | 用途 | 操作 |
|---------|------|------|
| `testing-brain/config.json` | プロジェクト設定 | 読み取り |
| `testing-brain/surfaces/_index.json` | サーフェス一覧 | 読み書き |
| `testing-brain/surfaces/{id}.json` | 個別サーフェスの観点 | 読み書き |
| `testing-brain/progress.json` | 全体進捗サマリ | 読み書き |
| `testing-brain/ai-log.jsonl` | 操作ログ | 追記のみ |
| `testing-brain/templates/*.json` | 観点テンプレート | 読み取り |

### ステータス遷移図

```
                 ┌──────────┐
                 │ untested │ (初期状態)
                 └────┬─────┘
                      │
            ┌─────────┼─────────┐
            ▼                   ▼
    ┌──────────────┐    ┌─────────────┐
    │ in_progress  │    │  omission   │ (テスト対象外と判断)
    └──────┬───────┘    └─────────────┘
           │
           ▼
    ┌──────────────┐
    │   passed     │ (テスト完了)
    └──────────────┘
```

---

## AIへのプロンプト例

以下のようなプロンプトをClaude Codeに与えることで、本プロトコルに従った操作が行われる。

### 初期スキャン
```
testing-brain/docs/04_AI_PROTOCOL.md を読んでください。
次に、{対象プロジェクトのパス} のソースコードを解析し、
testing-brain/ 配下のファイルを初期化してください。
```

### 観点追加
```
testing-brain/surfaces/login-page.json を確認し、
異常系のテスト観点が不足していれば追加してください。
完了したら progress.json を更新してください。
```

### ステータス更新
```
testing-brain/surfaces/login-page.json の VP-003 のステータスを
"passed" に更新してください。
```

---

## エラーハンドリング

| 状況 | AIの対応 |
|------|---------|
| surfaces/ にファイルが存在しない | 新規作成する |
| JSON構文エラーがあるファイル | ai-log に警告を記録し、修正を試みる |
| 未知のステータス値 | "untested" にフォールバックする |
| config.json が存在しない | デフォルト設定で初期化する |
