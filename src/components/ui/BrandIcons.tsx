import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    strokeWidth?: number;
}

const BaseIcon = ({ children, size = 24, strokeWidth = 2, ...props }: IconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {children}
    </svg>
);

export const HomeIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </BaseIcon>
);

export const UserIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </BaseIcon>
);

export const SettingsIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </BaseIcon>
);

export const CalendarIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </BaseIcon>
);

export const HeartRateIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </BaseIcon>
);

export const RepairIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </BaseIcon>
);

export const BuybackIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <path d="M11 11V7a5 5 0 00-10 0v4" />
        <path d="M11 19v4a5 5 0 0010 0v-4" />
        <path d="M15 19v4a5 5 0 01-10 0v-4" />
    </BaseIcon>
);

export const StoreIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 10V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v2" />
        <path d="M3 13v6a2 2 0 002 2h14a2 2 0 002-2v-6" />
        <path d="M12 22V12" />
        <path d="M9 12l3-3 3 3" />
    </BaseIcon>
);

export const BatteryIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
        <path d="M23 13v-2" />
    </BaseIcon>
);

export const SignalIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M2 20h.01" />
        <path d="M7 20v-4" />
        <path d="M12 20v-8" />
        <path d="M17 20v-12" />
        <path d="M22 20v-16" />
    </BaseIcon>
);

export const CheckIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M20 6L9 17l-5-5" />
    </BaseIcon>
);

export const CloseIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M18 6L6 18M6 6l12 12" />
    </BaseIcon>
);
export const ArrowRightIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </BaseIcon>
);

export const StarIcon = (props: IconProps) => (
    <BaseIcon {...props} fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </BaseIcon>
);

export const PhoneIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </BaseIcon>
);

export const WhatsAppIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-7.6 8.38 8.38 0 013.8.9L21 11.5z" />
        <path d="M12 15s1.5-1.5 1.5-3.5-1.5-3.5-1.5-3.5" />
        <path d="M10.5 13.5s1.5-1.5 1.5-3.5-1.5-3.5-1.5-3.5" />
    </BaseIcon>
);

export const EmailIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="M22 6l-10 7L2 6" />
    </BaseIcon>
);

export const MapPinIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
        <circle cx="12" cy="10" r="3" />
    </BaseIcon>
);

export const SparklesIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 3l1.91 5.89L21 10.8l-5.09 1.91L14 18.6l-1.91-5.89L7 10.8l5.09-1.91L12 3z" />
        <path d="M5 3l.64 1.96L8 5.6l-2.36.64L5 8.2l-.64-1.96L2 5.6l2.36-.64L5 3z" />
        <path d="M18 18l.64 1.96L21 20.6l-2.36.64L18 23.2l-.64-1.96L15 20.6l2.36-.64L18 18z" />
    </BaseIcon>
);

export const ShieldCheckIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
    </BaseIcon>
);

export const ClockIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </BaseIcon>
);

export const LeafIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M2 22s4.5-4.5 5-9a10 10 0 0 1 10-10l5 1-1 5a10 10 0 0 1-10 10c-4.5.5-9 5-9 5Z" />
        <path d="M12 12 2 22" />
    </BaseIcon>
);

export const TruckIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </BaseIcon>
);

export const ShoppingBagIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
    </BaseIcon>
);

export const CheckCircleIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
    </BaseIcon>
);

export const ArrowLeftIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M19 12H5M12 19l-7-7 7-7" />
    </BaseIcon>
);

export const CameraIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
    </BaseIcon>
);

export const PaperAirplaneIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </BaseIcon>
);

export const MenuIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </BaseIcon>
);

export const CurrencyEuroIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
        <path d="M12 18a6 6 0 01-6-6 6 6 0 016-6" />
        <line x1="4" y1="10h6" />
        <line x1="4" y1="14h6" />
    </BaseIcon>
);

export const ExternalLinkIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </BaseIcon>
);

export const SearchIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </BaseIcon>
);

export const SortIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M11 5L6 0L1 5" />
        <path d="M11 19L6 24L1 19" />
        <path d="M6 24V0" />
    </BaseIcon>
);

export const BuildingStorefrontIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </BaseIcon>
);

