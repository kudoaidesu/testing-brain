import { PageData } from '../../types/brain';
import { useLanguage } from '../../i18n/i18n';
import { StatusBadge } from '../StatusBadge';

export function PageView({ data }: { data: PageData }) {
    const { t } = useLanguage();
    return (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                        <th className="px-4 py-2 text-left" style={{ color: 'var(--fg-secondary)' }}>Route</th>
                        <th className="px-4 py-2 text-left" style={{ color: 'var(--fg-secondary)' }}>File</th>
                        <th className="px-4 py-2 text-left" style={{ color: 'var(--fg-secondary)' }}>Tests</th>
                        <th className="px-4 py-2 text-right" style={{ color: 'var(--fg-secondary)' }}>{t('common.status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.pages.map((p) => (
                        <tr key={p.route} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td className="px-4 py-2 font-medium" style={{ color: 'var(--fg)' }}>{p.route}</td>
                            <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{p.file}</td>
                            <td className="px-4 py-2 text-sm" style={{ color: 'var(--fg)' }}>
                                {p.tests.map(t => (
                                    <div key={t.name} className="flex items-center gap-2">
                                        <StatusBadge status={t.status} size="sm" />
                                        <span>{t.name}</span>
                                    </div>
                                ))}
                            </td>
                            <td className="px-4 py-2 text-right"><StatusBadge status={p.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
