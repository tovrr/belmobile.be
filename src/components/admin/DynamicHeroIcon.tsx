import React from 'react';
import { WrenchIcon } from '@heroicons/react/24/outline';
import * as HeroIcons from '@heroicons/react/24/outline';

export const DynamicHeroIcon = ({ icon, className }: { icon: string | React.ComponentType<{ className?: string }>, className?: string }) => {
    // Legacy: If icon is already a component/function
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
        const Icon = icon as React.ComponentType<{ className?: string }>;
        return <Icon className={className} />;
    }

    // New System: If icon is a string name
    const IconComponent = (HeroIcons as any)[icon as string];
    if (IconComponent) {
        return <IconComponent className={className} />;
    }

    // Fallback
    return <WrenchIcon className={className} />;
};
