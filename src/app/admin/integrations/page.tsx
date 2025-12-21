'use client';

import React from 'react';
import { IntegrationsManager } from '../../../components/admin/IntegrationsManager';

export default function IntegrationsPage() {
    return (
        <div className="p-6 md:p-10 space-y-8">
            <IntegrationsManager />
        </div>
    );
}
