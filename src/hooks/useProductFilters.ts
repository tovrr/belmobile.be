'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Product, Shop } from '@/types';
import { useShop } from './useShop';

interface UseProductFiltersProps {
    products: Product[];
    searchParams?: { [key: string]: string | string[] | undefined };
}

export type SortOption = 'default' | 'priceAsc' | 'priceDesc';

export const useProductFilters = ({ products, searchParams = {} }: UseProductFiltersProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { selectedShop, setSelectedShop } = useShop();

    // 1. Initial State from URL
    const searchFromUrl = typeof searchParams.search === 'string' ? searchParams.search : '';
    const catFromUrl = typeof searchParams.cat === 'string' ? searchParams.cat : 'cat_all';
    const sortFromUrl = (typeof searchParams.sort === 'string' ? searchParams.sort : 'default') as SortOption;

    // 2. State
    const [searchTerm, setSearchTerm] = useState(searchFromUrl);
    const [selectedCategory, setSelectedCategory] = useState(catFromUrl);
    const [sortOption, setSortOption] = useState<SortOption>(sortFromUrl);

    // 3. URL Synchronization
    const updateUrl = (updates: Record<string, string>) => {
        const params = new URLSearchParams();

        // Use current state as base for persistence, overridden by updates
        const currentStates = {
            search: searchTerm,
            cat: selectedCategory,
            sort: sortOption,
            shop: selectedShop ? String(selectedShop.id) : ''
        };

        const merged = { ...currentStates, ...updates };

        if (merged.search) params.set('search', merged.search);
        if (merged.cat && merged.cat !== 'cat_all') params.set('cat', merged.cat);
        if (merged.sort && merged.sort !== 'default') params.set('sort', merged.sort);
        if (merged.shop) params.set('shop', merged.shop);

        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    };

    // 4. Filtering Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.description.toLowerCase().includes(lowerTerm)
            );
        }

        // Category
        if (selectedCategory !== 'cat_all') {
            const categoryKeywords: { [key: string]: string } = {
                'cat_smartphone': 'smartphone',
                'cat_tablet': 'tablet',
                'cat_computer': 'computer',
                'cat_console': 'console',
                'cat_smartwatch': 'smartwatch',
                'cat_accessories': 'accessories'
            };
            const target = categoryKeywords[selectedCategory];
            if (target) {
                result = result.filter(p => p.category === target);
            }
        }

        // Shop Availability
        if (selectedShop) {
            result = result.filter(p => {
                const stock = p.availability?.[selectedShop.id.toString()] || 0;
                return stock > 0;
            });
        }

        // Sorting
        if (sortOption === 'priceAsc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'priceDesc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, searchTerm, selectedCategory, sortOption, selectedShop]);

    // Update state when URL changes (back navigation support)
    useEffect(() => {
        setSearchTerm(searchFromUrl);
        setSelectedCategory(catFromUrl);
        setSortOption(sortFromUrl);
    }, [searchFromUrl, catFromUrl, sortFromUrl]);

    // Handlers
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        updateUrl({ search: term });
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        updateUrl({ cat });
    };

    const handleSortChange = (sort: SortOption) => {
        setSortOption(sort);
        updateUrl({ sort });
    };

    const handleShopChange = (shop: Shop | null) => {
        setSelectedShop(shop);
        updateUrl({ shop: shop ? String(shop.id) : '' });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('cat_all');
        setSelectedShop(null);
        updateUrl({ search: '', cat: 'cat_all', shop: '' });
    };

    return {
        // State
        searchTerm,
        selectedCategory,
        sortOption,
        selectedShop,
        filteredProducts,

        // Actions
        setSearchTerm: handleSearch,
        setSelectedCategory: handleCategoryChange,
        setSortOption: handleSortChange,
        setSelectedShop: handleShopChange,
        clearFilters
    };
};
