import { useState, useEffect } from 'react';
import { Activity, Sun, Moon, Globe } from 'lucide-react';
import { useBrainData } from './hooks/useBrainData';
import { TestTypeNav } from './components/TestTypeNav';
import { MetricsBar } from './components/MetricsBar';
import { UnitView } from './components/types/UnitView';
import { IntegrationView } from './components/types/IntegrationView';
import { E2EView } from './components/types/E2EView';
import { ApiView } from './components/types/ApiView';
import { VisualView } from './components/types/VisualView';
import { AccessibilityView } from './components/types/AccessibilityView';
import { PerformanceView } from './components/types/PerformanceView';
import { SecurityView } from './components/types/SecurityView';
import { ContractView } from './components/types/ContractView';
import { MutationView } from './components/types/MutationView';
import { SmokeView } from './components/types/SmokeView';
import { LoadView } from './components/types/LoadView';
import { SnapshotView } from './components/types/SnapshotView';
import { I18nView } from './components/types/I18nView';
import { HistoryView, getFreshness, freshnessColor, formatRelativeTime } from './components/HistoryView';
import { useLanguage } from './i18n/i18n';
import type { TestType, TestTypeData } from './types/brain';

type ViewType = TestType | 'overview' | 'history';

// --- Theme hook ---
function useTheme() {
    const [dark, setDark] = useState(() => {
        const stored = localStorage.getItem('theme');
        return stored ? stored === 'dark' : true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.remove('light');
        } else {
            root.classList.add('light');
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }, [dark]);

    return { dark, toggle: () => setDark(d => !d) };
}

