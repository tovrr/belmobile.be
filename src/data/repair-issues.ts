import React from 'react';
import {
    WrenchScrewdriverIcon,
    Battery50Icon,
    BoltIcon,
    CameraIcon,
    SpeakerWaveIcon,
    SparklesIcon,
    CpuChipIcon,
    CircleStackIcon,
    CursorArrowRaysIcon,
    ComputerDesktopIcon,
    TvIcon,
    FaceSmileIcon,
    WifiIcon,
    HandRaisedIcon,
    CubeIcon
} from '@heroicons/react/24/outline';
import WaterDamageIcon from '../components/icons/WaterDamageIcon';
import SoftwareIssueIcon from '../components/icons/SoftwareIssueIcon';
import FrontCameraIcon from '../components/icons/FrontCameraIcon';
import HousingIcon from '../components/icons/HousingIcon';
import ScreenIcon from '../components/icons/ScreenIcon';
import BackGlassIcon from '../components/icons/BackGlassIcon';
import CameraLensIcon from '../components/icons/CameraLensIcon';

export interface RepairIssue {
    id: string;
    label: string;
    icon: React.ElementType;
    desc: string;
    base: number;
    devices: string[];
    brands?: string[];
}

export const REPAIR_ISSUES: RepairIssue[] = [
    // 1. Unified Screen Issues
    { id: 'screen', label: 'Screen Replacement', icon: ScreenIcon, desc: 'Full Display Assembly', base: 80, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_portable'] },

    // Foldable Specific
    { id: 'screen_foldable_inner', label: 'Inner Foldable Screen', icon: ScreenIcon, desc: 'Main Internal Display', base: 400, devices: ['smartphone'] },
    { id: 'screen_foldable_outer', label: 'Outer Screen (Cover)', icon: ScreenIcon, desc: 'External Cover Display', base: 120, devices: ['smartphone'] },

    // Nintendo DS Series Specific
    { id: 'screen_upper', label: 'Upper Screen', icon: ScreenIcon, desc: 'Top Display LCD', base: 70, devices: ['console_portable'], brands: ['Nintendo'] },
    { id: 'screen_bottom', label: 'Bottom Screen', icon: ScreenIcon, desc: 'Touch Screen LCD', base: 60, devices: ['console_portable'], brands: ['Nintendo'] },

    // Separated Layers (Switch, Tablets)
    { id: 'screen_digitizer', label: 'Touch Digitizer', icon: ScreenIcon, desc: 'Glass + Touch ONLY', base: 50, devices: ['tablet', 'console_portable'] },
    { id: 'screen_lcd', label: 'Internal LCD', icon: ScreenIcon, desc: 'Display Panel ONLY', base: 60, devices: ['tablet', 'console_portable'] },

    { id: 'screen_component', label: 'Glass / LCD Only', icon: ScreenIcon, desc: 'Partial Repair (Glass/LCD)', base: 60, devices: ['tablet', 'console_portable', 'laptop', 'smartwatch'] },
    { id: 'battery', label: 'Battery Issue', icon: Battery50Icon, desc: 'Drains fast / won\'t charge', base: 50, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_portable'] },
    { id: 'charging', label: 'Charging Port', icon: BoltIcon, desc: 'Cable loose or not working', base: 60, devices: ['smartphone', 'tablet', 'laptop', 'console_portable'] },
    { id: 'back_glass', label: 'Back Glass', icon: BackGlassIcon, desc: 'Cracked rear glass', base: 100, devices: ['smartphone'] },
    { id: 'housing', label: 'Complete Housing', icon: HousingIcon, desc: 'Full frame replacement', base: 150, devices: ['smartphone', 'tablet', 'console_portable'], brands: ['Apple', 'Nintendo'] },

    { id: 'camera_rear', label: 'Rear Camera', icon: CameraIcon, desc: 'Blurry photos or broken lens', base: 70, devices: ['smartphone', 'tablet'] },
    { id: 'camera_lens', label: 'Camera Lens', icon: CameraLensIcon, desc: 'Cracked outer glass', base: 0, devices: ['smartphone'] },
    { id: 'camera_front', label: 'Front Camera', icon: FrontCameraIcon, desc: 'Selfie camera issue', base: 60, devices: ['smartphone', 'tablet'] },
    { id: 'face_id', label: 'Face ID', icon: FaceSmileIcon, desc: 'Not working / Unavailable', base: 80, devices: ['smartphone', 'tablet'], brands: ['Apple'] },
    { id: 'audio', label: 'Audio / Sound', icon: SpeakerWaveIcon, desc: 'Speaker, mic, or volume', base: 55, devices: ['smartphone', 'tablet', 'laptop', 'console_portable'] },
    { id: 'buttons', label: 'Buttons (Power/Vol)', icon: HandRaisedIcon, desc: 'Stuck or broken buttons', base: 50, devices: ['smartphone', 'tablet', 'console_portable', 'smartwatch'] },
    { id: 'antenna', label: 'Antenna / PvP / WiFi', icon: WifiIcon, desc: 'Signal issues', base: 50, devices: ['smartphone', 'tablet'] },

    { id: 'hdmi', label: 'HDMI / Video Port', icon: TvIcon, desc: 'No signal to TV/Monitor', base: 70, devices: ['console_home', 'laptop', 'console_portable'] },
    { id: 'power_supply', label: 'Power Supply Unit (Internal)', icon: BoltIcon, desc: 'Device dead / Internal PSU', base: 90, devices: ['console_home'] },
    { id: 'disc_drive', label: 'Disc Drive Issue', icon: CircleStackIcon, desc: 'Not reading discs / jammed', base: 80, devices: ['console_home'] },
    { id: 'card_reader', label: 'Game Card Slot', icon: CpuChipIcon, desc: 'Not reading game cards', base: 60, devices: ['console_portable', 'nintendo'] },
    { id: 'cleaning', label: 'Cleaning + Thermal Paste', icon: SparklesIcon, desc: 'Overheating / Loud fan', base: 60, devices: ['console_home', 'console_portable', 'laptop'] },
    { id: 'joystick', label: 'Joystick Repair', icon: CursorArrowRaysIcon, desc: 'Drift or buttons not working', base: 25, devices: ['console_portable', 'console_home'] },

    { id: 'microsoldering', label: 'Microsoldering', icon: CpuChipIcon, desc: 'Motherboard repair', base: 150, devices: ['smartphone', 'tablet', 'console_home', 'laptop', 'console_portable'] },
    { id: 'water', label: 'Water Damage', icon: WaterDamageIcon, desc: 'Device got wet', base: 40, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_portable'] },
    { id: 'storage', label: 'Storage / Drive', icon: CubeIcon, desc: 'Hard Drive / SSD issue', base: 80, devices: ['laptop', 'console_home'] },
    { id: 'keyboard', label: 'Keyboard', icon: ComputerDesktopIcon, desc: 'Keys stuck or not working', base: 100, devices: ['laptop'] },
    { id: 'trackpad', label: 'Trackpad', icon: CursorArrowRaysIcon, desc: 'Not clicking or moving', base: 80, devices: ['laptop'] },
    { id: 'software', label: 'Software Issue', icon: SoftwareIssueIcon, desc: 'Boot loop, virus, or unlock', base: 40, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_home', 'console_portable'] },
    { id: 'other', label: 'Other / Unknown', icon: WrenchScrewdriverIcon, desc: 'Diagnostic required', base: 30, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_home', 'console_portable'] },
];
