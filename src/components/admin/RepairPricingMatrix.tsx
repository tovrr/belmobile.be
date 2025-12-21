import React, { useState, useEffect } from 'react';
import { GlobalRepairSettings } from '../../types';
import { useRobustPricing } from '../../hooks/useRobustPricing';
import { useGlobalSettings } from '../../hooks/useGlobalSettings';
import { getRepairProfileForModel } from '../../config/repair-profiles';
import { REPAIR_ISSUES } from '../../constants';
import { DynamicHeroIcon } from './DynamicHeroIcon';
import { TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Helper to convert option labels to slugs for Firestore queries
const optionToSlug = (option: string): string => {
    return option
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Helper for inputs
const PriceInput = ({
    value,
    onChange,
    onBlur,
    isSaving,
    isSaved,
}: {
    value: number | string,
    onChange: (val: string) => void,
    onBlur: () => void,
    isSaving: boolean,
    isSaved: boolean,
}) => {

    return (
        <div className="space-y-2">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">&euro;</span>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    className={`w-full pl-8 pr-4 py-2 rounded-lg border outline-none transition-all no-spinner
                        ${isSaved ? 'border-green-500 bg-green-50' : 'border-gray-300 dark:border-slate-600 dark:bg-slate-700'}
                        ${isSaving ? 'opacity-70' : ''}
                        focus:ring-2 focus:ring-bel-blue`}
                    placeholder="-"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isSaving && <div className="h-4 w-4 border-2 border-bel-blue border-t-transparent rounded-full animate-spin" />}
                    {!isSaving && isSaved && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
                </div>
            </div>

        </div>
    );
};

interface RepairPricingMatrixProps {
    deviceId: string; // The specific model ID (slug)
    category: string; // e.g. 'smartphone'
    globalSettings: GlobalRepairSettings;
}

export const RepairPricingMatrix: React.FC<RepairPricingMatrixProps> = ({ deviceId, category, globalSettings }) => {
    const { createGlobalIssue } = useGlobalSettings(); // Updated hook
    const { prices, loading, updatePrice } = useRobustPricing(deviceId);

    // DEBUG: Monitor incoming data
    useEffect(() => {
        console.log(`[RepairMatrix] DeviceID: "${deviceId}" | Category: "${category}"`);
        console.log(`[RepairMatrix] Fetched Prices: ${prices.length} `, prices.slice(0, 3));
    }, [deviceId, prices, category]);

    // Local state for optimistic updates
    const [localState, setLocalState] = useState<Record<string, { value: string, status: 'idle' | 'saving' | 'saved', lastSaved: number }>>({});

    // UI State for "Customizing"
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [manuallyActiveIssues, setManuallyActiveIssues] = useState<Set<string>>(new Set());
    const [showAllIssues, setShowAllIssues] = useState(false); // Toggle for "Other" issues

    // State for creating new issues
    const [newIssueLabel, setNewIssueLabel] = useState('');
    const [isCreating, setIsCreating] = useState(false);


    // Compute which issues to show:
    // 1. Issues that have REMOTE prices (from DB)
    // 2. Issues that were manually added in this session locally (to allow setting 1st price)
    // 3. Issues that are SUPPORTED by the category (Auto-show relevant fields)
    // 3. Issues that are SUPPORTED by the category (Auto-show relevant fields)
    const isFoldable = /fold|flip|find.?n|razr|open|find-n/i.test(deviceId);

    const activeIssues = React.useMemo(() => {
        const issuesWithPrices = new Set(prices.map(p => p.issueId));

        // Detect explicitly hidden issues (Soft Deleted i.e. price is -1 for ALL variants)
        const explicitlyHiddenIds = new Set<string>();
        issuesWithPrices.forEach(id => {
            const issuePrices = prices.filter(p => p.issueId === id);
            // If every known price record for this issue is -1, it is considered hidden
            if (issuePrices.length > 0 && issuePrices.every(p => p.price === -1)) {
                explicitlyHiddenIds.add(id);
            }
        });

        const categorySupported = (globalSettings.categories[category]?.supportedIssues || []);
        const profileSupported = getRepairProfileForModel(deviceId, category) || [];

        // Combine both sources
        const allSupported = Array.from(new Set([...categorySupported, ...profileSupported]));

        const smartSupported = allSupported.filter(issueId => {
            // Foldable specific exclusions
            if (isFoldable && issueId === 'screen') {
                return false; // Hide redundant standard screen from auto-suggestions
            }
            if (!isFoldable && (issueId === 'screen_foldable_inner' || issueId === 'screen_foldable_outer')) {
                return false;
            }
            const issueDef = globalSettings.issues[issueId];
            if (issueDef?.brands && issueDef.brands.length > 0) {
                const isAllowed = issueDef.brands.some(b => deviceId.startsWith(b.toLowerCase()) || deviceId.includes(b.toLowerCase()));
                if (!isAllowed) return false;
            }
            return true;
        });

        const combined = new Set([...Array.from(issuesWithPrices), ...Array.from(manuallyActiveIssues), ...smartSupported]);

        // FORCE FILTER
        const filteredFinal = Array.from(combined).filter(issueId => {
            const def = globalSettings.issues[issueId];

            // STRICT SAFETY: If the issue doesn't exist in our definitions, HIDE IT.
            // This filters out "phantom" issues like 'generic', 'oled' that might be in the DB.
            if (!def) return false;

            // EXCLUSION: If explicitly hidden (soft deleted) and not manually re-added
            if (explicitlyHiddenIds.has(issueId) && !manuallyActiveIssues.has(issueId)) {
                return false;
            }

            // 0. Unified Configuration Check
            // If a profile exists for this device, we strictly enforce it.
            const unifiedProfile = getRepairProfileForModel(deviceId, category); // deviceId usually contains model slug or name
            if (unifiedProfile) {
                if (!unifiedProfile.includes(issueId)) return false;
            } else {
                // If no profile, hide specific handheld components (default safety)
                if (['screen_upper', 'screen_bottom', 'screen_digitizer', 'screen_lcd'].includes(issueId)) return false;
            }

            // 1. Brand Check
            if (def?.brands && def.brands.length > 0) {
                const isAllowed = def.brands.some(b => deviceId.startsWith(b.toLowerCase()) || deviceId.includes(b.toLowerCase()));
                if (!isAllowed) return false;
            }
            // 2. Device Type
            if (def?.devices && def.devices.length > 0) {
                if (!def.devices.includes(category)) return false;
            }
            // 3. Foldable (Legacy check, kept for safety but Unified Config should handle most)
            if (!isFoldable && (issueId === 'screen_foldable_inner' || issueId === 'screen_foldable_outer')) {
                return false;
            }
            // Note: We used to hide 'screen' on foldables, but some models use 'screen' for the cover display.
            // We now rely on the device definition or the presence of prices.



            return true;
        });

        console.log('[RepairMatrix] Issues to render:', filteredFinal);
        return new Set(filteredFinal);
    }, [prices, manuallyActiveIssues, category, globalSettings, deviceId, isFoldable]);
    useEffect(() => {
        if (prices.length > 0) {
            // If a manually added issue now has a price, it's safe to keep it
        }
    }, [prices]);

    const handleValueChange = (key: string, val: string) => {
        setLocalState(prev => ({
            ...prev,
            [key]: { ...prev[key], value: val, status: 'idle', lastSaved: prev[key]?.lastSaved || 0 }
        }));
    };

    const handleSave = async (issueId: string, variants: Record<string, string>, priceVal: string, key: string) => {
        if (priceVal === '') return;

        setLocalState(prev => ({
            ...prev,
            [key]: { ...prev[key], value: priceVal, status: 'saving', lastSaved: prev[key]?.lastSaved || 0 }
        }));

        try {
            await updatePrice(issueId, variants, parseFloat(priceVal), true, 0);

            const now = Date.now();
            setLocalState(prev => ({
                ...prev,
                [key]: { ...prev[key], value: priceVal, status: 'saved', lastSaved: now }
            }));

            // Clear saved status after 2 seconds
            setTimeout(() => {
                setLocalState(prev => {
                    const next = { ...prev };
                    if (next[key]?.status === 'saved') next[key] = { ...next[key], status: 'idle' };
                    return next;
                });
            }, 2000);

            // Also ensure it stays in active list
            setManuallyActiveIssues(prev => new Set(prev).add(issueId));

        } catch (err) {
            console.error(err);
            setLocalState(prev => ({
                ...prev,
                [key]: { ...prev[key], status: 'idle' }
            }));
        }
    };

    const handleRemoveIssue = async (issueId: string) => {
        if (!confirm(`Are you sure you want to remove ${issueId}? This will delete all prices for this issue.`)) return;

        // 1. Remove from local override immediately
        const nextManual = new Set(manuallyActiveIssues);
        nextManual.delete(issueId);
        setManuallyActiveIssues(nextManual);

        // 2. Delete from DB (Robust with Soft Delete Fallback)
        const relevantPrices = prices.filter(p => p.issueId === issueId);
        let softDeletedCount = 0;

        const { doc, deleteDoc } = await import('firebase/firestore');
        const { db } = await import('../../firebase');

        await Promise.all(relevantPrices.map(async (p) => {
            if (!p.id) return; // Should have ID now
            try {
                await deleteDoc(doc(db, 'repair_prices', p.id));
            } catch {
                // Permission Denied: Fallback to Soft Delete
                softDeletedCount++;
                try {
                    // Update price to -1 to hide it
                    // Reconstruction of variants map for update is tricky if we don't have it flat.
                    // But updatePrice takes `variants` object.
                    // repair_prices record has `variants: { quality: 'oled' } ` etc.
                    if (p.variants) {
                        await updatePrice(issueId, p.variants, -1, true, 0);
                    }
                } catch (e2) {
                    console.error("Failed to soft delete", e2);
                }
            }
        }));

        if (softDeletedCount > 0) {
            alert(`Note: ${softDeletedCount} variants were 'Soft Deleted'(Hidden) due to permission restrictions.`);
        }
    };

    const handleAddIssue = (issueId: string) => {
        setManuallyActiveIssues(prev => new Set(prev).add(issueId));
        setIsMenuOpen(false);
        setShowAllIssues(false); // Reset toggle
    };



    const handleCreateIssue = async () => {
        if (!newIssueLabel.trim()) return;
        setIsCreating(true);
        try {
            if (createGlobalIssue) {
                const newId = await createGlobalIssue(newIssueLabel);
                handleAddIssue(newId);
                setNewIssueLabel('');
            }
        } catch (e: unknown) {
            const err = e instanceof Error ? e : new Error(String(e));
            alert("Error creating issue: " + err.message);
        } finally {
            setIsCreating(false);
        }
    };

    // (Reverted Bulk Actions)

    const categoryDef = globalSettings.categories[category];
    if (!categoryDef) return <div>Invalid Category: {category}</div>;

    // User Feedback: Only show supported issues (clean UI), unless manually added/created
    // If supportedIssues is undefined, default to empty to avoid crash, OR default to ALL if you want "open" mode.
    // The user requested strict filtering, so default empty/strict is safer.
    const supportedIssues = categoryDef.supportedIssues || [];

    // Sorting Logic: Use REPAIR_ISSUES as the master order source
    const getIssuePriority = (id: string) => {
        // High level overrides
        if (id === 'screen') return -100;
        if (id === 'screen_foldable_inner') return -95;
        if (id === 'screen_foldable_outer') return -90;
        if (id === 'other') return 9999;

        // Fallback to REPAIR_ISSUES index
        const constantIndex = REPAIR_ISSUES.findIndex(r => r.id === id);
        if (constantIndex !== -1) return constantIndex;

        // Fallback to supported list index
        const supportedIndex = supportedIssues.indexOf(id);
        if (supportedIndex !== -1) return supportedIndex + 1000;

        return 5000;
    };

    // Sort the ACTIVE list (main view)
    const sortedActiveIssues = Array.from(activeIssues).sort((a, b) => {
        return getIssuePriority(a) - getIssuePriority(b);
    });

    const primaryAvailable = supportedIssues.filter(id => {
        if (activeIssues.has(id)) return false;

        if (!isFoldable && (id === 'screen_foldable_inner' || id === 'screen_foldable_outer')) {
            return false;
        }

        // Brand Check
        const issueDef = globalSettings.issues[id];
        if (issueDef?.brands && issueDef.brands.length > 0) {
            const isAllowed = issueDef.brands.some(b => deviceId.startsWith(b.toLowerCase()) || deviceId.includes(b.toLowerCase()));
            if (!isAllowed) return false;
        }

        // Device Type Check
        if (issueDef?.devices && issueDef.devices.length > 0) {
            if (!issueDef.devices.includes(category)) return false;
        }



        return true;
    }).sort((a, b) => getIssuePriority(a) - getIssuePriority(b));

    // Secondary: All Global Issues & Not Active & Not Supported & Brand Allowed & Foldable Logic
    const allGlobalIds = Object.keys(globalSettings.issues || {});
    const secondaryAvailable = allGlobalIds.filter(id => {
        if (activeIssues.has(id) || supportedIssues.includes(id)) return false;
        if (!isFoldable && (id === 'screen_foldable_inner' || id === 'screen_foldable_outer')) {
            return false;
        }

        const issueDef = globalSettings.issues[id];
        if (issueDef?.brands && issueDef.brands.length > 0) {
            const isAllowed = issueDef.brands.some(b => deviceId.startsWith(b.toLowerCase()) || deviceId.includes(b.toLowerCase()));
            if (!isAllowed) return false;
        }

        // Device Type Check
        if (issueDef?.devices && issueDef.devices.length > 0) {
            if (!issueDef.devices.includes(category)) return false;
        }



        return true;
    }).sort();

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* Header / Toolbar */}
            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-500">Active Repairs: {sortedActiveIssues.length}</span>

                </div>

                <div className="relative flex items-center gap-2">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-600 text-bel-blue flex items-center gap-2"
                    >
                        <span>âž• Add Issue</span>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden flex flex-col max-h-[80vh]">

                            <div className="p-3 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 shrink-0">
                                <span className="text-xs font-bold text-gray-500">AVAILABLE ISSUES</span>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                {primaryAvailable.length === 0 && !showAllIssues ? (
                                    <div className="p-4 text-center text-gray-400 text-sm">All common issues active</div>
                                ) : (
                                    primaryAvailable.map(id => {
                                        const def = globalSettings.issues[id];
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => handleAddIssue(id)}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center gap-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                            >
                                                <DynamicHeroIcon icon={def?.icon || 'WrenchIcon'} className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm font-medium">{def?.label || id}</span>
                                            </button>
                                        )
                                    })
                                )}

                                {/* Secondary Issues (Toggleable) */}
                                {showAllIssues && (
                                    <>
                                        <div className="px-4 py-2 bg-gray-50/50 dark:bg-slate-900/30 text-xs font-bold text-gray-400 border-y dark:border-slate-700/50">
                                            OTHER GLOBAL ISSUES
                                        </div>
                                        {secondaryAvailable.map(id => {
                                            const def = globalSettings.issues[id];
                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => handleAddIssue(id)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition flex items-center gap-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0 opacity-80"
                                                >
                                                    <DynamicHeroIcon icon={def?.icon || 'WrenchIcon'} className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{def?.label || id}</span>
                                                </button>
                                            )
                                        })}
                                    </>
                                )}
                            </div>

                            {/* footer actions */}
                            <div className="p-2 border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 shrink-0 space-y-2">

                                {/* Show All Toggle */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowAllIssues(!showAllIssues); }}
                                    className="w-full py-1 text-xs text-center text-bel-blue hover:underline"
                                >
                                    {showAllIssues ? 'Show Less' : 'Show All Global Issues'}
                                </button>

                                {/* CREATE NEW SECTION */}
                                <div>
                                    <span className="text-xs font-bold text-gray-500 mb-2 block">âœ¨ CREATE NEW TYPE</span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. Face ID"
                                            value={newIssueLabel}
                                            onChange={(e) => setNewIssueLabel(e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm border rounded dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-1 focus:ring-bel-blue"
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateIssue()}
                                        />
                                        <button
                                            onClick={handleCreateIssue}
                                            disabled={isCreating || !newIssueLabel}
                                            className="px-3 py-1 bg-bel-blue text-white rounded text-xs font-bold disabled:opacity-50 hover:bg-blue-600 transition"
                                        >
                                            {isCreating ? '...' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading && sortedActiveIssues.length === 0 && <div className="text-center p-4 text-gray-500">Loading granular prices...</div>}

            {/* Empty State */}
            {!loading && sortedActiveIssues.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
                    <div className="mb-4">
                        <DynamicHeroIcon icon="WrenchScrewdriverIcon" className="h-12 w-12 text-gray-300 mx-auto" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Repairs Configured</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">This device currently has no active repair options. Add common issues to get started.</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => handleAddIssue('screen')}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-bold text-sm"
                        >
                            + Add Screen
                        </button>
                        <button
                            onClick={() => handleAddIssue('battery')}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-bold text-sm"
                        >
                            + Add Battery
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedActiveIssues.map(issueId => {
                    const issueDef = globalSettings.issues[issueId];
                    if (!issueDef) return null;

                    // SPECIAL CARD: Screen (Main) - ONLY for non-foldable devices
                    // Foldable devices treat ALL screens as simple cards (Service Pack only)
                    if (issueId === 'screen' && !isFoldable) {
                        // Dynamic Variant Discovery
                        // Merge hardcoded variants with any other variants found in DB (to expose ghosts)

                        const isSamsungSNA = deviceId.startsWith('samsung-galaxy-s') || deviceId.startsWith('samsung-galaxy-note') || deviceId.startsWith('samsung-galaxy-a') || deviceId.startsWith('samsung-galaxy-z');

                        let defaultVariants = ['Generic (LCD)', 'OLED (Soft)', 'Original (Refurb)'];

                        if (isSamsungSNA) {
                            defaultVariants = ['Generic (LCD)', 'OLED (Soft)', 'Original (Service-Pack)'];
                        }

                        // Extract variants from valid price records
                        const existingVariants = new Set<string>();
                        prices.filter(p => p.issueId === issueId).forEach(p => {
                            if (p.variants?.quality) {
                                existingVariants.add(p.variants.quality);
                            }
                        });

                        const slugFromLabel = (lbl: string) => lbl.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

                        // Map slugs back to Labels or keep Slug
                        const finalVariants: { label: string, slug: string }[] = defaultVariants.map(lbl => ({
                            label: lbl,
                            slug: slugFromLabel(lbl)
                        }));

                        existingVariants.forEach(dbSlug => {
                            // Check if this slug is represented in defaultVariants
                            // Defaults: generic-lcd, oled-soft, original-refurb
                            const isRepresented = defaultVariants.some(lbl => slugFromLabel(lbl) === dbSlug.toLowerCase());

                            if (!isRepresented) {
                                // It's a GHOST VARIANT! Show it so user can delete it.
                                // Map some common raw slugs back to labels for better UX
                                const lowerSlug = dbSlug.toLowerCase();
                                let label = dbSlug;
                                if (lowerSlug === 'original') label = 'Original (Legacy)';
                                else if (lowerSlug === 'oled') label = 'OLED (Legacy)';
                                else if (lowerSlug === 'generic') label = 'Generic (Legacy)';

                                finalVariants.push({ label, slug: dbSlug });
                            }
                        });


                        return (
                            <div key={issueId} className="col-span-1 md:col-span-2 xl:col-span-3 bg-white dark:bg-slate-800 rounded-xl p-6 border border-blue-100 dark:border-slate-700 shadow-md relative group">
                                <button
                                    onClick={() => handleRemoveIssue(issueId)}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                    title="Remove Issue"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>

                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <DynamicHeroIcon icon="DevicePhoneMobileIcon" className="h-8 w-8 text-bel-blue" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                            {issueId === 'screen' ? 'Screen / Display Assembly' : (issueId === 'screen_foldable_inner' ? 'Inner Foldable Screen' : 'Outer Screen (Cover)')}
                                        </h3>
                                        <p className="text-sm text-gray-500">Managed Variants</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {finalVariants.map(({ label: variantLabel, slug }) => {
                                        const dimKey = 'quality'; // Default for screen
                                        const key = `${issueId}-${slug}`;

                                        // Retrieve remote price data
                                        const remote = prices.find(p =>
                                            p.issueId === issueId && (
                                                p.variants?.[dimKey]?.toLowerCase() === slug.toLowerCase() ||
                                                (!p.variants && (slug === 'original-refurb' || slug === 'original-service-pack'))
                                            )
                                        );
                                        const local = localState[key];
                                        const displayValue = local ? local.value : (remote?.price?.toString() || '');


                                        return (
                                            <div key={slug} className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 relative group/variant">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{variantLabel}</span>
                                                    <div className="flex items-center gap-2">
                                                        {remote && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                                                        )}
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (!confirm(`Delete variant '${variantLabel}' ? This cannot be undone.`)) return;

                                                                // Find ID to delete
                                                                let targetId = remote?.id;

                                                                // Fallback if we don't have remote loaded (unlikely if active)
                                                                // Or if we are deleting a computed ghost
                                                                if (!targetId) {
                                                                    // Try to construct Standard ID: ${deviceId}_${issueId}_${slug}
                                                                    // The variant suffix for single-dimension quality is just the slug
                                                                    targetId = `${deviceId}_${issueId}_${slug}`;
                                                                }

                                                                if (targetId) {
                                                                    try {
                                                                        const { doc, deleteDoc } = await import('firebase/firestore');
                                                                        const { db } = await import('../../firebase');
                                                                        await deleteDoc(doc(db, 'repair_prices', targetId));

                                                                        // Also update local state to hide it visually immediately?
                                                                        // The robust hook will update 'prices' via snapshot.
                                                                    } catch (err: unknown) {
                                                                        alert("Error deleting: " + (err instanceof Error ? err.message : String(err)));
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition opacity-100"
                                                            title="Delete Variant"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <PriceInput
                                                    value={displayValue}
                                                    onChange={(val) => handleValueChange(key, val)}
                                                    onBlur={() => handleSave(issueId, { [dimKey]: slug }, displayValue, key)}
                                                    isSaving={localState[key]?.status === 'saving'}
                                                    isSaved={localState[key]?.status === 'saved'}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }

                    // Determine Dimensions
                    // Foldable devices treat ALL screens as simple cards (Service Pack only)
                    const dimensions = (isFoldable && (issueId === 'screen' || issueId === 'screen_foldable_inner' || issueId === 'screen_foldable_outer'))
                        ? []
                        : (issueDef.defaultDimensions || []);

                    return (
                        <div key={issueId} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm relative group">

                            {/* Remove Button (Hover) */}
                            <button
                                onClick={() => handleRemoveIssue(issueId)}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                                title="Remove Issue & Delete Prices"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                {issueDef.icon && (
                                    <div className="p-2 bg-bel-blue/10 rounded-lg">
                                        {/* Placeholder for Icon */}
                                        <DynamicHeroIcon icon={issueDef.icon} className="h-5 w-5 text-bel-blue" />
                                    </div>
                                )}
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    {issueDef.label}
                                </h3>
                            </div>

                            {/* CONTENT */}
                            {(() => {
                                // Dynamic Variant Logic
                                if (dimensions.length > 0) {
                                    // For now, handle SINGLE dimension (e.g. Quality)
                                    // If multiple (e.g. Quality + Color), we need nested?
                                    // Current UI seems to iterate options of the FIRST dimension.
                                    const dim = dimensions[0];
                                    const dimKey = dim.key;

                                    return (
                                        <div className="space-y-3">
                                            {dim.options.map(slugStr => {
                                                const slug = optionToSlug(slugStr);
                                                const label = slugStr;
                                                const key = `${issueId}-${slug}`;

                                                return (
                                                    <div key={slug} className="flex items-center gap-2">
                                                        <div className="w-1/3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                            {label}
                                                        </div>
                                                        <div className="flex-1 flex gap-2">
                                                            {(() => {
                                                                const remote = prices.find(p => p.issueId === issueId && p.variants?.[dimKey] === slug);
                                                                const local = localState[key];
                                                                const displayValue = local ? local.value : (remote?.price?.toString() || '');

                                                                return (
                                                                    <PriceInput
                                                                        value={displayValue}
                                                                        onChange={(val) => handleValueChange(key, val)}
                                                                        onBlur={() => handleSave(issueId, { [dimKey]: slug }, displayValue, key)}
                                                                        isSaving={localState[key]?.status === 'saving'}
                                                                        isSaved={localState[key]?.status === 'saved'}
                                                                    />
                                                                );
                                                            })()}
                                                        </div>
                                                        {/* Delete Variant Button */}
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(`Delete variant '${label}' ? `)) {
                                                                    const { doc, deleteDoc } = await import('firebase/firestore');
                                                                    const { db } = await import('../../firebase');

                                                                    // Reconstruct key for local state update
                                                                    const key = `${issueId}-${slug}`;

                                                                    const remote = prices.find(p => p.issueId === issueId && p.variants?.[dimKey] === slug);
                                                                    let targetId = '';

                                                                    if (remote && remote.id) {
                                                                        targetId = remote.id;
                                                                    } else {
                                                                        const variantSuffix = `${dimKey}-${slug}`;
                                                                        targetId = `${deviceId}_${issueId}_${variantSuffix}`;
                                                                    }

                                                                    if (targetId) {
                                                                        try {
                                                                            await deleteDoc(doc(db, 'repair_prices', targetId));
                                                                        } catch {
                                                                            // Permission Denied or other error: Fallback to Soft Delete
                                                                            // Set price to -1 to hide it from frontend
                                                                            handleSave(issueId, { [dimKey]: slug }, '-1', key);
                                                                            alert("Note: Strict deletion failed (permissions). The variant has been 'Soft Deleted' (Hidden) instead.");
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                            title="Delete Variant"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-3">
                                        <div className="max-w-xs">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Base Price</label>
                                            {(() => {
                                                const key = issueId;
                                                const state = localState[key];

                                                // Improved Detection: Find flat record OR variant record (e.g. Service Pack/Original/OLED)
                                                // This ensures that if a device previously Had variants but we are now showing simple card,
                                                // the user can still see and edit the "primary" price.
                                                const remoteRecord = prices.find(p => p.issueId === issueId && (!p.variants || Object.keys(p.variants).length === 0))
                                                    || prices.find(p => p.issueId === issueId && p.variants?.quality === 'original-service-pack')
                                                    || prices.find(p => p.issueId === issueId && p.variants?.quality === 'original-refurb')
                                                    || prices.find(p => p.issueId === issueId && p.variants?.quality === 'original')
                                                    || prices.find(p => p.issueId === issueId && p.variants?.quality === 'oled-soft')
                                                    || prices.find(p => p.issueId === issueId && p.variants?.quality === 'oled')
                                                    || prices.find(p => p.issueId === issueId); // absolute last resort fallback

                                                const activeVariants = remoteRecord?.variants || {};

                                                const displayValue = (state && state.value !== undefined) ? state.value : (remoteRecord ? String(remoteRecord.price) : '');
                                                return (
                                                    <PriceInput
                                                        value={displayValue}
                                                        onChange={(val) => handleValueChange(key, val)}
                                                        onBlur={() => handleSave(issueId, activeVariants, displayValue, key)}
                                                        isSaving={state?.status === 'saving'}
                                                        isSaved={state?.status === 'saved'}
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="pt-2 border-t border-gray-50 dark:border-slate-700/50">
                                            {/* Hide variant conversion for screens on foldables (they should stay simple) */}
                                            {!(isFoldable && (issueId === 'screen' || issueId === 'screen_foldable_inner' || issueId === 'screen_foldable_outer')) && (
                                                <button
                                                    onClick={() => {
                                                        const name = prompt("Enter variant name (e.g. OLED, Original):");
                                                        if (name) {
                                                            const dimKey = 'quality';
                                                            const slug = optionToSlug(name);
                                                            updatePrice(issueId, { [dimKey]: slug }, 0, true, 0).catch(alert);
                                                        }
                                                    }}
                                                    className="text-xs font-bold text-bel-blue hover:underline flex items-center gap-1"
                                                >
                                                    <span>➕ Convert to Variants</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

