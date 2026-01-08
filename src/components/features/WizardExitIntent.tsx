'use client';

import React, { useState } from 'react';
import { useExitIntent } from '../../hooks/useExitIntent';
import { ExitIntentModal } from '../ui/ExitIntentModal';
import { useWizard } from '../../context/WizardContext';

export const WizardExitIntent: React.FC = () => {
    const { state } = useWizard();
    const [showExitModal, setShowExitModal] = useState(false);

    // Safety check if state is undefined (though context should provide it)
    if (!state) return null;

    const { step, isWidget, isKiosk } = state;

    useExitIntent({
        enabled: step >= 2 && !isWidget && !isKiosk,
        onExit: () => {
            // Check local storage to prevent annoyance
            if (typeof window !== 'undefined' && !localStorage.getItem('belmobile_exit_intent_dismissed')) {
                setShowExitModal(true);
            }
        }
    });

    return (
        <ExitIntentModal isOpen={showExitModal} onClose={() => setShowExitModal(false)} />
    );
};
