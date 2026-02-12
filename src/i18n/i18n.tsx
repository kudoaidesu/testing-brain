import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type Language } from './translations';
export type { Language };

// --- Context ---
interface LanguageContextType {
    lang: Language;
    setLang: (l: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Language>(() => {
        const stored = localStorage.getItem('lang');
        return (stored === 'en' || stored === 'ja') ? stored : 'ja';
    });

    const setLang = useCallback((l: Language) => {
        setLangState(l);
        localStorage.setItem('lang', l);
    }, []);

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        // Safe access with fallbacks
        const langDict = translations[lang] || translations['ja'];
        let text = langDict?.[key] ?? translations['ja']?.[key] ?? key;

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
