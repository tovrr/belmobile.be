'use client';

import React from 'react';
import Skeleton from '../ui/Skeleton';

const ProductCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-ui-lg shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col h-full">
            {/* Image Skeleton */}
            <div className="relative pt-[100%] bg-gray-50 dark:bg-slate-800/30">
                <Skeleton className="absolute inset-0" />
            </div>

            {/* Content Skeleton */}
            <div className="p-5 flex flex-col grow space-y-4">
                {/* Title */}
                <div className="flex flex-col items-center space-y-2">
                    <Skeleton variant="text" className="h-5 w-3/4" />
                    <Skeleton variant="text" className="h-5 w-1/2" />
                </div>

                {/* Badge */}
                <div className="flex justify-center">
                    <Skeleton variant="rect" className="h-6 w-24 rounded-full" />
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
                    <div className="space-y-1">
                        <Skeleton variant="text" className="h-3 w-8" />
                        <Skeleton variant="text" className="h-6 w-12" />
                    </div>
                    <Skeleton variant="rect" className="h-10 w-24 rounded-ui" />
                </div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
