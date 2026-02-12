# 05. データモデル — JSONスキーマ定義

## 概要

`testing-brain/` 配下のすべてのJSONファイルのスキーマをこのドキュメントで定義する。
AIはこのスキーマに従ってファイルを生成・更新し、GUIはこのスキーマを前提にパースする。

---

## 1. config.json — プロジェクト設定

```json
{
  "version": "1.0.0",
  "project": {
    "name": "My Web App",
    "description": "テスト対象プロジェクトの説明",
    "root_path": "../my-web-app",
    "exclude_paths": [
      "node_modules",
      "dist",
      ".git",
      "testing-brain"
    ]
  },
  "settings": {
    "auto_refresh_interval_ms": 3000,
    "default_template": "web-page"
  }
}
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| version | string | ✅ | スキーマバージョン |
| project.name | string | ✅ | プロジェクト名 |
| project.description | string | - | 説明文 |
| project.root_path | string | ✅ | テスト対象プロジェクトの相対パス |
| project.exclude_paths | string[] | - | 解析対象外のパス |
| settings.auto_refresh_interval_ms | number | - | GUIの自動更新間隔（ms） |
| settings.default_template | string | - | デフォルトのテンプレート名 |

---

## 2. surfaces/_index.json — サーフェス一覧

```json
{
  "last_updated": "2026-02-11T19:45:00+09:00",
  "surfaces": [
    {
      "id": "login-page",
      "name": "ログイン画面",
      "type": "page",
      "file_path": "surfaces/login-page.json",
      "source_files": ["src/pages/Login.tsx"],
      "viewpoint_count": 12,
      "progress": {
        "passed": 5,
        "in_progress": 2,
        "untested": 4,
        "omission": 1
      }
    }
  ]
}
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| last_updated | ISO 8601 string | ✅ | 最終更新日時 |
| surfaces[].id | string | ✅ | サーフェスの一意ID（ファイル名と一致） |
| surfaces[].name | string | ✅ | 人間が読める名前 |
| surfaces[].type | enum | ✅ | `page` / `component` / `api` / `workflow` |
| surfaces[].file_path | string | ✅ | サーフェスファイルへの相対パス |
| surfaces[].source_files | string[] | - | 対応するソースファイル |
| surfaces[].viewpoint_count | number | ✅ | 観点の総数 |
| surfaces[].progress | object | ✅ | ステータス別の件数 |

---

## 3. surfaces/{id}.json — 個別サーフェスの観点

```json
{
  "id": "login-page",
  "name": "ログイン画面",
  "type": "page",
  "description": "ユーザーがメールアドレスとパスワードでログインする画面",
  "source_files": ["src/pages/Login.tsx", "src/hooks/useAuth.ts"],
  "created_at": "2026-02-11T19:45:00+09:00",
  "updated_at": "2026-02-11T20:30:00+09:00",
  "viewpoints": [
    {
      "id": "VP-001",
      "category": "normal",
      "title": "正常なメールアドレスとパスワードでログインできる",
      "description": "有効な認証情報を入力してログインボタンを押すと、ダッシュボードに遷移する",
      "status": "passed",
      "priority": "must",
      "updated_at": "2026-02-11T20:00:00+09:00",
      "evidence": "E2Eテスト login.spec.ts#L15 で確認済み",
      "children": []
    },
    {
      "id": "VP-002",
      "category": "error",
      "title": "不正なパスワードでエラーメッセージが表示される",
      "description": "間違ったパスワードを入力した場合、適切なエラーメッセージが表示される",
      "status": "untested",
      "priority": "must",
      "updated_at": "2026-02-11T19:45:00+09:00",
      "evidence": null,
      "children": [
        {
          "id": "VP-002-1",
          "category": "error",
          "title": "パスワード1文字の場合",
          "status": "untested",
          "priority": "should",
          "children": []
        },
        {
          "id": "VP-002-2",
          "category": "boundary",
          "title": "パスワード最大長超過の場合",
          "status": "untested",
          "priority": "should",
          "children": []
        }
      ]
    }
  ]
}
```

### viewpoint フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | ✅ | 観点の一意ID（VP-XXX 形式） |
| category | enum | ✅ | `normal` / `error` / `boundary` / `state` / `performance` / `accessibility` / `display` / `data` |
| title | string | ✅ | 観点の件名（テスト内容を一行で） |
| description | string | - | 詳細な説明 |
| status | enum | ✅ | `untested` / `in_progress` / `passed` / `omission` |
| priority | enum | ✅ | `must` / `should` / `nice` |
| updated_at | ISO 8601 | - | 最終更新日時 |
| evidence | string | - | テスト完了のエビデンス（テストファイルパス等） |
| children | viewpoint[] | - | 子観点（再帰的な構造） |

