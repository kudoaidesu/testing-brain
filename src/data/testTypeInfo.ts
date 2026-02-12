import type { TestType } from '../types/brain';
import type { Language } from '../i18n/i18n';

export interface TestTypeInfo {
    name: string;
    description: string;
    purpose: string;
    targetValue: string;
    tools: string[];
    tips?: string;
}

type LocalizedInfo = Record<Language, TestTypeInfo>;

const data: Record<TestType, LocalizedInfo> = {
    unit: {
        ja: {
            name: '単体テスト',
            description: '個々の関数やクラスを他の依存関係から分離してテストします。',
            purpose: 'ロジック単位の正確性を保証し、リグレッションを早期検出します。',
            targetValue: '行カバレッジ 80%以上、分岐カバレッジ 70%以上が一般的な目標。クリティカルなビジネスロジックは 90%以上を推奨。',
            tools: ['Jest', 'Vitest', 'Mocha'],
            tips: 'テスト数よりカバレッジの質（分岐網羅）が重要です。',
        },
        en: {
            name: 'Unit Tests',
            description: 'Tests individual functions or classes in isolation from dependencies.',
            purpose: 'Ensures correctness at the logic level and catches regressions early.',
            targetValue: 'Line coverage ≥ 80%, branch coverage ≥ 70%. Critical business logic should aim for ≥ 90%.',
            tools: ['Jest', 'Vitest', 'Mocha'],
            tips: 'Quality of coverage (branch coverage) matters more than test count.',
        },
    },
    integration: {
        ja: {
            name: '結合テスト',
            description: '複数モジュール間の連携を検証します。DB接続やAPI呼び出しを含みます。',
            purpose: 'モジュール間のインターフェース整合性を保証します。',
            targetValue: '主要な結合パターンの 80%以上をカバー。失敗率 5%以下が目標。',
            tools: ['Jest', 'Supertest', 'TestContainers'],
        },
        en: {
            name: 'Integration Tests',
            description: 'Validates interactions between multiple modules, including DB and API calls.',
            purpose: 'Ensures interface compatibility between modules.',
            targetValue: 'Cover ≥ 80% of key integration patterns. Failure rate < 5%.',
            tools: ['Jest', 'Supertest', 'TestContainers'],
        },
    },
    e2e: {
        ja: {
            name: 'E2Eテスト',
            description: 'ユーザーの操作フロー全体をブラウザ上でシミュレーションします。',
            purpose: 'ユーザー視点でのシステム全体の動作を保証します。',
            targetValue: 'クリティカルパス（ログイン、購入、登録等）の 100%カバーが理想。合格率 95%以上。',
            tools: ['Playwright', 'Cypress', 'Selenium'],
            tips: 'フレイキーテスト対策（リトライ・待機戦略）が重要です。',
        },
        en: {
            name: 'E2E Tests',
            description: 'Simulates full user flows in a real browser environment.',
            purpose: 'Validates the entire system works from the user\'s perspective.',
            targetValue: '100% coverage of critical paths (login, checkout, registration). Pass rate ≥ 95%.',
            tools: ['Playwright', 'Cypress', 'Selenium'],
            tips: 'Flaky test mitigation (retry & wait strategies) is essential.',
        },
    },
    api: {
        ja: {
            name: 'APIテスト',
            description: 'REST/GraphQL等のAPIエンドポイントの正常・異常レスポンスを検証します。',
            purpose: 'API契約（ステータスコード、レスポンス構造）の正確性を保証します。',
            targetValue: '全エンドポイント × 主要レスポンスコード（200, 400, 401, 404, 500）のカバー。合格率 95%以上。',
            tools: ['Supertest', 'REST Assured', 'Postman'],
        },
        en: {
            name: 'API Tests',
            description: 'Validates response behavior of REST/GraphQL endpoints for success and error cases.',
            purpose: 'Ensures API contract accuracy (status codes, response structures).',
            targetValue: 'Cover all endpoints × major status codes (200, 400, 401, 404, 500). Pass rate ≥ 95%.',
            tools: ['Supertest', 'REST Assured', 'Postman'],
        },
    },
    visual: {
        ja: {
            name: '外観テスト',
            description: 'UIコンポーネントのスナップショットを比較し、意図しない外観変更を検出します。',
            purpose: 'CSSリグレッションを防止し、UIの一貫性を保証します。',
            targetValue: '主要コンポーネントの全バリアント（状態・テーマ）をカバー。差分検出率 0%が理想。',
            tools: ['Chromatic', 'Percy', 'Storybook'],
        },
        en: {
            name: 'Visual Tests',
            description: 'Compares UI component snapshots to detect unintended visual changes.',
            purpose: 'Prevents CSS regressions and ensures UI consistency.',
            targetValue: 'Cover all variants (states & themes) of key components. Ideal diff detection: 0%.',
            tools: ['Chromatic', 'Percy', 'Storybook'],
        },
    },
    accessibility: {
        ja: {
            name: 'アクセシビリティテスト',
            description: 'WCAG基準に基づき、スクリーンリーダーやキーボード操作での利用可能性を検証します。',
            purpose: '障がいのあるユーザーを含む全ユーザーのアクセス可能性を保証します。',
            targetValue: 'Lighthouseスコア 90以上。Critical/Serious違反 0件。WCAG 2.1 AA準拠。',
            tools: ['axe-core', 'Lighthouse', 'pa11y'],
            tips: '自動テストで検出できるのは約30%。手動テストとの併用が必須です。',
        },
        en: {
            name: 'Accessibility Tests',
            description: 'Validates usability with screen readers and keyboard navigation based on WCAG standards.',
            purpose: 'Ensures accessibility for all users, including those with disabilities.',
            targetValue: 'Lighthouse score ≥ 90. Zero critical/serious violations. WCAG 2.1 AA compliant.',
            tools: ['axe-core', 'Lighthouse', 'pa11y'],
            tips: 'Automated tests catch only ~30% of issues. Manual testing is essential.',
        },
    },
    performance: {
        ja: {
            name: '性能テスト',
            description: 'ページ読み込み速度、Core Web Vitals、バンドルサイズを計測します。',
            purpose: 'ユーザー体験に直結するパフォーマンス指標を維持します。',
            targetValue: 'LCP < 2.5s, FID < 100ms, CLS < 0.1。Lighthouseスコア 90以上。',
            tools: ['Lighthouse', 'WebPageTest', 'webpack-bundle-analyzer'],
        },
        en: {
            name: 'Performance Tests',
            description: 'Measures page load speed, Core Web Vitals, and bundle sizes.',
            purpose: 'Maintains performance metrics directly impacting user experience.',
            targetValue: 'LCP < 2.5s, FID < 100ms, CLS < 0.1. Lighthouse score ≥ 90.',
            tools: ['Lighthouse', 'WebPageTest', 'webpack-bundle-analyzer'],
        },
    },
    security: {
        ja: {
            name: 'セキュリティテスト',
            description: 'OWASP Top 10を中心に脆弱性スキャン・依存関係監査を行います。',
            purpose: '既知の脆弱性を排除し、安全なアプリケーションを維持します。',
            targetValue: 'Critical/High脆弱性 0件。OWASP Top 10全項目カバー。依存パッケージ脆弱性 0件。',
            tools: ['Snyk', 'OWASP ZAP', 'npm audit'],
        },
        en: {
            name: 'Security Tests',
            description: 'Performs vulnerability scanning and dependency auditing, focusing on OWASP Top 10.',
            purpose: 'Eliminates known vulnerabilities and maintains application security.',
            targetValue: 'Zero critical/high vulnerabilities. Full OWASP Top 10 coverage. Zero dependency vulnerabilities.',
            tools: ['Snyk', 'OWASP ZAP', 'npm audit'],
        },
    },
    contract: {
        ja: {
            name: '契約テスト',
            description: 'マイクロサービス間のAPI契約（リクエスト/レスポンス形式）を検証します。',
            purpose: 'サービス間の互換性を保証し、統合時の障害を防止します。',
            targetValue: '全コンシューマ-プロバイダ間の契約カバー。合格率 100%が理想。',
            tools: ['Pact', 'Spring Cloud Contract'],
        },
        en: {
            name: 'Contract Tests',
            description: 'Validates API contracts (request/response formats) between microservices.',
            purpose: 'Ensures service compatibility and prevents integration failures.',
            targetValue: 'Cover all consumer-provider contracts. Ideal pass rate: 100%.',
            tools: ['Pact', 'Spring Cloud Contract'],
        },
    },
    mutation: {
        ja: {
            name: '変異テスト',
            description: 'ソースコードに意図的なバグ（変異体）を挿入し、テストが検出できるかを検証します。',
            purpose: 'テストスイートの品質（バグ検出能力）を定量的に評価します。',
            targetValue: 'ミューテーションスコア 80%以上。生存変異体を定期的に確認。',
            tools: ['Stryker', 'PIT'],
            tips: '実行時間が長いため、CIではクリティカルファイルのみに限定推奨。',
        },
        en: {
            name: 'Mutation Tests',
            description: 'Injects intentional bugs (mutants) into source code to verify test detection ability.',
            purpose: 'Quantitatively evaluates test suite quality (bug detection capability).',
            targetValue: 'Mutation score ≥ 80%. Regularly review surviving mutants.',
            tools: ['Stryker', 'PIT'],
            tips: 'Due to long execution times, limit to critical files in CI.',
        },
    },
    smoke: {
        ja: {
            name: 'スモークテスト',
            description: 'デプロイ後に主要エンドポイントやページの疎通確認を行います。',
            purpose: 'デプロイ後のシステム基本動作を迅速に確認します。',
            targetValue: '全クリティカルエンドポイントの疎通確認。応答時間 < 5秒。合格率 100%。',
            tools: ['curl', 'Playwright', 'カスタムスクリプト'],
        },
        en: {
            name: 'Smoke Tests',
            description: 'Quick health checks on key endpoints and pages after deployment.',
            purpose: 'Rapidly verifies basic system functionality post-deployment.',
            targetValue: 'Verify all critical endpoints. Response time < 5s. 100% pass rate.',
            tools: ['curl', 'Playwright', 'Custom Scripts'],
        },
    },
    load: {
        ja: {
            name: '負荷テスト',
            description: '高トラフィック下でのシステム挙動（レイテンシ、エラー率）を計測します。',
            purpose: '本番環境での性能要件を満たすことを確認します。',
            targetValue: 'P95レイテンシ < 500ms。エラー率 < 1%。想定ピークの1.5倍で安定動作。',
            tools: ['k6', 'JMeter', 'Gatling'],
        },
        en: {
            name: 'Load Tests',
            description: 'Measures system behavior under high traffic (latency, error rates).',
            purpose: 'Validates the system meets production performance requirements.',
            targetValue: 'P95 latency < 500ms. Error rate < 1%. Stable at 1.5× expected peak.',
            tools: ['k6', 'JMeter', 'Gatling'],
        },
    },
    snapshot: {
        ja: {
            name: 'スナップショットテスト',
            description: 'コンポーネントのレンダリング出力を前回のスナップショットと比較します。',
            purpose: '意図しないUI変更を検出し、変更の意図を明示的にレビューします。',
            targetValue: '主要コンポーネントの全バリアントをカバー。変更時は意図的なアップデートを確認。',
            tools: ['Jest Snapshot', 'Vitest'],
        },
        en: {
            name: 'Snapshot Tests',
            description: 'Compares component render output against a previous snapshot.',
            purpose: 'Detects unintended UI changes and requires explicit review of all updates.',
            targetValue: 'Cover all variants of key components. Verify intentional updates on change.',
            tools: ['Jest Snapshot', 'Vitest'],
        },
    },
    i18n: {
        ja: {
            name: '国際化テスト',
            description: '多言語対応の翻訳漏れ、レイアウト崩れ、ロケール固有の問題を検出します。',
            purpose: '全サポート言語でのUI品質を保証します。',
            targetValue: '翻訳率 100%。レイアウト崩れ 0件。RTL対応（該当する場合）。',
            tools: ['i18next', 'react-intl', 'カスタムリンター'],
        },
        en: {
            name: 'i18n Tests',
            description: 'Detects missing translations, layout issues, and locale-specific problems.',
            purpose: 'Ensures UI quality across all supported languages.',
            targetValue: 'Translation rate: 100%. Zero layout breaks. RTL support (if applicable).',
            tools: ['i18next', 'react-intl', 'Custom Linter'],
        },
    },
};

export function getTestTypeInfo(type: TestType, lang: Language): TestTypeInfo {
    return data[type][lang];
}
