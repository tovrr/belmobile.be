export interface DeviceType {
    id: string;
    label: string;
    icon: string;
}

export const DEVICE_TYPES: DeviceType[] = [
    { id: 'smartphone', label: 'Smartphone', icon: '/images/devices/smartphone.svg' },
    { id: 'tablet', label: 'Tablet', icon: '/images/devices/tablet.svg' },
    { id: 'laptop', label: 'Laptop', icon: '/images/devices/laptop.svg' },
    { id: 'console_home', label: 'Home Console', icon: '/images/devices/console.svg' },
    { id: 'console_portable', label: 'Portable Console', icon: '/images/devices/console_portable.svg' },
    { id: 'smartwatch', label: 'Smartwatch', icon: '/images/devices/smartwatch.svg' },
];

/**
 * Helper to get display label for a device category
 */
export const getDeviceTypeLabel = (id: string): string => {
    // Exact match
    const type = DEVICE_TYPES.find(d => d.id === id);
    if (type) return type.label;

    // Mapping logic for internal variants
    if (id === 'console') return 'Internal Console'; // Fallback

    // Capitalize fallback
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ');
};
