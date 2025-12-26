import { useState, useEffect, useCallback, useRef } from 'react';

// Configuration
const PERSISTENCE_VERSION = 'v1';
const DEBOUNCE_DELAY = 500;

interface PersistenceWrapper<T> {
    version: string;
    timestamp: number;
    data: T;
}

/**
 * Custom hook to sync state with localStorage.
 * Features:
 * - Versioning (clears old data if version changes)
 * - Debouncing (prevents main thread blocking on rapid typing)
 * - Hydration Safety (prevents server/client mismatch)
 */
export function useFormPersistence<T>(key: string, initialState: T) {
    // Internal state
    const [state, setState] = useState<T>(initialState);
    const [isHydrated, setIsHydrated] = useState(false);

    // Ref to track if we should save (skips initial mount save)
    const isFirstRender = useRef(true);
    // Timeout ref for debounce
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Hydrate from Storage on Mount
    useEffect(() => {
        setIsHydrated(true); // Mark as client-side usable

        try {
            const storedItem = typeof window !== 'undefined' ? localStorage.getItem(key) : null;

            if (storedItem) {
                const parsed: PersistenceWrapper<T> = JSON.parse(storedItem);

                // Validate Version
                if (parsed.version === PERSISTENCE_VERSION) {
                    console.log(`[Persistence] Restored ${key} (v${parsed.version})`);
                    setState(parsed.data);
                } else {
                    console.warn(`[Persistence] Discarding old version ${key} (Found: ${parsed.version}, Expected: ${PERSISTENCE_VERSION})`);
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error(`[Persistence] Failed to load ${key}`, error);
            // On error, we rely on initialState, no crash.
        }
    }, [key]);

    // 2. Persist to Storage on Change (Debounced)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            try {
                const wrapper: PersistenceWrapper<T> = {
                    version: PERSISTENCE_VERSION,
                    timestamp: Date.now(),
                    data: state
                };
                localStorage.setItem(key, JSON.stringify(wrapper));
                // console.log(`[Persistence] Saved ${key}`);
            } catch (error) {
                console.warn(`[Persistence] Quota exceeded or error saving ${key}`, error);
            }
        }, DEBOUNCE_DELAY);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, state]);

    // Manual Clear
    const clearPersistence = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setState(initialState);
        } catch (e) {
            console.error(e);
        }
    }, [key, initialState]);

    return {
        state,
        setState,
        clearPersistence,
        isHydrated
    };
}
