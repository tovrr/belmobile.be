import React from 'react';
import { WrenchIcon } from '@heroicons/react/24/outline';
import * as HeroIcons from '@heroicons/react/24/outline';

export const DynamicHeroIcon = ({ icon, className }: { icon: any, className?: string }) => {
    // Legacy: If icon is already a component/function
    if (typeof icon === 'function' || typeof icon === 'object') {
        const Icon = icon;
        return <Icon className={className} />;
    }

    // New System: If icon is a string name
    // @ts-ignore
    const IconComponent = HeroIcons[icon];
    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // Fallback
    return <WrenchIcon className={className} />;
};
