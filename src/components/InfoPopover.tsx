import { useState, useRef, useEffect } from 'react';
import { Info, X, Target, Lightbulb } from 'lucide-react';
import type { TestTypeInfo } from '../data/testTypeInfo';
import { useLanguage } from '../i18n/i18n';

interface InfoPopoverProps {
    info: TestTypeInfo;
}

export function InfoPopover({ info }: InfoPopoverProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative inline-flex" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full transition-colors"
                style={{
                    color: open ? 'var(--primary)' : 'var(--fg-muted)',
                    backgroundColor: open ? 'var(--primary-subtle)' : 'transparent',
                }}
                onMouseEnter={e => { if (!open) e.currentTarget.style.color = 'var(--fg-secondary)'; }}
                onMouseLeave={e => { if (!open) e.currentTarget.style.color = open ? 'var(--primary)' : 'var(--fg-muted)'; }}
                title={t('info.showInfo')}
                aria-label={`${info.name}`}
            >
                <Info className="w-3.5 h-3.5" />
            </button>

            {open && (
                <div
                    className="absolute left-0 top-full mt-2 z-50 w-80 rounded-lg shadow-lg text-xs"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 8px 24px var(--shadow)',
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-3 py-2 rounded-t-lg"
                        style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}
                    >
                        <span className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>{info.name}</span>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-0.5 rounded transition-colors"
                            style={{ color: 'var(--fg-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-3 py-2.5 space-y-2.5">
                        <p style={{ color: 'var(--fg-secondary)', lineHeight: '1.5' }}>{info.description}</p>

                        <div>
                            <div className="font-medium mb-0.5" style={{ color: 'var(--fg-muted)' }}>{t('info.purpose')}</div>
                            <p style={{ color: 'var(--fg-secondary)', lineHeight: '1.5' }}>{info.purpose}</p>
                        </div>

                        <div
                            className="px-2.5 py-2 rounded-md"
                            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}
                        >
                            <div className="flex items-center gap-1 font-medium mb-0.5" style={{ color: 'var(--primary)' }}><Target className="w-3 h-3" /> {t('info.target')}</div>
                            <p style={{ color: 'var(--fg)', lineHeight: '1.5' }}>{info.targetValue}</p>
                        </div>

                        {info.tips && (
                            <div className="px-2.5 py-2 rounded-md" style={{ backgroundColor: 'var(--badge-warn-bg)', border: '1px solid var(--badge-warn-border)' }}>
                                <p className="flex items-start gap-1" style={{ color: 'var(--badge-warn-text)', lineHeight: '1.5' }}><Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" /> {info.tips}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1 pt-0.5">
                            {info.tools.map(tool => (
                                <span
                                    key={tool}
                                    className="px-1.5 py-0.5 rounded font-mono"
                                    style={{
                                        fontSize: '10px',
                                        backgroundColor: 'var(--bg-subtle)',
                                        color: 'var(--fg-muted)',
                                        border: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