// --- Relative timestamp ---
function useRelativeTime(isoString: string | undefined): string {
    const { t } = useLanguage();
    if (!isoString) return '';

    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('header.justNow');
    if (minutes < 60) return t('header.minutesAgo', { n: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('header.hoursAgo', { n: hours });
    const days = Math.floor(hours / 24);
    return t('header.daysAgo', { n: days });
}

// =====================
// App
// =====================
export default function App() {
    const { state, loading, error, fetchTypeData } = useBrainData();
    const [activeType, setActiveType] = useState<ViewType>('overview');
    const { dark, toggle: toggleTheme } = useTheme();
    const { lang, setLang, t } = useLanguage();
    const relativeTime = useRelativeTime(state?.progress.last_updated);

    useEffect(() => {
        if (activeType !== 'overview' && activeType !== 'history' && state) {
            fetchTypeData(activeType as TestType);
        }
    }, [activeType, state]);

    if (loading && !state) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
                <div style={{ color: 'var(--fg-muted)' }} className="text-sm">{t('common.loading')}</div>
            </div>
        );
    }

    if (error && !state) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
                <div className="text-sm" style={{ color: 'var(--badge-fail-text)' }}>{t('common.error')}: {error}</div>
            </div>
        );
    }

    if (!state) return null;

    const { progress } = state;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
            {/* ヘッダー */}
            <header
                className="sticky top-0 z-10 backdrop-blur-sm"
                style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: dark ? 'rgba(13,17,23,0.8)' : 'rgba(255,255,255,0.85)',
                }}
            >
                <div className="max-w-screen-xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Activity className="w-5 h-5 text-primary flex-shrink-0" />
                        <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--fg)' }}>{t('header.title')}</h1>
                        <span
                            className="text-xs px-2 py-0.5 rounded font-mono hidden sm:inline"
                            style={{ color: 'var(--fg-secondary)', border: '1px solid var(--border)' }}
                        >
                            {progress.overall.total_tests} {t('header.tests')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs flex-shrink-0" style={{ color: 'var(--fg-secondary)' }}>
                        <span className="hidden md:inline">
                            {t('header.coverage')}: <span className="font-mono font-semibold" style={{ color: 'var(--fg)' }}>{progress.overall.creation_rate.toFixed(1)}%</span>
                        </span>
                        <span className="hidden md:inline">
                            {t('header.passRate')}: <span className="font-mono font-semibold" style={{ color: 'var(--badge-pass-text)' }}>{progress.overall.pass_rate.toFixed(1)}%</span>
                        </span>
                        {/* Timestamp */}
                        {relativeTime && (
                            <span
                                className="font-mono hidden lg:inline"
                                title={progress.last_updated}
                                style={{ color: 'var(--fg-muted)' }}
                            >
                                {t('header.updated')}: {relativeTime}
                            </span>
                        )}
                        {/* Language toggle */}
                        <button
                            onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
                            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                            style={{
                                color: 'var(--fg-secondary)',
                                border: '1px solid var(--border)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Switch language"
                        >
                            <Globe className="w-3 h-3" />
                            <span className="font-mono text-xs">{lang === 'ja' ? 'EN' : 'JP'}</span>
                        </button>
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-1 rounded-md transition-colors"
                            style={{
                                color: 'var(--fg-secondary)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '26px',
                                height: '26px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ナビゲーション */}
            <div className="max-w-screen-xl mx-auto px-3 sm:px-6 pt-4">
                <TestTypeNav
                    activeType={activeType}
                    onTypeChange={setActiveType}
                    progress={progress.by_test_type}
                />
            </div>

            {/* コンテンツ */}
            <main className="max-w-screen-xl mx-auto px-3 sm:px-6 pb-12">
                {activeType === 'overview' ? (
                    <OverviewDashboard progress={progress} history={state.history} />
                ) : activeType === 'history' ? (
                    state.history ? (
                        <HistoryView history={state.history} />
                    ) : (
                        <div className="text-sm py-8 text-center" style={{ color: 'var(--fg-muted)' }}>{t('common.loading')}</div>
                    )
                ) : (
                    <TypeDetailView
                        type={activeType as TestType}
                        progress={progress.by_test_type[activeType as TestType]}
                        data={state.typeData[activeType as TestType] ?? null}
                        history={state.history}
                    />
                )}
            </main>
        </div>
    );
}

// --- 全体像ダッシュボード ---

function OverviewDashboard({ progress, history }: { progress: import('./types/brain').Progress; history: import('./types/brain').ExecutionHistory | null }) {
    const types = Object.entries(progress.by_test_type) as [TestType, import('./types/brain').TestTypeProgress][];
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            {/* 全体サマリ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard label={t('overview.totalTests')} value={progress.overall.total_tests} />
                <SummaryCard label={t('overview.creationRate')} value={`${progress.overall.creation_rate.toFixed(1)}%`} sub={`${progress.overall.created}/${progress.overall.total_tests}`} />
                <SummaryCard label={t('overview.executionRate')} value={`${progress.overall.execution_rate.toFixed(1)}%`} sub={`${progress.overall.executed}/${progress.overall.created}`} />
                <SummaryCard label={t('overview.passRate')} value={`${progress.overall.pass_rate.toFixed(1)}%`} sub={`${progress.overall.passed}/${progress.overall.executed}`}
                    valueColor="var(--badge-pass-text)" />
            </div>

            {/* テスト種別一覧 */}
            <div
                className="rounded-lg overflow-x-auto overflow-y-hidden"
                style={{ border: '1px solid var(--border)' }}
            >
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                            <th className="text-left px-5 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.testType')}</th>
                            <th className="text-right px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.total')}</th>
                            <th className="text-right px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.creationRate')}</th>
                            <th className="text-right px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.executionRate')}</th>
                            <th className="text-right px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.passRate')}</th>
                            <th className="text-right px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.failures')}</th>
                            <th className="text-left px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)', minWidth: '160px' }}>{t('overview.progress')}</th>
                            <th className="text-right px-3 py-3 font-medium" style={{ color: 'var(--fg-secondary)' }}>{t('overview.lastRun')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types.map(([type, tp]) => (
                            <tr
                                key={type}
                                className="transition-colors"
                                style={{ borderBottom: '1px solid var(--border-subtle)' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                            >
                                <td className="px-5 py-3 font-medium" style={{ color: 'var(--fg)' }}>{t(`test.${type}`)}</td>
                                <td className="text-right px-3 py-3 font-mono" style={{ color: 'var(--fg-secondary)' }}>{tp.total}</td>
                                <td className="text-right px-3 py-3 font-mono" style={{ color: rateColor(tp.creation_rate) }}>{tp.creation_rate.toFixed(1)}%</td>
                                <td className="text-right px-3 py-3 font-mono" style={{ color: rateColor(tp.execution_rate) }}>{tp.execution_rate.toFixed(1)}%</td>
                                <td className="text-right px-3 py-3 font-mono" style={{ color: rateColor(tp.pass_rate) }}>{tp.pass_rate.toFixed(1)}%</td>
                                <td className="text-right px-3 py-3 font-mono" style={{ color: tp.failed > 0 ? 'var(--badge-fail-text)' : 'var(--fg-muted)' }}>{tp.failed}</td>
                                <td className="px-3 py-3" style={{ minWidth: '160px' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bar-track)', minWidth: '80px' }}>
                                            <div className="h-full rounded-full" style={{ width: `${tp.creation_rate}%`, backgroundColor: 'var(--bar-executed)' }} />
                                        </div>
                                        <span className="text-xs font-mono w-14 text-right whitespace-nowrap" style={{ color: 'var(--fg-muted)' }}>{tp.created}/{tp.total}</span>
                                    </div>
                                </td>
                                <td className="text-right px-3 py-3">
                                    {(() => {
                                        const typeSummary = history?.by_type[type];
                                        if (!typeSummary) return <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>—</span>;
                                        const freshness = getFreshness(typeSummary.last_run);
                                        return (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: freshnessColor(freshness) }} />
                                                <span className="text-xs font-mono whitespace-nowrap" style={{ color: freshnessColor(freshness) }}>
                                                    {formatRelativeTime(typeSummary.last_run, t)}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, sub, valueColor }: {
    label: string;
    value: string | number;
    sub?: string;
    valueColor?: string;
}) {
    return (
        <div
            className="px-5 py-4 rounded-lg"
            style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{label}</div>
            <div className="text-3xl font-mono font-bold" style={{ color: valueColor || 'var(--fg)' }}>{value}</div>
            {sub && <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--fg-muted)' }}>{sub}</div>}
        </div>
    );
}

function rateColor(value: number): string {
    return value >= 80 ? 'var(--badge-pass-text)' : value >= 50 ? 'var(--badge-warn-text)' : 'var(--badge-fail-text)';
}

// --- テスト種別詳細 ---

function TypeDetailView({ type, progress, data, history }: {
    type: TestType;
    progress: import('./types/brain').TestTypeProgress;
    data: TestTypeData | null;
    history: import('./types/brain').ExecutionHistory | null;
}) {
    const { t } = useLanguage();
    const typeSummary = history?.by_type[type];

    return (
        <div>
            {/* Last execution info */}
            {typeSummary && (() => {
                const freshness = getFreshness(typeSummary.last_run);
                return (
                    <div
                        className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-xs"
                        style={{
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: freshnessColor(freshness) }} />
                        <span style={{ color: 'var(--fg-secondary)' }}>{t('metrics.lastRun')}:</span>
                        <span className="font-mono" style={{ color: freshnessColor(freshness) }}>
                            {formatRelativeTime(typeSummary.last_run, t)}
                        </span>
                        <span style={{ color: 'var(--fg-muted)' }}>·</span>
                        <span className="font-mono" style={{ color: 'var(--fg-muted)' }}>
                            {typeSummary.run_count_7d}{t('history.runsIn7d')}
                        </span>
                    </div>
                );
            })()}

            <MetricsBar progress={progress} label={t(`test.${type}`)} testType={type} />

            {!data ? (
                <div className="text-sm py-8 text-center" style={{ color: 'var(--fg-muted)' }}>{t('detail.loading')}</div>
            ) : (
                <TypeContent type={type} data={data} />
            )}
        </div>
    );
}

function TypeContent({ type, data }: { type: TestType; data: TestTypeData }) {
    switch (type) {
        case 'unit': return <UnitView data={data as import('./types/brain').UnitData} />;
        case 'integration': return <IntegrationView data={data as import('./types/brain').IntegrationData} />;
        case 'e2e': return <E2EView data={data as import('./types/brain').E2EData} />;
        case 'api': return <ApiView data={data as import('./types/brain').ApiData} />;
        case 'visual': return <VisualView data={data as import('./types/brain').VisualData} />;
        case 'accessibility': return <AccessibilityView data={data as import('./types/brain').AccessibilityData} />;
        case 'performance': return <PerformanceView data={data as import('./types/brain').PerformanceData} />;
        case 'security': return <SecurityView data={data as import('./types/brain').SecurityData} />;
        case 'contract': return <ContractView data={data as import('./types/brain').ContractData} />;
        case 'mutation': return <MutationView data={data as import('./types/brain').MutationData} />;
        case 'smoke': return <SmokeView data={data as import('./types/brain').SmokeData} />;
        case 'load': return <LoadView data={data as import('./types/brain').LoadData} />;
        case 'snapshot': return <SnapshotView data={data as import('./types/brain').SnapshotData} />;
        case 'i18n': return <I18nView data={data as import('./types/brain').I18nData} />;
        default: return <div style={{ color: 'var(--fg-muted)' }}>Unknown</div>;
    }
}
