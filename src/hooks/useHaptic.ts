import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Hook to trigger haptic feedback on devices that support it.
 * Uses the Vibration API.
 */
export const useHaptic = () => {
    const trigger = useCallback((type: HapticType = 'light') => {
        if (typeof window === 'undefined' || !window.navigator?.vibrate) return;

        switch (type) {
            case 'light':
                window.navigator.vibrate(5); // Very subtle
                break;
            case 'medium':
                window.navigator.vibrate(10); // Standard click feel
                break;
            case 'heavy':
                window.navigator.vibrate(15);
                break;
            case 'success':
                window.navigator.vibrate([10, 30, 10]); // Tuh-tuh-tuh
                break;
            case 'warning':
                window.navigator.vibrate([30, 50, 10]);
                break;
            case 'error':
                window.navigator.vibrate([50, 50, 50, 50]); // Buzz-buzz
                break;
            default:
                window.navigator.vibrate(10);
        }
    }, []);

    return { trigger };
};
