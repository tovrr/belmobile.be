import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a component is mounted or a condition is true.
 * @param isLocked - Boolean to toggle scroll lock
 */
export function useLockBodyScroll(isLocked: boolean = true) {
    useEffect(() => {
        if (!isLocked) return;

        // Save original overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;

        // Prevent scrolling on mount
        document.body.style.overflow = 'hidden';

        // Re-enable scrolling on unmount
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [isLocked]);
}
