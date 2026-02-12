import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'ja' | 'en';

// --- Translation dictionary ---
const translations: Record<Language, Record<string, string>> = {
    ja: {
        // Header
        'header.title': 'Testing Brain',
        'header.tests': 'テスト',
        'header.coverage': '網羅率',
        'header.passRate': '合格',
        'header.updated': '更新',
        'header.justNow': 'たった今',
        'header.minutesAgo': '{n}分前',
        'header.hoursAgo': '{n}時間前',
        'header.daysAgo': '{n}日前',

        // Nav
        'nav.overview': '全体像',

        // Test types
        'test.unit': '単体',
        'test.integration': '結合',
        'test.e2e': 'E2E',
        'test.api': 'API',
        'test.visual': '外観',
        'test.accessibility': 'A11y',
        'test.performance': '性能',
        'test.security': 'セキュリティ',
        'test.contract': '契約',
        'test.mutation': '変異',
        'test.smoke': 'スモーク',
        'test.load': '負荷',
        'test.snapshot': 'スナップ',
        'test.i18n': 'i18n',

        // Metrics
        'metrics.creationRate': '作成率',
        'metrics.executionRate': '消化率',
        'metrics.passRate': '合格率',
        'metrics.failed': '失敗',

        // Overview
        'overview.totalTests': 'テスト総数',
        'overview.creationRate': '作成率',
        'overview.executionRate': '消化率',
        'overview.passRate': '合格率',
        'overview.testType': 'テスト形式',
        'overview.total': '合計',
        'overview.failures': '失敗',
        'overview.progress': '進捗',

        // Info popover
        'info.purpose': '目的',
        'info.target': '目標値',
        'info.showInfo': 'テスト情報を表示',

        // Detail views
        'detail.loading': 'データ読み込み中...',
        'detail.unknownType': '不明なテスト形式',

        // Common table/view labels
        'common.loading': 'データ読み込み中...',
        'common.error': 'エラー',
        'common.status': '状態',
        'common.file': 'ファイル',
        'common.tests': 'テスト数',
        'common.testFile': 'テストファイル',
        'common.notCreated': '未作成',
        'common.viewpoint': '観点',
        'common.expected': '想定',
        'common.duration': '実行時間',
        'common.durationSec': '{n}秒',
        'common.error_message': 'エラーメッセージ',

        // Statuses
        'status.passed': '合格',
        'status.failed': '失敗',
        'status.partial': '一部',
        'status.untested': '未実施',
        'status.skipped': 'スキップ',
        'status.good': '良好',
        'status.needsImprovement': '要改善',
        'status.poor': '不良',
        'status.noIssues': '問題なし',
        'status.needsReview': '要確認',
        'status.changed': '変更あり',
        'status.matched': '一致',

        // Unit view
        'unit.line': '行',
        'unit.branch': '分岐',
        'unit.function': '関数',
        'unit.statement': '文',
        'unit.funcsTestedOf': '{tested}/{total}',

        // Integration view
        'integration.pattern': '結合パターン',

        // E2E view
        'e2e.scenario': 'シナリオ',
        'e2e.steps': 'ステップ',

        // API view
        'api.method': 'メソッド',
        'api.endpoint': 'エンドポイント',
        'api.responseCodes': 'レスポンスコード',

        // Visual view
        'visual.component': 'コンポーネント',
        'visual.storyFile': 'ストーリーファイル',
        'visual.variants': 'バリアント',
        'visual.withSnapshot': 'スナップ有',
        'visual.total': '合計',

        // Accessibility view
        'a11y.page': 'ページ',
        'a11y.violations': '違反',
        'a11y.score': 'スコア',
        'a11y.violationsByImpact': '影響度別の違反',
        'a11y.critical': 'Critical',
        'a11y.serious': 'Serious',
        'a11y.moderate': 'Moderate',
        'a11y.minor': 'Minor',
        'a11y.rule': 'ルール',
        'a11y.impact': '影響度',
        'a11y.target': '対象',
        'a11y.count': '件数',

        // Performance view
        'perf.metric': '指標',
        'perf.value': '値',
        'perf.rating': '評価',
        'perf.threshold': '閾値(良好/不良)',
        'perf.bundleSize': 'バンドルサイズ',
        'perf.chunk': 'チャンク',
        'perf.sizeKB': 'サイズ(KB)',
        'perf.ratio': '割合',
        'perf.apiResponseTime': 'API応答時間',

        // Security view
        'security.category': 'カテゴリ',
        'security.severity': '深刻度',
        'security.title': 'タイトル',
        'security.description': '説明',
        'security.tool': 'ツール',
        'security.owaspCoverage': 'OWASP Top 10 カバー率',
        'security.vulnerabilities': '脆弱性',
        'security.depVulnerabilities': '依存関係の脆弱性',
        'security.package': 'パッケージ',
        'security.currentVer': '現在',
        'security.fixedVer': '修正版',

        // Contract view
        'contract.tool': 'ツール',
        'contract.consumerProvider': 'コンシューマ → プロバイダ',
        'contract.interactions': 'やり取り',

        // Mutation view
        'mutation.overallScore': '全体スコア',
        'mutation.totalMutants': '変異体総数',
        'mutation.killed': '検出',
        'mutation.survived': '生存',
        'mutation.timeout': 'タイムアウト',
        'mutation.file': 'ファイル',
        'mutation.score': 'スコア',
        'mutation.mutants': '変異体',
        'mutation.survivors': '生存リスト',
        'mutation.mutator': '変異子',
        'mutation.lineCol': '行:列',
        'mutation.replacement': '置換',

        // Smoke view
        'smoke.url': 'URL',
        'smoke.responseTime': '応答時間',
        'smoke.environment': '環境',
        'smoke.checkItem': 'チェック項目',
        'smoke.normal': '正常',
        'smoke.abnormal': '異常',

        // Load view
        'load.scenario': 'シナリオ',
        'load.vus': '仮想ユーザー',
        'load.rps': 'RPS',
        'load.p95': 'P95レイテンシ',
        'load.p99': 'P99レイテンシ',
        'load.errorRate': 'エラー率',
        'load.duration': '実行時間',

        // Snapshot view
        'snapshot.totalSnapshots': '合計スナップショット',
        'snapshot.matched': '一致',
        'snapshot.changesDetected': '変更検出',
        'snapshot.component': 'コンポーネント',
        'snapshot.diffLines': '+{n} 行差分',

        // I18n view
        'i18n.keys': 'キー',
        'i18n.page': 'ページ',
        'i18n.issues': '問題数',
        'i18n.translationRate': '翻訳率',

        // Accessibility extra
        'a11y.standard': '規格',
        'a11y.tool': 'ツール',
        'a11y.impact.critical': '致命',
        'a11y.impact.serious': '重大',
        'a11y.impact.moderate': '中',
        'a11y.impact.minor': '軽微',

        // Security extra
        'security.severity.critical': '致命的',
        'security.severity.high': '高',
        'security.severity.medium': '中',
        'security.severity.low': '低',
        'security.severity.fixed': '修正済み',
        'security.owaspTitle': 'OWASP Top 10 カバレッジ',
        'security.status.covered': '対応済',
        'security.status.partial': '一部',
        'security.status.uncovered': '未対応',
        'security.source': 'ソース',
        'security.status.fixed': '修正',
        'security.status.unfixed': '未修正',

        // Mutation extra
        'mutation.mutationScore': 'ミューテーションスコア',
        'mutation.killedTotal': '検出/合計',
        'mutation.survivingMutants': '生存変異体',

        // History
        'nav.history': '履歴',
        'history.title': '実行履歴',
        'history.timeline': 'タイムライン',
        'history.byType': 'テスト形式別の鮮度',
        'history.trigger.ci': 'CI',
        'history.trigger.manual': '手動',
        'history.trigger.scheduled': '定期',
        'history.testsTotal': '件実行',
        'history.runsIn7d': '回/7日',
        'history.freshness.fresh': '新鮮（24h以内）',
        'history.freshness.stale': 'やや古い（3日以内）',
        'history.freshness.old': '古い（3日超）',
        'history.trend.improving': '改善中',
        'history.trend.stable': '安定',
        'history.trend.declining': '低下中',
        'overview.lastRun': '最終実行',
        'metrics.lastRun': '最終実行',
    },
    en: {
        // Header
        'header.title': 'Testing Brain',
        'header.tests': 'tests',
        'header.coverage': 'Coverage',
        'header.passRate': 'Pass',
        'header.updated': 'Updated',
        'header.justNow': 'just now',
        'header.minutesAgo': '{n}m ago',
        'header.hoursAgo': '{n}h ago',
        'header.daysAgo': '{n}d ago',

        // Nav
        'nav.overview': 'Overview',

        // Test types
        'test.unit': 'Unit',
        'test.integration': 'Integration',
        'test.e2e': 'E2E',
        'test.api': 'API',
        'test.visual': 'Visual',
        'test.accessibility': 'A11y',
        'test.performance': 'Perf',
        'test.security': 'Security',
        'test.contract': 'Contract',
        'test.mutation': 'Mutation',
        'test.smoke': 'Smoke',
        'test.load': 'Load',
        'test.snapshot': 'Snapshot',
        'test.i18n': 'i18n',

        // Metrics
        'metrics.creationRate': 'Created',
        'metrics.executionRate': 'Executed',
        'metrics.passRate': 'Passed',
        'metrics.failed': 'failed',

        // Overview
        'overview.totalTests': 'Total Tests',
        'overview.creationRate': 'Creation Rate',
        'overview.executionRate': 'Execution Rate',
        'overview.passRate': 'Pass Rate',
        'overview.testType': 'Test Type',
        'overview.total': 'Total',
        'overview.failures': 'Fails',
        'overview.progress': 'Progress',

        // Info popover
        'info.purpose': 'Purpose',
        'info.target': 'Target',
        'info.showInfo': 'Show test info',

        // Detail views
        'detail.loading': 'Loading…',
        'detail.unknownType': 'Unknown test type',

        // Common table/view labels
        'common.loading': 'Loading…',
        'common.error': 'Error',
        'common.status': 'Status',
        'common.file': 'File',
        'common.tests': 'Tests',
        'common.testFile': 'Test File',
        'common.notCreated': 'Not created',
        'common.viewpoint': 'Viewpoint',
        'common.expected': 'Expected',
        'common.duration': 'Duration',
        'common.durationSec': '{n}s',
        'common.error_message': 'Error',

        // Statuses
        'status.passed': 'Passed',
        'status.failed': 'Failed',
        'status.partial': 'Partial',
        'status.untested': 'Untested',
        'status.skipped': 'Skipped',
        'status.good': 'Good',
        'status.needsImprovement': 'Needs improvement',
        'status.poor': 'Poor',
        'status.noIssues': 'No issues',
        'status.needsReview': 'Needs review',
        'status.changed': 'Changed',
        'status.matched': 'Matched',

        // Unit view
        'unit.line': 'Line',
        'unit.branch': 'Branch',
        'unit.function': 'Function',
        'unit.statement': 'Statement',
        'unit.funcsTestedOf': '{tested}/{total}',

        // Integration view
        'integration.pattern': 'Pattern',

        // E2E view
        'e2e.scenario': 'Scenario',
        'e2e.steps': 'Steps',

        // API view
        'api.method': 'Method',
        'api.endpoint': 'Endpoint',
        'api.responseCodes': 'Response Codes',

        // Visual view
        'visual.component': 'Component',
        'visual.storyFile': 'Story File',
        'visual.variants': 'Variants',
        'visual.withSnapshot': 'w/ Snapshot',
        'visual.total': 'Total',

        // Accessibility view
        'a11y.page': 'Page',
        'a11y.violations': 'Violations',
        'a11y.score': 'Score',
        'a11y.violationsByImpact': 'Violations by Impact',
        'a11y.critical': 'Critical',
        'a11y.serious': 'Serious',
        'a11y.moderate': 'Moderate',
        'a11y.minor': 'Minor',
        'a11y.rule': 'Rule',
        'a11y.impact': 'Impact',
        'a11y.target': 'Target',
        'a11y.count': 'Count',

        // Performance view
        'perf.metric': 'Metric',
        'perf.value': 'Value',
        'perf.rating': 'Rating',
        'perf.threshold': 'Threshold (Good/Poor)',
        'perf.bundleSize': 'Bundle Size',
        'perf.chunk': 'Chunk',
        'perf.sizeKB': 'Size (KB)',
        'perf.ratio': 'Ratio',
        'perf.apiResponseTime': 'API Response Time',

        // Security view
        'security.category': 'Category',
        'security.severity': 'Severity',
        'security.title': 'Title',
        'security.description': 'Description',
        'security.tool': 'Tool',
        'security.owaspCoverage': 'OWASP Top 10 Coverage',
        'security.vulnerabilities': 'Vulnerabilities',
        'security.depVulnerabilities': 'Dependency Vulnerabilities',
        'security.package': 'Package',
        'security.currentVer': 'Current',
        'security.fixedVer': 'Fix',

        // Contract view
        'contract.tool': 'Tool',
        'contract.consumerProvider': 'Consumer → Provider',
        'contract.interactions': 'Interactions',

        // Mutation view
        'mutation.overallScore': 'Overall Score',
        'mutation.totalMutants': 'Total Mutants',
        'mutation.killed': 'Killed',
        'mutation.survived': 'Survived',
        'mutation.timeout': 'Timeout',
        'mutation.file': 'File',
        'mutation.score': 'Score',
        'mutation.mutants': 'Mutants',
        'mutation.survivors': 'Survivors',
        'mutation.mutator': 'Mutator',
        'mutation.lineCol': 'Line:Col',
        'mutation.replacement': 'Replacement',

        // Smoke view
        'smoke.url': 'URL',
        'smoke.responseTime': 'Response',
        'smoke.environment': 'Environment',
        'smoke.checkItem': 'Check',
        'smoke.normal': 'OK',
        'smoke.abnormal': 'Fail',

        // Load view
        'load.scenario': 'Scenario',
        'load.vus': 'Virtual Users',
        'load.rps': 'RPS',
        'load.p95': 'P95 Latency',
        'load.p99': 'P99 Latency',
        'load.errorRate': 'Error Rate',
        'load.duration': 'Duration',

        // Snapshot view
        'snapshot.totalSnapshots': 'Total Snapshots',
        'snapshot.matched': 'Matched',
        'snapshot.changesDetected': 'Changes Detected',
        'snapshot.component': 'Component',
        'snapshot.diffLines': '+{n} lines diff',

        // I18n view
        'i18n.keys': 'keys',
        'i18n.page': 'Page',
        'i18n.issues': 'Issues',
        'i18n.translationRate': 'Translation Rate',

        // Accessibility extra
        'a11y.standard': 'Standard',
        'a11y.tool': 'Tool',
        'a11y.impact.critical': 'Critical',
        'a11y.impact.serious': 'Serious',
        'a11y.impact.moderate': 'Moderate',
        'a11y.impact.minor': 'Minor',

        // Security extra
        'security.severity.critical': 'Critical',
        'security.severity.high': 'High',
        'security.severity.medium': 'Medium',
        'security.severity.low': 'Low',
        'security.severity.fixed': 'Fixed',
        'security.owaspTitle': 'OWASP Top 10 Coverage',
        'security.status.covered': 'Covered',
        'security.status.partial': 'Partial',
        'security.status.uncovered': 'Uncovered',
        'security.source': 'Source',
        'security.status.fixed': 'Fixed',
        'security.status.unfixed': 'Unfixed',

        // Mutation extra
        'mutation.mutationScore': 'Mutation Score',
        'mutation.killedTotal': 'Killed/Total',
        'mutation.survivingMutants': 'Surviving Mutants',

        // History
        'nav.history': 'History',
        'history.title': 'Execution History',
        'history.timeline': 'Timeline',
        'history.byType': 'Freshness by Test Type',
        'history.trigger.ci': 'CI',
        'history.trigger.manual': 'Manual',
        'history.trigger.scheduled': 'Scheduled',
        'history.testsTotal': 'total',
        'history.runsIn7d': ' runs/7d',
        'history.freshness.fresh': 'Fresh (within 24h)',
        'history.freshness.stale': 'Getting stale (within 3d)',
        'history.freshness.old': 'Stale (over 3d)',
        'history.trend.improving': 'Improving',
        'history.trend.stable': 'Stable',
        'history.trend.declining': 'Declining',
        'overview.lastRun': 'Last Run',
        'metrics.lastRun': 'Last Run',
    },
};

// --- Context ---
interface LanguageContextType {
    lang: Language;
    setLang: (l: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(() => {
        const stored = localStorage.getItem('lang');
        return (stored === 'en' || stored === 'ja') ? stored : 'ja';
    });

    const setLang = useCallback((l: Language) => {
        setLangState(l);
        localStorage.setItem('lang', l);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        let text = translations[lang][key] ?? translations['ja'][key] ?? key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
