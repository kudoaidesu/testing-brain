import { useState, useEffect } from 'react';
import type { Progress, TestType, TestTypeData, BrainState } from '../types/brain';

const BASE_URL = '/testing-brain';
const POLL_INTERVAL = 3000;

export function useBrainData() {
    const [state, setState] = useState<BrainState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const progressRes = await fetch(`${BASE_URL}/progress.json`);
                if (!progressRes.ok) throw new Error('Failed to fetch progress');
                const progress: Progress = await progressRes.json();

                setState(prev => ({
                    progress,
                    typeData: prev?.typeData ?? {},
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

    const fetchTypeData = async (type: TestType): Promise<TestTypeData | null> => {
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
    };

    return { state, loading, error, fetchTypeData };
}
