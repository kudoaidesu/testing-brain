import type { TestTypeProgress, TestType } from '../types/brain';
import { InfoPopover } from './InfoPopover';
import { getTestTypeInfo } from '../data/testTypeInfo';
import { useLanguage } from '../i18n/i18n';

interface MetricsBarProps {
    progress: TestTypeProgress;
    label: string;
    testType?: TestType;
}

export function MetricsBar({ progress, label, testType }: MetricsBarProps) {
    const { lang, t } = useLanguage();
    const info = testType ? getTestTypeInfo(testType, lang) : null;

    return (
        <div
            className="flex flex-wrap items-center gap-x-6 gap-y-2 px-3 sm:px-4 py-3 mb-4 text-sm rounded-lg"
            style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
            }}
        >
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--fg)' }}>
                {label}
                {info && <InfoPopover info={info} />}
            </span>
            <MetricItem label={t('metrics.creationRate')} value={progress.creation_rate} sub={`${progress.created}/${progress.total}`} />
            <MetricItem label={t('metrics.executionRate')} value={progress.execution_rate} sub={`${progress.executed}/${progress.created}`} />
            <MetricItem label={t('metrics.passRate')} value={progress.pass_rate} sub={`${progress.passed}/${progress.executed}`} />
            {progress.failed > 0 && (
                <span
                    className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{
                        backgroundColor: 'var(--badge-fail-bg)',
                        color: 'var(--badge-fail-text)',
                        border: '1px solid var(--badge-fail-border)',
                    }}
                >
                    {progress.failed} {t('metrics.failed')}
                </span>
            )}
        </div>
    );
}

function MetricItem({ label, value, sub }: { label: string; value: number; sub: string }) {
    const color = value >= 80
        ? 'var(--badge-pass-text)'
        : value >= 50
            ? 'var(--badge-warn-text)'
            : 'var(--badge-fail-text)';

    return (
        <span style={{ color: 'var(--fg-secondary)', minWidth: '140px', display: 'inline-block' }}>
            {label}{' '}
            <span className="font-mono font-semibold" style={{ color }}>{value.toFixed(1)}%</span>
            <span className="ml-1 text-xs" style={{ color: 'var(--fg-muted)' }}>{sub}</span>
        </span>
    );
}
