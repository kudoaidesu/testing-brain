import { LayoutGrid, FlaskConical, Link2, Monitor, Globe, Eye, Accessibility, Gauge, Shield, FileText, Bug, Flame, Activity, Camera, Languages, Clock, Box, Layout } from 'lucide-react';
import type { TestType, TestTypeProgress } from '../types/brain';
import { useLanguage } from '../i18n/i18n';

type ViewType = TestType | 'overview' | 'history';

interface TestTypeNavProps {
    activeType: ViewType;
    onTypeChange: (type: ViewType) => void;
    progress: Record<TestType, TestTypeProgress>;
    enabledTypes?: TestType[];
}

const testTypeIcons: Record<TestType, typeof FlaskConical> = {
    unit: FlaskConical,
    integration: Link2,
    e2e: Monitor,
    api: Globe,
    visual: Eye,
    accessibility: Accessibility,
    performance: Gauge,
    security: Shield,
    contract: FileText,
    mutation: Bug,
    smoke: Flame,
    load: Activity,
    snapshot: Camera,
    i18n: Languages,
    component: Box,
    page: Layout,
};

const testTypeOrder: TestType[] = [
    'unit', 'integration', 'e2e', 'component', 'page', 'api', 'visual', 'accessibility',
    'performance', 'security', 'contract', 'mutation', 'smoke', 'load', 'snapshot', 'i18n',
];

export function TestTypeNav({ activeType, onTypeChange, progress, enabledTypes }: TestTypeNavProps) {
    const { t } = useLanguage();
    const visibleTypes = (enabledTypes
        ? testTypeOrder.filter(t => enabledTypes.includes(t))
        : testTypeOrder).filter(t => !!progress[t]);

    return (
        <nav className="flex items-center gap-1 overflow-x-auto pb-2 mb-4 text-sm">
            {/* Overview */}
            <NavButton
                active={activeType === 'overview'}
                onClick={() => onTypeChange('overview')}
                icon={LayoutGrid}
                label={t('nav.overview')}
            />
            <NavButton
                active={activeType === 'history'}
                onClick={() => onTypeChange('history')}
                icon={Clock}
                label={t('nav.history')}
            />

            {visibleTypes.map(type => {
                const Icon = testTypeIcons[type];
                const p = progress[type];
                return (
                    <NavButton
                        key={type}
                        active={activeType === type}
                        onClick={() => onTypeChange(type)}
                        icon={Icon}
                        label={t(`test.${type}`)}
                        badge={p ? `${p.created}/${p.total}` : undefined}
                    />
                );
            })}
        </nav>
    );
}

function NavButton({ active, onClick, icon: Icon, label, badge }: {
    active: boolean;
    onClick: () => void;
    icon: typeof FlaskConical;
    label: string;
    badge?: string;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md whitespace-nowrap transition-colors"
            style={{
                color: active ? 'var(--fg)' : 'var(--fg-secondary)',
                backgroundColor: active ? 'var(--surface-active)' : 'transparent',
                fontWeight: active ? 600 : 400,
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = active ? 'var(--surface-active)' : 'transparent'; }}
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {badge && (
                <span
                    className="text-xs font-mono px-1 py-0 rounded"
                    style={{ color: 'var(--fg-muted)', fontSize: '10px' }}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}
