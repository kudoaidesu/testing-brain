import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--badge-fail-text)' }}>
                        Something went wrong
                    </h2>
                    <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                        {this.state.error?.message}
                    </p>
                    <button
                        onClick={() => {
                            this.props.onReset?.();
                            this.setState({ hasError: false, error: null });
                        }}
                        className="px-4 py-2 rounded text-sm"
                        style={{ backgroundColor: 'var(--surface-active)', color: 'var(--fg)' }}
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
