import type { ExecutionHistory, TestType, TypeExecutionSummary } from '../types/brain';
import { useLanguage } from '../i18n/i18n';
import { Clock, Timer, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, RefreshCw, CalendarClock, Play } from 'lucide-react';

interface HistoryViewProps {
    history: ExecutionHistory;
}

// --- Freshness logic ---
function getFreshness(isoString: string | null): 'fresh' | 'stale' | 'old' | 'never' {
    if (!isoString) return 'never';
    const diff = Date.now() - new Date(isoString).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 24) return 'fresh';
    if (hours < 72) return 'stale';
    return 'old';
}

function freshnessColor(f: 'fresh' | 'stale' | 'old' | 'never') {
    switch (f) {
        case 'fresh': return 'var(--badge-pass-text)';
        case 'stale': return 'var(--badge-warn-text)';
        case 'old': return 'var(--badge-fail-text)';
        case 'never': return 'var(--fg-muted)';
    }
}

function freshnessBg(f: 'fresh' | 'stale' | 'old' | 'never') {
    switch (f) {
        case 'fresh': return 'var(--badge-pass-bg)';
        case 'stale': return 'var(--badge-warn-bg)';
        case 'old': return 'var(--badge-fail-bg)';
        case 'never': return 'var(--bg-subtle)';
    }
}

function freshnessBorder(f: 'fresh' | 'stale' | 'old' | 'never') {
    switch (f) {
        case 'fresh': return 'var(--badge-pass-border)';
        case 'stale': return 'var(--badge-warn-border)';
        case 'old': return 'var(--badge-fail-border)';
        case 'never': return 'var(--border-subtle)';
    }
}

function formatDuration(sec: number): string {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m < 60) return s > 0 ? `${m}m${s}s` : `${m}m`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `${h}h${rm}m` : `${h}h`;
}

function formatRelativeTime(isoString: string | null, t: (key: string, params?: Record<string, string | number>) => string): string {
    if (!isoString) return t('history.never');
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('header.justNow');
    if (minutes < 60) return t('header.minutesAgo', { n: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('header.hoursAgo', { n: hours });
    const days = Math.floor(hours / 24);
    return t('header.daysAgo', { n: days });
}

export function HistoryView({ history }: HistoryViewProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 mt-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color: 'var(--fg-secondary)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>{t('history.title')}</h2>
            </div>

            {/* Freshness Summary Grid */}
            <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg-secondary)' }}>{t('history.byType')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {(Object.entries(history.by_type) as [TestType, TypeExecutionSummary][]).map(([type, summary]) => (
                        <FreshnessCard key={type} type={type} summary={summary} />
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg-secondary)' }}>{t('history.timeline')}</h3>
                <div className="space-y-3">
                    {history.runs.map(run => (
                        <RunCard key={run.id} run={run} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Freshness Card ---
function FreshnessCard({ type, summary }: { type: TestType; summary: TypeExecutionSummary }) {
    const { t } = useLanguage();
    const freshness = getFreshness(summary.last_run);

    const TrendIcon = summary.trend === 'improving' ? TrendingUp
        : summary.trend === 'declining' ? TrendingDown
            : Minus;
    const trendColor = summary.trend === 'improving' ? 'var(--badge-pass-text)'
        : summary.trend === 'declining' ? 'var(--badge-fail-text)'
            : 'var(--fg-muted)';

    return (
        <div
            className="px-4 py-3 rounded-lg"
            style={{
                backgroundColor: 'var(--bg-subtle)',
                border: `1px solid ${freshnessBorder(freshness)}`,
            }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{t(`test.${type}`)}</span>
                <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: freshnessColor(freshness) }}
                    title={t(`history.freshness.${freshness}`)}
                />
            </div>
            <div className="text-xs font-mono mb-2" style={{ color: freshnessColor(freshness) }}>
                {formatRelativeTime(summary.last_run, t)}
            </div>
            <div className="flex items-center justify-end">
                <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
            </div>
            <div className="mt-1">
                <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{
                        backgroundColor: freshnessBg(freshness),
                        color: freshnessColor(freshness),
                    }}
                >
                    {summary.last_pass_rate.toFixed(1)}%
                </span>
            </div>
        </div>
    );
}

// --- Run Card ---
function RunCard({ run }: { run: import('../types/brain').ExecutionRun }) {
    const { t } = useLanguage();
    const passRate = run.summary.total > 0 ? (run.summary.passed / run.summary.total * 100) : 0;
    const hasFails = run.summary.failed > 0;

    const TriggerIcon = run.trigger === 'ci' ? RefreshCw : run.trigger === 'scheduled' ? CalendarClock : Play;
    const triggerLabel = t(`history.trigger.${run.trigger}`);

    const dateStr = new Date(run.timestamp).toLocaleDateString('ja-JP', {
        month: 'numeric', day: 'numeric', weekday: 'short',
    });
    const timeStr = new Date(run.timestamp).toLocaleTimeString('ja-JP', {
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <div
            className="px-4 py-3 rounded-lg"
            style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            {/* Top row: date + trigger */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium" style={{ color: 'var(--fg)' }}>
                        {dateStr} {timeStr}
                    </span>
                    <span
                        className="text-xs px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap"
                        style={{
                            color: 'var(--fg-secondary)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        <TriggerIcon className="w-3 h-3" />
                        <span>{triggerLabel}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3" style={{ color: 'var(--fg-muted)' }} />
                    <span className="text-xs font-mono" style={{ color: 'var(--fg-muted)' }}>
                        {formatDuration(run.duration_sec)}
                    </span>
                </div>
            </div>

            {/* Result summary */}
            <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--badge-pass-text)' }} />
                    <span className="text-sm font-mono" style={{ color: 'var(--badge-pass-text)' }}>
                        {run.summary.passed}
                    </span>
                </div>
                {hasFails && (
                    <div className="flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" style={{ color: 'var(--badge-fail-text)' }} />
                        <span className="text-sm font-mono" style={{ color: 'var(--badge-fail-text)' }}>
                            {run.summary.failed}
                        </span>
                    </div>
                )}
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                    ({run.summary.total} {t('history.testsTotal')})
                </span>
                {/* Pass rate bar */}
                <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bar-track)', maxWidth: '120px' }}>
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${passRate}%`,
                                backgroundColor: hasFails ? 'var(--badge-warn-text)' : 'var(--badge-pass-text)',
                            }}
                        />
                    </div>
                    <span className="text-xs font-mono" style={{ color: 'var(--fg-muted)' }}>
                        {passRate.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* Test types run */}
            <div className="flex flex-wrap gap-1.5">
                {run.types_run.map(type => (
                    <span
                        key={type}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                            backgroundColor: 'var(--surface-active)',
                            color: 'var(--fg-secondary)',
                        }}
                    >
                        {t(`test.${type}`)}
                    </span>
                ))}
            </div>
        </div>
    );
}

// Export freshness utilities for use in other components
export { getFreshness, freshnessColor, formatRelativeTime };
