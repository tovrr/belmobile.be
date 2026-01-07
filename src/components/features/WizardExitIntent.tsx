'use client';

import { useState, useEffect } from 'react';
import { useExitIntent } from '@/hooks/useExitIntent';
import { ExitIntentModal } from '@/components/ui/ExitIntentModal';
import { useWizard } from '@/context/WizardContext';

export const WizardExitIntent = () => {
    const [showModal, setShowModal] = useState(false);
    const { state } = useWizard();
    const [shouldEnable, setShouldEnable] = useState(false);

    useEffect(() => {
        // Only enable if:
        // 1. Not already dismissed
        // 2. User has interacted enough (step > 1) OR has a price (> 0)
        const dismissed = localStorage.getItem('belmobile_exit_intent_dismissed');
        const hasValue = state.currentEstimate > 0 || state.step > 1;

        if (!dismissed && hasValue) {
            setShouldEnable(true);
        } else {
            setShouldEnable(false);
        }
    }, [state.step, state.currentEstimate, showModal]);

    const { reset } = useExitIntent({
        onExit: () => {
            setShowModal(true);
        },
        enabled: shouldEnable && !showModal,
        delay: 3000,
        mobileScrollSpeedThreshold: 2.0
    });

    const handleClose = () => {
        setShowModal(false);
        // Determine if we should disable permanently or just for session is handled in Modal component
        // But here we can verify logic
    };

    return (
        <ExitIntentModal
            isOpen={showModal}
            onClose={handleClose}
        />
    );
};
