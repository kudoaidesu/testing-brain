import type { ApiData } from '../../types/brain';
import { tableStyles, statusBadgeStyle } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface ApiViewProps { data: ApiData; }

const methodStyles: Record<string, { bg: string; color: string }> = {
    GET: { bg: 'var(--badge-pass-bg)', color: 'var(--badge-pass-text)' },
    POST: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' },
    PUT: { bg: 'var(--badge-warn-bg)', color: 'var(--badge-warn-text)' },
    PATCH: { bg: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' },
    DELETE: { bg: 'var(--badge-fail-bg)', color: 'var(--badge-fail-text)' },
};

export function ApiView({ data }: ApiViewProps) {
    const { t } = useLanguage();
    return (
        <div style={tableStyles.wrapper}>
            <table className="w-full min-w-max text-sm">
                <thead>
                    <tr style={tableStyles.thead}>
                        <th className="text-left px-4 py-2.5 font-medium w-20" style={tableStyles.th}>{t('api.method')}</th>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('api.endpoint')}</th>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('api.responseCodes')}</th>
                        <th className="text-left px-4 py-2.5 font-medium w-40" style={tableStyles.th}>{t('common.testFile')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.endpoints.map(ep => {
                        const ms = methodStyles[ep.method] ?? { bg: 'var(--surface-active)', color: 'var(--fg-secondary)' };
                        return (
                            <tr key={`${ep.method}-${ep.path}`}
                                style={tableStyles.row}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                            >
                                <td className="px-4 py-2.5">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: ms.bg, color: ms.color }}>{ep.method}</span>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="font-mono" style={{ color: 'var(--fg)' }}>{ep.path}</div>
                                    <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>{ep.description}</div>
                                </td>
                                <td className="px-4 py-2.5">
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(ep.response_tests).map(([code, test]) => (
                                            <span key={code} className="text-xs font-mono px-1.5 py-0.5 rounded"
                                                style={statusBadgeStyle(test.status as string)} title={test.description}>
                                                {code}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
                                    {ep.test_file ?? <span className="italic">{t('common.notCreated')}</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
