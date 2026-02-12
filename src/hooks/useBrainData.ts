import { useState, useEffect, useCallback } from 'react';
import type { Progress, TestType, TestTypeData, BrainState, ExecutionHistory, BrainConfig } from '../types/brain';

// Detect if we're running inside VS Code webview or standalone browser
interface VsCodeApi {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

const isVsCode = typeof acquireVsCodeApi === 'function';
let vscodeApi: VsCodeApi | null = null;

if (isVsCode) {
    vscodeApi = acquireVsCodeApi();
}

// --- Standalone browser mode (for development) ---
const BASE_URL = '/testing-brain';
const POLL_INTERVAL = 3000;

export function useBrainData() {
    const [state, setState] = useState<BrainState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- VS Code Webview mode ---
    useEffect(() => {
        if (!isVsCode) return;

        const handler = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'brainState':
                    setState(prev => ({
                        ...message.data,
                        typeData: {
                            ...(prev?.typeData ?? {}),
                            ...message.data.typeData,
                        },
                    }));
                    setLoading(false);
                    setError(null);
                    break;
                case 'typeData':
                    setState(prev => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            typeData: {
                                ...prev.typeData,
                                [message.testType]: message.data,
                            },
                        };
                    });
                    break;
            }
        };

        window.addEventListener('message', handler);

        // Tell extension we're ready
        vscodeApi!.postMessage({ type: 'ready' });

        return () => window.removeEventListener('message', handler);
    }, []);

    // --- Standalone browser mode ---
    useEffect(() => {
        if (isVsCode) return;

        const fetchData = async () => {
            try {
                const [progressRes, historyRes, configRes] = await Promise.all([
                    fetch(`${BASE_URL}/progress.json`),
                    fetch(`${BASE_URL}/execution_history.json`).catch(() => null),
                    fetch(`${BASE_URL}/config.json`).catch(() => null),
                ]);
                if (!progressRes.ok) throw new Error('Failed to fetch progress');
                const progress: Progress = await progressRes.json();

                let history: ExecutionHistory | null = null;
                if (historyRes && historyRes.ok) {
                    history = await historyRes.json();
                }

                let config: BrainConfig | null = null;
                if (configRes && configRes.ok) {
                    config = await configRes.json();
                }

                setState(prev => ({
                    progress,
                    typeData: prev?.typeData ?? {},
                    history,
                    config,
                }));
                setError(null);
            } catch (err) {
                console.error('Error fetching brain data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    const fetchTypeData = useCallback(async (type: TestType): Promise<TestTypeData | null> => {
        // VS Code mode: send message to extension
        if (isVsCode) {
            vscodeApi!.postMessage({ type: 'fetchTypeData', testType: type });
            return null; // Data will come via message event
        }

        // Standalone mode: HTTP fetch
        try {
            const res = await fetch(`${BASE_URL}/types/${type}.json`);
            if (!res.ok) return null;
            const data: TestTypeData = await res.json();

            setState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    typeData: { ...prev.typeData, [type]: data },
                };
            });
            return data;
        } catch (err) {
            console.error(`Error fetching ${type} data:`, err);
            return null;
        }
    }, []);

    return { state, loading, error, fetchTypeData };
}
