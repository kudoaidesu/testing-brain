// TypeScript型定義 - testing-brain のJSONスキーマに対応

export type TestType = 'unit' | 'integration' | 'e2e' | 'api' | 'visual' | 'accessibility' | 'performance' | 'security' | 'contract' | 'mutation' | 'smoke' | 'load' | 'snapshot' | 'i18n';

export type TestStatus = 'passed' | 'failed' | 'untested' | 'partial' | 'skipped';

// --- 共通進捗 ---

export interface TestTypeProgress {
    label: string;
    total: number;
    created: number;
    executed: number;
    passed: number;
    failed: number;
    creation_rate: number;
    execution_rate: number;
    pass_rate: number;
}

export interface Progress {
    last_updated: string;
    overall: {
        total_tests: number;
        created: number;
        executed: number;
        passed: number;
        failed: number;
        creation_rate: number;
        execution_rate: number;
        pass_rate: number;
    };
    by_test_type: Record<TestType, TestTypeProgress>;
}

// --- Unit ---

export interface UnitTestResult {
    name: string;
    viewpoint?: string;
    expected?: string;
    status: TestStatus;
    duration_ms: number;
    error?: string;
}

export interface UnitFile {
    path: string;
    test_file: string | null;
    functions_total: number;
    functions_tested: number;
    line_coverage: number;
    branch_coverage: number;
    status: 'covered' | 'partial' | 'uncovered';
    tests: UnitTestResult[];
}

export interface UnitData {
    test_type: 'unit';
    last_updated: string;
    coverage: { line: number; branch: number; function: number; statement: number };
    files: UnitFile[];
}

// --- Integration ---

export interface IntegrationModule {
    name: string;
    source_a: string;
    source_b: string;
    test_file: string | null;
    status: TestStatus;
    tests: { name: string; viewpoint?: string; expected?: string; status: TestStatus; duration_ms?: number; error?: string }[];
}

export interface IntegrationData {
    test_type: 'integration';
    last_updated: string;
    modules: IntegrationModule[];
}

// --- E2E ---

export interface E2EStep {
    order: number;
    action: string;
    status: TestStatus;
    error?: string;
}

export interface E2EScenario {
    id: string;
    name: string;
    viewpoint?: string;
    expected?: string;
    test_file: string | null;
    status: TestStatus;
    duration_ms: number | null;
    steps: E2EStep[];
}

export interface E2EData {
    test_type: 'e2e';
    last_updated: string;
    tool: string;
    scenarios: E2EScenario[];
}

// --- API ---

export interface ApiResponseTest {
    status: TestStatus;
    description: string;
    error?: string;
}

export interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
    test_file: string | null;
    response_tests: Record<string, ApiResponseTest>;
}

export interface ApiData {
    test_type: 'api';
    last_updated: string;
    base_url: string;
    endpoints: ApiEndpoint[];
}

// --- Visual ---

export interface VisualVariant {
    name: string;
    snapshot: boolean;
    status: TestStatus | 'changed' | 'no_snapshot';
    last_checked?: string;
    diff_percent?: number;
}

export interface VisualComponent {
    name: string;
    path: string;
    story_file: string | null;
    variants: VisualVariant[];
}

export interface VisualData {
    test_type: 'visual';
    last_updated: string;
    tool: string;
    components: VisualComponent[];
}

// --- Accessibility ---

export interface A11yViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    element: string;
    status: 'open' | 'fixed';
}

export interface A11yPage {
    name: string;
    path: string;
    score: number | null;
    test_file: string | null;
    status: TestStatus | 'failing' | 'passing';
    violations: A11yViolation[];
}

export interface AccessibilityData {
    test_type: 'accessibility';
    last_updated: string;
    tool: string;
    standard: string;
    pages: A11yPage[];
}

// --- Performance ---

export interface CoreWebVital {
    value_ms?: number;
    value?: number;
    rating: 'good' | 'needs_improvement' | 'poor';
    threshold_good: number;
    threshold_poor: number;
}

export interface BundleChunk {
    name: string;
    size_kb: number;
    gzip_kb: number;
}

export interface ApiResponseTime {
    endpoint: string;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    status: 'good' | 'needs_improvement' | 'poor';
}

export interface PerformanceData {
    test_type: 'performance';
    last_updated: string;
    tool: string;
    lighthouse: { performance_score: number; accessibility_score: number; best_practices_score: number; seo_score: number };
    core_web_vitals: Record<string, CoreWebVital>;
    bundle: { total_size_kb: number; chunks: BundleChunk[] };
    api_response_times: ApiResponseTime[];
}

// --- Security ---

export interface SecurityVulnerability {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    source: string;
    package: string | null;
    fix: string;
    status: 'open' | 'fixed';
}

