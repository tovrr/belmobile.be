'use client';

import React, { useState, useEffect } from 'react';
import { useExitIntent } from '../../hooks/useExitIntent';
import { ExitIntentModal } from '../ui/ExitIntentModal';
import { useWizard } from '../../context/WizardContext';

export const WizardExitIntent: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const { state } = useWizard();
    const [shouldEnable, setShouldEnable] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !state) return;

        // Only enable if:
        // 1. Not already dismissed
        // 2. User has interacted enough (step > 1) OR has a price (> 0)
        const dismissed = localStorage.getItem('belmobile_exit_intent_dismissed');
        const hasValue = (state.currentEstimate || 0) > 0 || state.step > 1;

        if (!dismissed && hasValue && !state.isWidget && !state.isKiosk) {
            setShouldEnable(true);
        } else {
            setShouldEnable(false);
        }
    }, [state?.step, state?.currentEstimate, state?.isWidget, state?.isKiosk]);

    useExitIntent({
        onExit: () => {
            setShowModal(true);
        },
        enabled: shouldEnable && !showModal,
        delay: 3000,
        mobileScrollSpeedThreshold: 2.0
    });

    const handleClose = () => {
        setShowModal(false);
    };

    return (
        <ExitIntentModal
            isOpen={showModal}
            onClose={handleClose}
        />
    );
};
