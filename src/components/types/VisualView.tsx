import type { VisualData, VisualComponent } from '../../types/brain';
import { tableStyles } from '../../styles/theme';
import { useLanguage } from '../../i18n/i18n';

interface VisualViewProps { data: VisualData; }

export function VisualView({ data }: VisualViewProps) {
    const { t } = useLanguage();
    return (
        <div style={tableStyles.wrapper}>
            <table className="w-full min-w-max text-sm">
                <thead>
                    <tr style={tableStyles.thead}>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('visual.component')}</th>
                        <th className="text-left px-4 py-2.5 font-medium" style={tableStyles.th}>{t('visual.storyFile')}</th>
                        <th className="text-right px-3 py-2.5 font-medium w-24" style={tableStyles.th}>{t('visual.variants')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.components.map((comp: VisualComponent) => {
                        const tested = comp.variants.filter(v => v.snapshot).length;
                        return (
                            <tr key={comp.name} style={tableStyles.row}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                <td className="px-4 py-2.5">
                                    <div className="font-medium" style={{ color: 'var(--fg)' }}>{comp.name}</div>
                                    <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--fg-muted)' }}>{comp.path}</div>
                                </td>
                                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--fg-secondary)' }}>
                                    {comp.story_file ?? <span className="italic" style={{ color: 'var(--fg-muted)' }}>{t('common.notCreated')}</span>}
                                </td>
                                <td className="text-right px-3 py-2.5 font-mono" style={{ color: 'var(--fg-secondary)' }}>
                                    {tested}/{comp.variants.length}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
