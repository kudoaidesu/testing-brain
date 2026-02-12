# 02. アーキテクチャ — 全体構成と設計原則

## 設計原則

### Principle 1: File-First（ファイルが真実の情報源）

すべてのテスト状態は **ファイルシステム上のJSON** に保存される。
データベースは使わない。理由は以下の通り：

- AIエージェント（Claude Code等）がファイルの読み書きを最も得意とする
- Git管理可能（変更履歴が自動的に残る）
- 人間もテキストエディタで直接確認・修正できる
- ポータビリティが高い（コピーするだけで別環境に移行可能）

### Principle 2: Read-Only GUI（GUIは読み取り専用）

GUIは `testing-brain/` 配下のJSONファイルを **読み取って表示するだけ** の存在。
データの書き込みは原則としてAIが行う。
これにより、GUIの実装がシンプルになり、AIとGUIの競合が発生しない。

### Principle 3: Recursive Discovery（再帰的発見）

網羅性の管理は1回で完了しない。
AIが1回目のスキャンで発見した観点に対して、さらに深掘りの観点を再帰的に発見する。

例：
```
画面A → ボタンB → 正常系 → 完了
画面A → ボタンB → 異常系 → 未テスト ← これをAIが再帰的に発見
画面A → ボタンB → 異常系 → ネットワークエラー → 未テスト ← さらに深掘り
```

---

## システム構成図

```
┌─────────────────────────────────────────────────────┐
│                   Human (You)                        │
│                                                      │
│   ┌──────────────┐    ┌──────────────────────────┐  │
│   │  Browser      │    │  VSCode / Terminal        │  │
│   │  (GUI閲覧)    │    │  (AI操作・ファイル確認)   │  │
│   └──────┬───────┘    └──────────┬───────────────┘  │
│          │ HTTP (read-only)      │ File I/O          │
└──────────┼───────────────────────┼──────────────────┘
           │                       │
           ▼                       ▼
┌──────────────────────────────────────────────────────┐
│              Project Root                             │
│                                                       │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │  testing-brain/      │  │  src/ (GUI Source)      │ │
│  │  (AIが読み書き)      │  │  (Vite + React)        │ │
│  │                      │  │                         │ │
│  │  ├── config.json     │  │  App.tsx                │ │
│  │  ├── surfaces/       │◄─┤  (JSONを読み取って      │ │
│  │  │   ├── page-a.json │  │   ダッシュボード表示)   │ │
│  │  │   └── page-b.json │  │                         │ │
│  │  ├── progress.json   │  └────────────────────────┘ │
│  │  └── ai-log.jsonl    │                             │
│  └─────────────────────┘                              │
│                                                       │
│          ▲                                            │
│          │ File I/O (read & write)                    │
│          │                                            │
│  ┌───────┴──────────────────────────────────────────┐ │
│  │  AI Agent (Claude Code)                           │ │
│  │                                                    │ │
│  │  1. プロジェクトのソースコードを解析               │ │
│  │  2. テスト観点を発見し surfaces/*.json に書き込み  │ │
│  │  3. テスト実行結果を progress.json に反映          │ │
│  │  4. 操作ログを ai-log.jsonl に追記                │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
testing-brain/                    ← AIとの通信プロトコル（=データ層）
├── config.json                   ← プロジェクト設定（対象リポ、除外パス等）
├── surfaces/                     ← 画面・機能単位のテスト観点
│   ├── _index.json               ← サーフェス一覧（メタデータ）
│   ├── login-page.json           ← 例: ログイン画面のテスト観点
│   ├── dashboard.json            ← 例: ダッシュボード画面
│   └── api-user-create.json      ← 例: API エンドポイント
├── progress.json                 ← 全体進捗サマリ（GUIのトップに表示）
├── ai-log.jsonl                  ← AIの操作ログ（時系列、JSON Lines形式）
└── templates/                    ← 観点テンプレート（AIが参照する雛形）
    ├── web-page.template.json    ← WEBページ用テンプレート
    ├── api-endpoint.template.json← API用テンプレート
    └── component.template.json   ← コンポーネント用テンプレート

src/                              ← GUI（Vite + React + Tailwind）
├── main.tsx
├── App.tsx
├── index.css
├── components/
│   ├── Dashboard.tsx             ← メインダッシュボード
│   ├── SurfaceCard.tsx           ← 個別サーフェスの表示カード
│   ├── ExhaustivenessBar.tsx     ← 網羅率バー
│   ├── FogOfWarGrid.tsx          ← Fog of War 可視化
│   ├── AiLogFeed.tsx             ← AI操作ログのリアルタイム表示
│   └── OmissionAlert.tsx         ← 漏れ検出アラート
├── hooks/
│   └── useBrainData.ts           ← testing-brain のJSONを定期取得するフック
├── types/
│   └── brain.ts                  ← TypeScript型定義
└── lib/
    └── parser.ts                 ← JSONパーサ・集計ロジック

docs/                             ← ドキュメント（今ここ）
├── 01_VISION.md
├── 02_ARCHITECTURE.md
├── 03_REQUIREMENTS.md
├── 04_AI_PROTOCOL.md
├── 05_DATA_MODEL.md
└── 06_UI_SPEC.md

public/                           ← 静的ファイル（Viteが配信）
```

---

## 技術スタック

| レイヤー | 技術 | 選定理由 |
|---------|------|---------|
| フロントエンド | React 18 + TypeScript | エコシステムの成熟度、型安全性 |
| ビルドツール | Vite (SWC) | 最速のHMR、開発体験 |
| スタイリング | Tailwind CSS 3 | ユーティリティファースト、一貫性 |
| アニメーション | Framer Motion | 宣言的で滑らかなUI |
| アイコン | Lucide React | 軽量・統一的なアイコンセット |
| データ層 | JSONファイル (testing-brain/) | AI操作に最適、Git管理可能 |
| AI連携 | Claude Code (ファイルI/O) | ファイルの読み書きによる疎結合連携 |
| バージョン管理 | Git | testing-brainの変更履歴も追跡 |

---

## データフロー

```
1. 人間が「テスト観点を洗い出して」とAIに指示
     ↓
2. AIがプロジェクトのソースコードを解析
     ↓
3. AIが testing-brain/surfaces/*.json を作成・更新
     ↓
4. AIが testing-brain/progress.json を再計算
     ↓
5. AIが testing-brain/ai-log.jsonl に操作ログを追記
     ↓
6. GUIが定期的に(3秒間隔)JSONを再読み込み
     ↓
7. ダッシュボードが更新され、人間が視覚的に確認
     ↓
8. 人間が「ここが漏れている」と気づき、AIに追加指示
     ↓
9. 2に戻る（再帰的改善ループ）
```
