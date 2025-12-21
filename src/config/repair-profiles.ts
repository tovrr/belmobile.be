export const REPAIR_PROFILES: Record<string, string[]> = {
    // 1. Dual Screen Architecture (DS, 2DS, 3DS)
    'nintendo_dual_screen': [
        'screen_upper',        // "Upper LCD"
        'screen_bottom',       // "Bottom LCD"
        'screen_digitizer',    // "Touch Panel"
        'battery',
        'charging',
        'card_reader',
        'joystick',
        'camera_rear',
        'camera_front',
        'buttons',
        'microsoldering',
        'water',
        'cleaning',
        'audio',
        'housing',
        'antenna'
    ],

    // 2. Separated Screen Architecture (Switch V1/V2, Tablets)
    'separated_screen': [
        'screen_digitizer',    // "Touch Digitizer"
        'screen_lcd',          // "Internal LCD"
        'screen',              // "Full Assembly"
        'battery',
        'charging',
        'joystick',
        'cooling',
        'card_reader',
        'hdmi',
        'microsoldering',
        'water',
        'cleaning',
        'audio',
        'buttons',
        'housing',
        'antenna'
    ],

    // 3. Integrated/Fused Architecture (Switch OLED, Lite, PS Vita)
    'integrated_screen': [
        'screen',              // Full Assembly Only
        'battery',
        'charging',
        'joystick',
        'cooling',
        'card_reader',
        'hdmi',
        'microsoldering',
        'water',
        'cleaning',
        'audio',
        'buttons',
        'housing',
        'antenna'
    ]
};

export const getRepairProfileForModel = (model: string, deviceType: string): string[] | null => {
    const m = model.toLowerCase();

    // Smartphone Default
    if (deviceType === 'smartphone') return null; // Use default logic

    // Nintendo Handhelds
    if (m.includes('2ds') || m.includes('3ds') || m.includes('dsi') || m.includes('ds lite')) {
        return REPAIR_PROFILES['nintendo_dual_screen'];
    }

    if (m.includes('switch')) {
        if (m.includes('oled') || m.includes('lite')) {
            return REPAIR_PROFILES['integrated_screen']; // Fused
        }
        return REPAIR_PROFILES['separated_screen']; // Standard V1/V2 (Separable)
    }

    // Sony Handhelds (Vita/PSP)
    if (m.includes('vita') || m.includes('psp') || m.includes('portal')) {
        return REPAIR_PROFILES['integrated_screen'];
    }

    // Default for other portable consoles/tablets
    if (deviceType === 'console_portable' || deviceType === 'tablet') {
        return REPAIR_PROFILES['separated_screen']; // Default to customizable
    }

    return null; // Fallback to category defaults
};