export const BuildingOfficeIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="9" y1="22" x2="9" y2="2" />
        <line x1="15" y1="22" x2="15" y2="2" />
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="4" y1="14" x2="20" y2="14" />
        <line x1="4" y1="18" x2="20" y2="18" />
    </BaseIcon>
);

export const DevicePhoneIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12" y2="18" />
    </BaseIcon>
);

export const UsersIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </BaseIcon>
);

export const RocketIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3.5 3.5M22 2l-6.5 6.5M9 18l1.5 1.5M16 8l1.5 1.5M15 12l.01-.01" />
        <path d="M9 11l-3 3M13 7l-3-3" />
        <path d="M18 6l-3 3" />
    </BaseIcon>
);

export const HeartIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </BaseIcon>
);

export const ChartBarIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </BaseIcon>
);

export const BanknotesIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <circle cx="12" cy="14" r="2" />
    </BaseIcon>
);

export const BoltIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </BaseIcon>
);

export const EnvelopeIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </BaseIcon>
);

export const UploadIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </BaseIcon>
);

export const ChatIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 11.5z" />
    </BaseIcon>
);
export const BoxIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <polyline points="21 8 21 16 12 21 3 16 3 8 12 3 21 8" />
        <polyline points="3 8 12 13 21 8" />
        <line x1="12" y1="13" x2="12" y2="21" />
    </BaseIcon>
);

export const DocumentIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </BaseIcon>
);

export const AcademicCapIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </BaseIcon>
);

export const MicroscopeIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 18h8" />
        <path d="M3 22h18" />
        <path d="M14 9a3 3 0 11-6 0 3 3 0 016 0z" />
        <path d="M12 12v2a4 4 0 004 4h2" />
        <path d="M12 9V4a2 2 0 10-4 0v5" />
    </BaseIcon>
);

export const IdentificationIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="3" />
        <path d="M14 10h4M14 14h4M7 16a3 3 0 016 0" />
    </BaseIcon>
);

export const ComputerDesktopIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </BaseIcon>
);

export const GlobeAltIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </BaseIcon>
);

export const RocketLaunchIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3.5 3.5M22 2l-6.5 6.5M9 18l1.5 1.5M16 8l1.5 1.5M15 12l.01-.01" />
        <path d="M9 11l-3 3M13 7l-3-3M18 6l-3 3" />
    </BaseIcon>
);
export const InformationCircleIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </BaseIcon>
);

export const BriefcaseIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </BaseIcon>
);

export const WrenchScrewdriverIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </BaseIcon>
);

export const XMarkIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M6 18L18 6M6 6l12 12" />
    </BaseIcon>
);

export const CpuChipIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </BaseIcon>
);

export const PlusIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 5v14M5 12h14" />
    </BaseIcon>
);

export const MinusIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M5 12h14" />
    </BaseIcon>
);

export const WifiIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
    </BaseIcon>
);

export const FileTextIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </BaseIcon>
);
export const BikeIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2" />
    </BaseIcon>
);

export const BellIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </BaseIcon>
);

export const ArrowPathIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </BaseIcon>
);

export const DevicePhoneMobileIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
    </BaseIcon>
);

export const Cog6ToothIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </BaseIcon>
);

export const LockClosedIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
    </BaseIcon>
);

export const LockOpenIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 019.9-1" />
    </BaseIcon>
);

export const DocumentTextIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </BaseIcon>
);

export const ArrowUpCircleIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="16 12 12 8 8 12" />
        <line x1="12" y1="16" x2="12" y2="8" />
    </BaseIcon>
);

export const ArrowUpTrayIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        <polyline points="16 8 12 4 8 8" />
        <line x1="12" y1="4" x2="12" y2="16" />
    </BaseIcon>
);

export const ArrowDownTrayIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        <polyline points="8 12 12 16 16 12" />
        <line x1="12" y1="16" x2="12" y2="4" />
    </BaseIcon>
);

export const MagnifyingGlassIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </BaseIcon>
);

export const ExclamationTriangleIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </BaseIcon>
);

export const ClipboardIcon = (props: IconProps) => (
    <BaseIcon {...props}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </BaseIcon>
);
