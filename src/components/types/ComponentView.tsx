import { ComponentData } from '../../types/brain';
import { useLanguage } from '../../i18n/i18n';
import { StatusBadge } from '../StatusBadge';

export function ComponentView({ data }: { data: ComponentData }) {
    const { t } = useLanguage();
    return (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                        <th className="px-4 py-2 text-left" style={{ color: 'var(--fg-secondary)' }}>{t('common.name')}</th>
                        <th className="px-4 py-2 text-left" style={{ color: 'var(--fg-secondary)' }}>Path</th>
                        <th className="px-4 py-2 text-center" style={{ color: 'var(--fg-secondary)' }}>Stories</th>
                        <th className="px-4 py-2 text-center" style={{ color: 'var(--fg-secondary)' }}>Tests</th>
                        <th className="px-4 py-2 text-right" style={{ color: 'var(--fg-secondary)' }}>{t('common.status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.components.map((c) => (
                        <tr key={c.path} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td className="px-4 py-2 font-medium" style={{ color: 'var(--fg)' }}>{c.name}</td>
                            <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{c.path}</td>
                            <td className="px-4 py-2 text-center" style={{ color: 'var(--fg)' }}>{c.stories_total}</td>
                            <td className="px-4 py-2 text-center" style={{ color: 'var(--fg)' }}>{c.tests_total}</td>
                            <td className="px-4 py-2 text-right"><StatusBadge status={c.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
