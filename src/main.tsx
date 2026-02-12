import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './i18n/i18n.tsx'
import './index.css'

import { ErrorBoundary } from './components/ErrorBoundary.tsx'

function Root() {
    const [key, setKey] = useState(0);
    return (
        <React.StrictMode>
            <LanguageProvider>
                <ErrorBoundary onReset={() => setKey(k => k + 1)}>
                    <App key={key} />
                </ErrorBoundary>
            </LanguageProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)
