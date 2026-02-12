import type { PerformanceData, CoreWebVital, BundleChunk, ApiResponseTime } from '../../types/brain';
import { tableStyles, cardStyle, rateColor, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface PerformanceViewProps { data: PerformanceData; }

export function PerformanceView({ data }: PerformanceViewProps) {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            {/* Lighthouse Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(data.lighthouse).map(([key, val]) => {
                    const labels: Record<string, string> = { performance_score: 'Performance', accessibility_score: 'Accessibility', best_practices_score: 'Best Practices', seo_score: 'SEO' };
                    return (
                        <div key={key} className="px-4 py-3 rounded-lg" style={cardStyle}>
                            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--fg-muted)' }}>{labels[key] ?? key}</div>
                            <div className="text-2xl font-mono font-bold" style={{ color: rateColor(val) }}>{val}</div>
                        </div>
                    );
                })}
            </div>

            {/* Core Web Vitals */}
            <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg)' }}>Core Web Vitals</h3>
                <div style={tableStyles.wrapper}>
                    <table className="w-full min-w-max text-sm">
                        <thead>
                            <tr style={tableStyles.thead}>
                                <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('perf.metric')}</th>
                                <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>{t('perf.value')}</th>
                                <th className="text-center px-3 py-2.5 font-medium" style={tableStyles.th}>{t('perf.rating')}</th>
                                <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>{t('perf.threshold')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(data.core_web_vitals).map(([metric, v]: [string, CoreWebVital]) => (
                                <tr key={metric} style={tableStyles.row}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                    <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--fg)' }}>{metric}</td>
                                    <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg)' }}>{v.value_ms ?? v.value ?? '—'}</td>
                                    <td className="text-center px-3 py-2.5">
                                        <RatingBadge rating={v.rating} />
                                    </td>
                                    <td className="text-right px-3 py-2.5 font-mono text-xs whitespace-nowrap" style={{ color: 'var(--fg-muted)' }}>{v.threshold_good} / {v.threshold_poor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bundle Size */}
            {data.bundle && (
                <div>
                    <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg)' }}>{t('perf.bundleSize')} ({data.bundle.total_size_kb}KB)</h3>
                    <div style={tableStyles.wrapper}>
                        <table className="w-full min-w-max text-sm">
                            <thead>
                                <tr style={tableStyles.thead}>
                                    <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('perf.chunk')}</th>
                                    <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>{t('perf.sizeKB')}</th>
                                    <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>Gzip(KB)</th>
                                    <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('perf.ratio')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.bundle.chunks.map((chunk: BundleChunk) => {
                                    const pct = data.bundle.total_size_kb > 0 ? ((chunk.size_kb / data.bundle.total_size_kb) * 100) : 0;
                                    return (
                                        <tr key={chunk.name} style={tableStyles.row}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                            <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--fg)' }}>{chunk.name}</td>
                                            <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{chunk.size_kb}</td>
                                            <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{chunk.gzip_kb}</td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bar-track)' }}>
                                                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--fg-muted)' }}>{pct.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* API Response Times */}
            {data.api_response_times && data.api_response_times.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--fg)' }}>{t('perf.apiResponseTime')}</h3>
                    <div style={tableStyles.wrapper}>
                        <table className="w-full min-w-max text-sm">
                            <thead>
                                <tr style={tableStyles.thead}>
                                    <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('api.endpoint')}</th>
                                    <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>p50</th>
                                    <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>p95</th>
                                    <th className="text-right px-3 py-2.5 font-medium" style={tableStyles.th}>p99</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.api_response_times.map((api: ApiResponseTime) => (
                                    <tr key={api.endpoint} style={tableStyles.row}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                        <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--fg)' }}>{api.endpoint}</td>
                                        <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{api.p50_ms}ms</td>
                                        <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{api.p95_ms}ms</td>
                                        <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>{api.p99_ms}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function RatingBadge({ rating }: { rating: string }) {
    const { t } = useLanguage();
    const labels: Record<string, string> = { good: t('status.good'), needs_improvement: t('status.needsImprovement'), poor: t('status.poor') };
    const styles: Record<string, string> = { good: 'passed', needs_improvement: 'partial', poor: 'failed' };
    return <span className="text-xs px-2 py-0.5 rounded" style={statusBadgeStyle(styles[rating] ?? 'untested')}>{labels[rating] ?? rating}</span>;
}