### category の定義

| 値 | 説明 | 例 |
|----|------|-----|
| `normal` | 正常系 | 正しい入力で期待通りの結果 |
| `error` | 異常系 | 不正入力、サーバーエラー |
| `boundary` | 境界値 | 最小値、最大値、空文字 |
| `state` | 状態遷移 | ログイン後に再ログイン |
| `performance` | パフォーマンス | 大量データでの応答速度 |
| `accessibility` | アクセシビリティ | キーボード操作、ARIA |
| `display` | 表示 | レスポンシブ、長文表示 |
| `data` | データパターン | 0件、NULL、特殊文字 |

---

## 4. progress.json — 全体進捗サマリ

```json
{
  "last_updated": "2026-02-11T20:30:00+09:00",
  "overall": {
    "total_surfaces": 8,
    "total_viewpoints": 124,
    "passed": 45,
    "in_progress": 12,
    "untested": 62,
    "omission": 5,
    "exhaustiveness_percent": 36.3
  },
  "by_category": {
    "normal": { "total": 30, "passed": 20, "percent": 66.7 },
    "error": { "total": 35, "passed": 10, "percent": 28.6 },
    "boundary": { "total": 20, "passed": 5, "percent": 25.0 },
    "state": { "total": 15, "passed": 5, "percent": 33.3 },
    "performance": { "total": 8, "passed": 2, "percent": 25.0 },
    "accessibility": { "total": 6, "passed": 1, "percent": 16.7 },
    "display": { "total": 5, "passed": 1, "percent": 20.0 },
    "data": { "total": 5, "passed": 1, "percent": 20.0 }
  },
  "by_surface": [
    {
      "id": "login-page",
      "name": "ログイン画面",
      "total": 12,
      "passed": 5,
      "percent": 41.7
    }
  ]
}
```

### exhaustiveness_percent の計算式

```
exhaustiveness_percent = (passed / (total_viewpoints - omission)) * 100
```

※ `omission`（テスト対象外）は分母から除外する。

---

## 5. ai-log.jsonl — 操作ログ

JSON Lines 形式（1行 = 1エントリ）。追記のみ可。

```jsonl
{"timestamp":"2026-02-11T19:45:00+09:00","action":"initialize","agent":"claude-code","details":"プロジェクトの初期スキャン完了。8サーフェス、124観点を検出。"}
{"timestamp":"2026-02-11T19:50:00+09:00","action":"add_viewpoint","agent":"claude-code","surface_id":"login-page","viewpoint_id":"VP-003","details":"異常系観点（ネットワークエラー時）を追加。"}
{"timestamp":"2026-02-11T20:00:00+09:00","action":"update_status","agent":"claude-code","surface_id":"login-page","viewpoint_id":"VP-001","old_status":"untested","new_status":"passed","details":"E2Eテスト確認済み。"}
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| timestamp | ISO 8601 | ✅ | 操作日時 |
| action | enum | ✅ | `initialize` / `add_surface` / `add_viewpoint` / `update_status` / `delete_viewpoint` / `warning` |
| agent | string | ✅ | 操作を行ったAIの識別名 |
| surface_id | string | - | 対象サーフェスID |
| viewpoint_id | string | - | 対象観点ID |
| old_status | string | - | 変更前ステータス |
| new_status | string | - | 変更後ステータス |
| details | string | ✅ | 操作の詳細説明 |

---

## 6. templates/*.template.json — 観点テンプレート

AIが新しいサーフェスを作成する際に参照する雛形。

### web-page.template.json

```json
{
  "id": "{{surface-id}}",
  "name": "{{surface-name}}",
  "type": "page",
  "description": "",
  "source_files": [],
  "viewpoints": [
    {
      "id": "VP-001",
      "category": "normal",
      "title": "画面が正常に表示される",
      "status": "untested",
      "priority": "must",
      "children": []
    },
    {
      "id": "VP-002",
      "category": "error",
      "title": "APIエラー時にエラー表示される",
      "status": "untested",
      "priority": "must",
      "children": []
    },
    {
      "id": "VP-003",
      "category": "display",
      "title": "ローディング中の表示が適切",
      "status": "untested",
      "priority": "should",
      "children": []
    },
    {
      "id": "VP-004",
      "category": "data",
      "title": "データ0件時の表示が適切",
      "status": "untested",
      "priority": "should",
      "children": []
    },
    {
      "id": "VP-005",
      "category": "accessibility",
      "title": "キーボード操作で主要機能にアクセスできる",
      "status": "untested",
      "priority": "nice",
      "children": []
    }
  ]
}
```
