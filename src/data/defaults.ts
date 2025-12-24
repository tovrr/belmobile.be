import { GlobalRepairSettings, RepairIssueDefinition } from '../types';

import { REPAIR_ISSUES } from '../constants';

// Metadata that exists in Admin Defaults but not in Frontend Constants
const ISSUE_METADATA: Record<string, { defaultDimensions: { key: string, label: string, options: string[] }[] }> = {
    screen: {
        defaultDimensions: [
            { key: 'quality', label: 'Quality', options: ['Generic (LCD)', 'OLED (Soft)', 'Original (Refurb)'] }
        ]
    },
    screen_component: {
        defaultDimensions: [
            { key: 'part', label: 'Part', options: ['Glass Only', 'LCD Only', 'Digitizer Only'] },
            { key: 'type', label: 'Type', options: ['Standard', 'Inner Foldable', 'Outer Foldable'] }
        ]
    },
    // Special Foldable Handling (not in main list but needed for Admin)
    screen_foldable_inner: {
        defaultDimensions: []
    },
    screen_foldable_outer: {
        defaultDimensions: []
    }
};

// Map Icon Components to String Names for Firestore Storage
// (Since constants.ts has the actual React Component, we can't save that to DB)
const ICON_NAME_MAP: Record<string, string> = {
    'screen': 'DevicePhoneMobileIcon',
    'screen_foldable_inner': 'DeviceTabletIcon',
    'screen_foldable_outer': 'DevicePhoneMobileIcon',
    'screen_component': 'Square2StackIcon',
    'back_glass': 'Square2StackIcon',
    'battery': 'Battery50Icon',
    'charging': 'BoltIcon',
    'housing': 'DevicePhoneMobileIcon',
    'camera_rear': 'CameraIcon',
    'camera_lens': 'CameraIcon',
    'camera_front': 'CameraIcon',
    'audio': 'SpeakerWaveIcon',
    'software': 'CommandLineIcon',
    'water': 'CloudIcon',
    'microsoldering': 'CpuChipIcon',
    'hdmi': 'TvIcon',
    'cleaning': 'SparklesIcon',
    'disc_drive': 'CircleStackIcon',
    'storage': 'CircleStackIcon',
    'keyboard': 'QueueListIcon',
    'trackpad': 'CursorArrowRippleIcon',
    'card_reader': 'SdCardIcon',
    'joystick': 'CursorArrowRaysIcon',
    'power_supply': 'BoltIcon',
    'antenna': 'SignalIcon',
    'buttons': 'HandRaisedIcon',
    'face_id': 'FaceSmileIcon',
    'other': 'WrenchScrewdriverIcon'
};

const buildDefaultIssues = () => {
    const issues: Record<string, RepairIssueDefinition> = {};

    // 1. Import from Constants
    REPAIR_ISSUES.forEach(issue => {
        // Find metadata
        const meta = ISSUE_METADATA[issue.id] || { defaultDimensions: [] };

        issues[issue.id] = {
            id: issue.id,
            label: issue.label,
            icon: ICON_NAME_MAP[issue.id] || 'WrenchIcon', // Fallback to string name
            description: issue.desc, // Map 'desc' to 'description'
            defaultDimensions: meta.defaultDimensions,
            brands: issue.brands || []
        };
    });

    // 2. Add Admin-Specific Issues that might not be in Frontend Constants (e.g. Foldable Splits if they aren't there)
    // Checking if they exist already
    if (!issues['screen_foldable_inner']) {
        issues['screen_foldable_inner'] = {
            id: 'screen_foldable_inner',
            label: 'Inner Foldable Screen',
            icon: 'DeviceTabletIcon',
            description: 'Main foldable display replacement',
            defaultDimensions: [],
            brands: ['Samsung', 'Google', 'OnePlus']
        };
    }
    if (!issues['screen_foldable_outer']) {
        issues['screen_foldable_outer'] = {
            id: 'screen_foldable_outer',
            label: 'Outer Screen (Cover)',
            icon: 'DevicePhoneMobileIcon',
            description: 'External cover display replacement',
            defaultDimensions: [],
            brands: ['Samsung', 'Google', 'OnePlus']
        };
    }

    return issues;
};

const DEFAULT_ISSUES = buildDefaultIssues();

export const DEFAULT_GLOBAL_SETTINGS: GlobalRepairSettings = {
    issues: DEFAULT_ISSUES,
    categories: {
        smartphone: {
            id: 'smartphone',
            label: 'Smartphone',
            supportedIssues: [
                'screen',           // Full Assembly Only (Standard)
                'screen_foldable_inner',  // Foldable Main
                'screen_foldable_outer',  // Foldable Cover
                'battery',
                'charging',
                'back_glass', 'housing',
                'camera_rear', 'camera_lens', 'camera_front', 'face_id',
                'audio',
                'buttons',
                'antenna',
                'microsoldering', 'water', 'software',
                'other'
            ]
        },
        tablet: {
            id: 'tablet',
            label: 'Tablet',
            supportedIssues: [
                'screen',
                'screen_component',
                'battery',
                'charging',
                'housing',
                'camera_rear', 'camera_front', 'face_id',
                'audio',
                'buttons',
                'antenna',
                'microsoldering', 'water', 'software',
                'other'
            ]
        },
        console_home: {
            id: 'console_home',
            label: 'Home Console',
            supportedIssues: [
                'hdmi',
                'cleaning',
                'disc_drive',
                'storage',
                'joystick',
                'power_supply',
                'microsoldering', 'software',
                'other'
            ]
        },
        console_portable: {
            id: 'console_portable',
            label: 'Portable Console',
            supportedIssues: [
                'screen',
                'screen_component',
                'battery',
                'charging',
                'joystick', 'buttons',
                'card_reader',
                'audio',
                'microsoldering', 'water', 'software',
                'cleaning',
                'other'
            ]
        },
        laptop: {
            id: 'laptop',
            label: 'Laptop',
            supportedIssues: [
                'screen',
                'screen_component',
                'battery',
                'charging',
                'keyboard', 'trackpad',
                'storage',
                'cleaning',
                'hdmi',
                'microsoldering', 'water', 'software',
                'other'
            ]
        },
        smartwatch: {
            id: 'smartwatch',
            label: 'Smartwatch',
            supportedIssues: [
                'screen',
                'screen_component',
                'battery',
                'buttons',
                'water', 'software',
                'other'
            ]
        }
    }
};
