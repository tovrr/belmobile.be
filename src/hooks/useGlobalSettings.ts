import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { REPAIR_ISSUES } from '../constants';
import { GlobalRepairSettings, RepairIssue } from '../types';

import { DEFAULT_GLOBAL_SETTINGS } from '../data/defaults'; // Static import

export const useGlobalSettings = () => {
    const [repairIssues, setRepairIssues] = useState<RepairIssue[]>(REPAIR_ISSUES as unknown as RepairIssue[]);
    const [robustSettings, setRobustSettings] = useState<GlobalRepairSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                console.log("Global Settings Snapshot:", data); // DEBUG
                if (data.repairIssues && Array.isArray(data.repairIssues)) {
                    // Merge DB issues with Constant issues to ensure new code-level definitions (like antenna, water) appear
                    // even if the DB document is stale.
                    const dbIssues = data.repairIssues as RepairIssue[];
                    const dbIssueIds = new Set(dbIssues.map(i => i.id));

                    const missingFromDb = (REPAIR_ISSUES as unknown as RepairIssue[]).filter(i => !dbIssueIds.has(i.id));

                    setRepairIssues([...dbIssues, ...missingFromDb]);
                }

                // Robust Engine Support
                if (data.issues && data.categories) {
                    const mergedCategories = { ...DEFAULT_GLOBAL_SETTINGS.categories };
                    Object.keys(data.categories).forEach(key => {
                        mergedCategories[key] = {
                            ...mergedCategories[key],
                            ...data.categories[key],
                            // Force-include screen_foldable_inner/outer for smartphone if it's not there
                            supportedIssues: key === 'smartphone'
                                ? Array.from(new Set([...(data.categories[key].supportedIssues || []), 'screen_foldable_inner', 'screen_foldable_outer', 'camera_lens']))
                                : data.categories[key].supportedIssues
                        };
                    });

                    // Merge and SANITIZE issues
                    const mergedIssues = { ...DEFAULT_GLOBAL_SETTINGS.issues, ...data.issues };



                    setRobustSettings({
                        issues: mergedIssues,
                        categories: mergedCategories
                    } as GlobalRepairSettings);
                }
            } else {
                console.log("Global settings document does not exist!"); // DEBUG
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching global settings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateSettings = async (newSettings: Partial<GlobalRepairSettings>) => {
        try {
            await setDoc(doc(db, 'settings', 'global'), newSettings, { merge: true });
        } catch (error) {
            console.error("Error updating global settings:", error);
            throw error;
        }
    };

    const seedDefaults = async () => {
        try {
            console.log("Seeding started. Data keys:", Object.keys(DEFAULT_GLOBAL_SETTINGS));
            await setDoc(doc(db, 'settings', 'global'), DEFAULT_GLOBAL_SETTINGS, { merge: true });
            console.log("Seeding write complete. Check Firestore.");
            alert("Robust engine defaults seeded successfully!");
        } catch (error) {
            console.error("Error seeding defaults:", error);
            alert("Error seeding defaults: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const createGlobalIssue = async (label: string, icon: string = 'WrenchIcon') => {
        // Generate a simple ID
        const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

        if (!id) throw new Error("Invalid Label");

        const newIssue: RepairIssue = {
            id,
            label,
            icon,
            description: 'Custom repair type',
            base: 0,
            devices: [],
            iconType: 'heroicon'
        };

        // Optimistic update? No, let's just write to DB.
        try {
            // We need to read current first to assume array or map structure?
            // The current robust structure uses a Map (Object) for issues.
            // setDoc with merge: true for nested fields is tricky if we don't use dot notation or update existing object.

            // Safer: update the 'issues' map key directly.
            await setDoc(doc(db, 'settings', 'global'), {
                [`issues.${id}`]: newIssue
            }, { merge: true });

            // Also need to decide: Is this issue "supported" by any category? 
            // In the strict schema, it must be in 'supportedIssues' of a category to show up.
            // BUT our new "Add Issue" menu shows *everything* in `globalSettings.issues`? 
            // - If yes: we are good.
            // - If menu only shows category.supportedIssues: we need to add it there too.
            // Let's assume the "Add Issue" menu in Matrix reads from specific category supported list. 
            // User probably wants it available for THIS category at least.
            // Ideally, custom issues are "Universal". 

            // For now: Just add the definition. We will update Matrix to show "All Global Issues" in the add menu, 
            // OR we add it to *every* category's supported list? (Messy)
            // Better: Matrix "Add Menu" checks `globalSettings.issues` (All of them).

        } catch (error) {
            console.error("Error creating global issue:", error);
            throw error;
        }

        return id;
    };

    return { repairIssues, robustSettings, updateSettings, seedDefaults, loading, createGlobalIssue };
};