export interface OwaspItem {
    id: string;
    name: string;
    status: TestStatus;
    tests: number;
    passed: number;
}

export interface SecurityData {
    test_type: 'security';
    last_updated: string;
    tools: string[];
    summary: { critical: number; high: number; medium: number; low: number; total: number; fixed: number; fix_rate: number };
    owasp_top10: OwaspItem[];
    vulnerabilities: SecurityVulnerability[];
    dependency_audit: { total_packages: number; vulnerable_packages: number; outdated_packages: number };
}

// --- Contract ---

export interface ContractInteraction {
    name: string;
    viewpoint?: string;
    expected?: string;
    status: TestStatus;
    error?: string;
}

export interface ContractPair {
    consumer: string;
    provider: string;
    test_file: string | null;
    status: TestStatus;
    interactions: ContractInteraction[];
}

export interface ContractData {
    test_type: 'contract';
    last_updated: string;
    tool: string;
    contracts: ContractPair[];
}

// --- Mutation ---

export interface MutantSurvivor {
    name: string;
    viewpoint?: string;
    expected?: string;
    line: number;
    mutator: string;
    status: 'survived' | 'killed' | 'timeout';
}

export interface MutationFile {
    path: string;
    mutants_total: number;
    mutants_killed: number;
    mutants_survived: number;
    score: number;
    survivors: MutantSurvivor[];
}

export interface MutationData {
    test_type: 'mutation';
    last_updated: string;
    tool: string;
    overall_score: number;
    files: MutationFile[];
}

// --- Smoke ---

export interface SmokeCheck {
    name: string;
    viewpoint?: string;
    expected?: string;
    url: string;
    status: TestStatus;
    response_ms?: number;
    error?: string;
}

export interface SmokeData {
    test_type: 'smoke';
    last_updated: string;
    environment: string;
    checks: SmokeCheck[];
}

// --- Load ---

export interface LoadResults {
    rps: number;
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    error_rate: number;
}

export interface LoadScenario {
    name: string;
    viewpoint?: string;
    expected?: string;
    vus: number;
    duration_sec: number;
    results: LoadResults;
    status: TestStatus;
}

export interface LoadData {
    test_type: 'load';
    last_updated: string;
    tool: string;
    scenarios: LoadScenario[];
}

// --- Snapshot ---

export interface SnapshotVariant {
    name: string;
    viewpoint?: string;
    expected?: string;
    status: TestStatus | 'changed';
    diff_lines?: number;
}

export interface SnapshotFile {
    component: string;
    path: string;
    snapshot_file: string | null;
    variants: SnapshotVariant[];
}

export interface SnapshotData {
    test_type: 'snapshot';
    last_updated: string;
    tool: string;
    files: SnapshotFile[];
}

// --- I18n ---

export interface I18nPageIssue {
    type: string;
    description: string;
    element?: string;
}

export interface I18nPage {
    name: string;
    viewpoint?: string;
    expected?: string;
    status: TestStatus;
    issues: I18nPageIssue[];
}

export interface I18nLocale {
    code: string;
    name: string;
    total_keys: number;
    translated: number;
    missing: number;
    pages: I18nPage[];
}

export interface I18nData {
    test_type: 'i18n';
    last_updated: string;
    locales: I18nLocale[];
}

// --- Execution History ---

export interface ExecutionRun {
    id: string;
    timestamp: string;
    trigger: 'ci' | 'manual' | 'scheduled';
    types_run: TestType[];
    duration_sec: number;
    summary: {
        total: number;
        passed: number;
        failed: number;
    };
}

export interface TypeExecutionSummary {
    last_run: string;
    last_result: 'passed' | 'failed' | 'partial';
    run_count_7d: number;
    last_pass_rate: number;
    trend: 'improving' | 'stable' | 'declining';
}

export interface ExecutionHistory {
    runs: ExecutionRun[];
    by_type: Record<TestType, TypeExecutionSummary>;
}

// --- Config ---

export interface BrainConfig {
    version: string;
    project: {
        name: string;
        description: string;
        root_path: string;
        exclude_paths: string[];
    };
    settings: {
        auto_refresh_interval_ms: number;
        default_template: string;
    };
    enabled_types?: TestType[];
}

// --- BrainState (全体) ---

export type TestTypeData = UnitData | IntegrationData | E2EData | ApiData | VisualData | AccessibilityData | PerformanceData | SecurityData | ContractData | MutationData | SmokeData | LoadData | SnapshotData | I18nData;

export interface BrainState {
    progress: Progress;
    typeData: Partial<Record<TestType, TestTypeData>>;
    history: ExecutionHistory | null;
    config: BrainConfig | null;
}

