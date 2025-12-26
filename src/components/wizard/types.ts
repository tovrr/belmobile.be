import { Dispatch, SetStateAction } from 'react';
import { RepairPricing } from '../../types';

export interface WizardStepProps {
    // Core
    type: 'buyback' | 'repair';
    step: number;
    t: (key: string, ...args: (string | number)[]) => string;
    onNext: () => void;
    onBack: () => void;

    // Category Step (Step 1)
    deviceType?: string;
    setDeviceType?: (type: string) => void;

    // Selection Step (Step 2)
    selectedBrand?: string;
    setSelectedBrand?: (brand: string) => void;
    selectedModel?: string;
    setSelectedModel?: (model: string) => void;
    modelsData?: Record<string, Record<string, number>>;
    isLoadingModels?: boolean;

    // Config / Data
    repairEstimates?: any; // To be typed strictly
    sidebarEstimate?: React.ReactNode;

    // Condition Step (Step 3/4)
    storage?: string;
    setStorage?: (s: string) => void;
    condition?: string;
    setCondition?: (c: string) => void;

    // Sidebar Props (often passed through)
    dynamicRepairPrices?: any;
    selectedScreenQuality?: string | null;
    repairIssues?: string[]; // Used for Sidebar logic
    getSingleIssuePrice?: (id: string) => number | null;
    modelSelectRef?: React.RefObject<HTMLDivElement | null>;
}

// Or we can be more specific per step to avoid a giant mixed bag,
// but "Standardized Communication" implies a common base or flexible type.
// For strict refactoring, specific props for specific steps is cleaner,
// but a "God Object" of props makes orchestration easier initially.
// Let's try to pass specific props but typed nicely.
