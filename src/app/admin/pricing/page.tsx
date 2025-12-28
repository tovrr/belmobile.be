'use client';

import React from 'react';
import RepairPricingManagement from '../../../components/admin/RepairPricingManagement';
import { Metadata } from 'next';

// export const dynamic = 'force-dynamic'; // Not allowed in client component

export default function AdminPricingPage() {
    return <RepairPricingManagement />;
}
