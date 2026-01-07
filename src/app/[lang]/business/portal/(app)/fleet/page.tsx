'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import FleetTable from '@/components/b2b/FleetTable';
import { FleetDevice } from '@/types/models';
import AddDeviceModal from '@/components/b2b/AddDeviceModal';
import RepairRequestModal from '@/components/b2b/RepairRequestModal';
import BulkFleetUploadModal from '@/components/b2b/BulkFleetUploadModal';
import { PlusIcon, ArrowPathIcon, WrenchScrewdriverIcon, ArrowUpTrayIcon, DocumentArrowDownIcon } from '@/components/ui/BrandIcons';
import { generatePDFFromPdfData, savePDFBlob } from '@/utils/pdfGenerator';
import { mapFleetToPdfData } from '@/utils/b2bPdfMapper';

export default function FleetPage() {
    const [loading, setLoading] = useState(true);
    const [devices, setDevices] = useState<FleetDevice[]>([]);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

    const router = useRouter();

    const fetchFleet = async (cid: string) => {
        try {
            const inventoryRef = collection(db, 'b2b_inventory');
            const q = query(inventoryRef, where('companyId', '==', cid));
            const snapshot = await getDocs(q);

            const fetchedDevices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as FleetDevice[];

            setDevices(fetchedDevices);
        } catch (err) {
            console.error("Error fetching fleet:", err);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return; // Middleware should handle redirect

            try {
                // 1. Get User's Company ID
                const userDoc = await getDoc(doc(db, 'b2b_users', user.uid));
                if (!userDoc.exists()) return;

                const cid = userDoc.data().companyId;
                setCompanyId(cid);

                // 2. Fetch Fleet
                await fetchFleet(cid);

            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const toggleDeviceSelection = (id: string) => {
        setSelectedDeviceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleGeneratePdf = async () => {
        if (!companyId) return;
        try {
            // Static imports used at top level

            // TODO: Fetch real company data. Using basic placeholder for now.
            // Fetch real company details
            const companyDoc = await getDoc(doc(db, 'b2b_companies', companyId));
            if (!companyDoc.exists()) throw new Error("Company not found");
            const companyData = { id: companyId, ...companyDoc.data() } as any;

            const pdfData = mapFleetToPdfData(devices, companyData, 'FLEET VALUATION');
            const { blob } = await generatePDFFromPdfData(pdfData, 'Fleet_Valuation');
            savePDFBlob(blob, `Fleet_Valuation_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Could not generate PDF.");
        }
    };

    const selectedDevices = devices.filter(d => selectedDeviceIds.includes(d.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <ArrowPathIcon className="animate-spin text-electric-indigo w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Fleet</h1>
                    <p className="text-slate-500 text-sm">Manage your company devices and assets.</p>
                </div>
                <div className="flex gap-3">
                    {selectedDeviceIds.length > 0 && (
                        <button
                            onClick={() => setIsRepairModalOpen(true)}
                            className="flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-400 border border-amber-600/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-amber-600/20 active:translate-y-1 group"
                        >
                            <WrenchScrewdriverIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            Request Repair ({selectedDeviceIds.length})
                        </button>
                    )}
                    <button
                        onClick={handleGeneratePdf}
                        className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group"
                    >
                        <DocumentArrowDownIcon className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        Export PDF
                    </button>
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group"
                    >
                        <ArrowUpTrayIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        Bulk Ingest
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-600/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-indigo-600/20 active:translate-y-1 group"
                    >
                        <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Add Device
                    </button>
                </div>
            </div>

            <FleetTable
                devices={devices}
                selectedIds={selectedDeviceIds}
                onToggleSelection={toggleDeviceSelection}
            />

            {companyId && (
                <>
                    <AddDeviceModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        companyId={companyId}
                        onSuccess={() => fetchFleet(companyId)}
                    />
                    <BulkFleetUploadModal
                        isOpen={isBulkModalOpen}
                        onClose={() => setIsBulkModalOpen(false)}
                        companyId={companyId}
                        onSuccess={() => fetchFleet(companyId)}
                    />
                    <RepairRequestModal
                        isOpen={isRepairModalOpen}
                        onClose={() => setIsRepairModalOpen(false)}
                        selectedDevices={selectedDevices}
                        companyId={companyId}
                        onSuccess={() => {
                            setSelectedDeviceIds([]);
                            fetchFleet(companyId);
                        }}
                    />
                </>
            )}
        </div>
    );
}

