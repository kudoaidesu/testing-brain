import type { LoadData } from '../../types/brain';
import { cardStyle, rateColor, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface LoadViewProps { data: LoadData; }

export function LoadView({ data }: LoadViewProps) {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <div className="text-xs px-1" style={{ color: 'var(--fg-muted)' }}>
                {t('contract.tool')}: <span style={{ color: 'var(--fg-secondary)' }}>{data.tool}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.scenarios.map(s => (
                    <div key={s.name} className="rounded-lg p-4" style={cardStyle}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-medium" style={{ color: 'var(--fg)' }}>{s.name}</div>
                            <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(s.status as string)}>
                                {s.status === 'passed' ? t('status.passed') : s.status === 'failed' ? t('status.failed') : s.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                            <MetricItem label={t('load.vus')} value={s.vus.toString()} />
                            <MetricItem label={t('load.rps')} value={s.results.rps.toString()} />
                            <MetricItem label={t('load.p95')} value={`${s.results.p95_ms}ms`} />
                            <MetricItem label={t('load.p99')} value={`${s.results.p99_ms}ms`} />
                            <MetricItem label={t('load.errorRate')} value={`${s.results.error_rate}%`} color={rateColor(100 - s.results.error_rate)} />
                            <MetricItem label={t('load.duration')} value={`${s.duration_sec}s`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function MetricItem({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div>
            <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</div>
            <div className="font-mono text-sm" style={{ color: color ?? 'var(--fg)' }}>{value}</div>
        </div>
    );
}
