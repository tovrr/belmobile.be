export interface DeviceType {
    id: string;
    label: string;
    icon: string;
    aliases?: string[];
}

export const DEVICE_TYPES: DeviceType[] = [
    { id: 'smartphone', label: 'Smartphone', icon: '/images/devices/smartphone.svg', aliases: ['smartphones', 'telephones', 'telephone', 'gsm', 'iphones', 'iphone'] },
    { id: 'tablet', label: 'Tablet', icon: '/images/devices/tablet.svg', aliases: ['tablets', 'tablettes', 'tablette', 'ipads', 'ipad'] },
    { id: 'laptop', label: 'Laptop', icon: '/images/devices/laptop.svg', aliases: ['laptops', 'ordinateurs', 'ordinateur', 'macbooks', 'macbook'] },
    { id: 'console_home', label: 'Home Console', icon: '/images/devices/console.svg', aliases: ['consoles', 'console', 'playstation', 'xbox'] },
    { id: 'console_portable', label: 'Portable Console', icon: '/images/devices/console_portable.svg', aliases: ['handhelds', 'handheld', 'switch'] },
    { id: 'smartwatch', label: 'Smartwatch', icon: '/images/devices/smartwatch.svg', aliases: ['smartwatches', 'montres', 'montre', 'watches', 'watch'] },
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
