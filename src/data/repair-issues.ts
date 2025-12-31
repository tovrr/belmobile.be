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
    CubeIcon,
    ShieldCheckIcon
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
    category: 'display' | 'power' | 'camera' | 'body' | 'technical';
}

export const REPAIR_ISSUES: RepairIssue[] = [
    // 1. Unified Screen Issues
    { id: 'screen', label: 'Screen Replacement', icon: ScreenIcon, desc: 'Full Display Assembly', base: 80, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_portable'], category: 'display' },

    // Foldable Specific
    { id: 'screen_foldable_inner', label: 'Inner Foldable Screen', icon: ScreenIcon, desc: 'Main Internal Display', base: 400, devices: ['smartphone'], category: 'display' },
    { id: 'screen_foldable_outer', label: 'Outer Screen (Cover)', icon: ScreenIcon, desc: 'External Cover Display', base: 120, devices: ['smartphone'], category: 'display' },

    // Nintendo DS Series Specific
    { id: 'screen_upper', label: 'Upper Screen', icon: ScreenIcon, desc: 'Top Display LCD', base: 70, devices: ['console_portable'], brands: ['Nintendo'], category: 'display' },
    { id: 'screen_bottom', label: 'Bottom Screen', icon: ScreenIcon, desc: 'Touch Screen LCD', base: 60, devices: ['console_portable'], brands: ['Nintendo'], category: 'display' },

    // Separated Layers (Switch, Tablets)
    { id: 'screen_digitizer', label: 'Touch Digitizer', icon: ScreenIcon, desc: 'Glass + Touch ONLY', base: 50, devices: ['tablet', 'console_portable'], category: 'display' },
    { id: 'screen_lcd', label: 'Internal LCD', icon: ScreenIcon, desc: 'Display Panel ONLY', base: 60, devices: ['tablet', 'console_portable'], category: 'display' },

    { id: 'screen_component', label: 'Glass / LCD Only', icon: ScreenIcon, desc: 'Partial Repair (Glass/LCD)', base: 60, devices: ['tablet', 'console_portable', 'laptop', 'smartwatch'], category: 'display' },
    { id: 'battery', label: 'Battery Issue', icon: Battery50Icon, desc: 'Drains fast / won\'t charge', base: 50, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_portable'], category: 'power' },
    { id: 'charging', label: 'Charging Port', icon: BoltIcon, desc: 'Câble lâche ou ne fonctionne pas', base: 60, devices: ['smartphone', 'tablet', 'laptop', 'console_portable'], category: 'power' },
    { id: 'back_glass', label: 'Back Glass', icon: BackGlassIcon, desc: 'Cracked rear glass', base: 100, devices: ['smartphone'], category: 'display' },
    { id: 'housing', label: 'Complete Housing', icon: HousingIcon, desc: 'Full frame replacement', base: 150, devices: ['smartphone', 'tablet', 'console_portable'], brands: ['Apple', 'Nintendo'], category: 'body' },

    { id: 'camera_rear', label: 'Rear Camera', icon: CameraIcon, desc: 'Blurry photos or broken lens', base: 70, devices: ['smartphone', 'tablet'], category: 'camera' },
    { id: 'camera_lens', label: 'Camera Lens', icon: CameraLensIcon, desc: 'Cracked outer glass', base: 0, devices: ['smartphone'], category: 'display' },
    { id: 'camera_front', label: 'Front Camera', icon: FrontCameraIcon, desc: 'Selfie camera issue', base: 60, devices: ['smartphone', 'tablet'], category: 'camera' },
    { id: 'face_id', label: 'Face ID', icon: FaceSmileIcon, desc: 'Not working / Unavailable', base: 80, devices: ['smartphone', 'tablet'], brands: ['Apple'], category: 'camera' },
    { id: 'audio', label: 'Audio / Son', icon: SpeakerWaveIcon, desc: 'Speaker, mic, or volume', base: 55, devices: ['smartphone', 'tablet', 'laptop', 'console_portable'], category: 'camera' },
    { id: 'buttons', label: 'Buttons (Power/Vol)', icon: HandRaisedIcon, desc: 'Stuck or broken buttons', base: 50, devices: ['smartphone', 'tablet', 'console_portable', 'smartwatch'], category: 'body' },
    { id: 'antenna', label: 'Antenna / PvP / WiFi', icon: WifiIcon, desc: 'Signal issues', base: 50, devices: ['smartphone', 'tablet'], category: 'technical' },

    { id: 'hdmi', label: 'HDMI / Video Port', icon: TvIcon, desc: 'No signal to TV/Monitor', base: 70, devices: ['console_home', 'laptop', 'console_portable'], category: 'power' },
    { id: 'power_supply', label: 'Power Supply Unit (Internal)', icon: BoltIcon, desc: 'Device dead / Internal PSU', base: 90, devices: ['console_home'], category: 'power' },
    { id: 'disc_drive', label: 'Disc Drive Issue', icon: CircleStackIcon, desc: 'Not reading discs / jammed', base: 80, devices: ['console_home'], category: 'technical' },
    { id: 'card_reader', label: 'Game Card Slot', icon: CpuChipIcon, desc: 'Not reading game cards', base: 60, devices: ['console_portable', 'nintendo'], category: 'technical' },
    { id: 'cleaning', label: 'Cleaning + Thermal Paste', icon: SparklesIcon, desc: 'Overheating / Loud fan', base: 60, devices: ['console_home', 'console_portable', 'laptop'], category: 'technical' },
    { id: 'joystick', label: 'Joystick Repair', icon: CursorArrowRaysIcon, desc: 'Drift or buttons not working', base: 25, devices: ['console_portable', 'console_home'], category: 'body' },

    { id: 'microsoldering', label: 'Microsoldering', icon: CpuChipIcon, desc: 'Motherboard repair', base: 150, devices: ['smartphone', 'tablet', 'console_home', 'laptop', 'console_portable'], category: 'technical' },
    { id: 'water', label: 'Water Damage', icon: WaterDamageIcon, desc: 'Device got wet', base: 40, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_portable'], category: 'technical' },
    { id: 'storage', label: 'Storage / Drive', icon: CubeIcon, desc: 'Hard Drive / SSD issue', base: 80, devices: ['laptop', 'console_home'], category: 'technical' },
    { id: 'keyboard', label: 'Keyboard', icon: ComputerDesktopIcon, desc: 'Keys stuck or not working', base: 100, devices: ['laptop'], category: 'body' },
    { id: 'trackpad', label: 'Trackpad', icon: CursorArrowRaysIcon, desc: 'Not clicking or moving', base: 80, devices: ['laptop'], category: 'body' },
    { id: 'software', label: 'Software Issue', icon: SoftwareIssueIcon, desc: 'Boot loop, virus, or unlock', base: 40, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_home', 'console_portable'], category: 'technical' },
    { id: 'other', label: 'Other / Unknown', icon: WrenchScrewdriverIcon, desc: 'Diagnostic required', base: 30, devices: ['smartphone', 'tablet', 'laptop', 'smartwatch', 'console_home', 'console_portable'], category: 'technical' },
];
