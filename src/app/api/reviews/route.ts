import { NextResponse } from 'next/server';
import { SHOPS } from '@/constants';

// Standard Places API Types
interface GoogleReview {
    author_name: string;
    profile_photo_url: string;
    rating: number;
    text: string;
    relative_time_description: string;
    time: number;
}

interface GooglePlaceResponse {
    result?: {
        reviews?: GoogleReview[];
        rating?: number;
        user_ratings_total?: number;
    };
    status: string;
    error_message?: string;
}

interface FormattedReview {
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
    publishTime: number;
    shopName: string;
    photoUrl?: string;
}

// Simple in-memory cache
const cachedReviews: { [key: string]: FormattedReview[] } = {};
const lastFetchTime: { [key: string]: number } = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'fr';

    // console.log(`[Reviews API] GET request received for lang: ${lang}`);
    const now = Date.now();

    if (!GOOGLE_API_KEY) {
        console.error('[Reviews API] Missing Google API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)');
        return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    if (cachedReviews[lang] && (now - (lastFetchTime[lang] || 0) < CACHE_DURATION)) {
        // console.log(`[Reviews API] Returning cached reviews for ${lang}`);
        return NextResponse.json(cachedReviews[lang]);
    }

    try {
        const allReviews: FormattedReview[] = [];
        const activeShops = SHOPS.filter(shop => shop.googlePlaceId && shop.status !== 'coming_soon');

        // console.log(`[Reviews API] Fetching for ${activeShops.length} shops in ${lang}`);

        for (const shop of activeShops) {
            try {
                // Standard Places Library endpoint with language support
                const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.googlePlaceId}&fields=reviews,rating,user_ratings_total,name&key=${GOOGLE_API_KEY}&language=${lang}`;

                const response = await fetch(url);
                const data = await response.json() as GooglePlaceResponse;

                // console.log(`[Reviews API] Shop: ${shop.name} | Status: ${data.status}`);

                if (data.status === 'OK' && data.result?.reviews) {
                    const filteredReviews = data.result.reviews.filter((r: GoogleReview) => r.rating >= 4);
                    const shopReviews = filteredReviews.map((r: GoogleReview) => ({
                        id: `${shop.id}-${r.time}-${r.author_name}`,
                        author: r.author_name,
                        rating: r.rating,
                        text: r.text,
                        date: r.relative_time_description,
                        publishTime: r.time,
                        shopName: shop.name, // Keep full name as requested
                        photoUrl: r.profile_photo_url
                    }));
                    allReviews.push(...shopReviews);
                } else if (data.status !== 'OK') {
                    console.error(`[Reviews API] Error for ${shop.name}: ${data.status} ${data.error_message || ''}`);
                }
            } catch (err) {
                console.error(`[Reviews API] Fetch error for ${shop.id}:`, err);
            }
        }

        // Sort by date (newest first)
        const sortedReviews = allReviews.sort((a, b) => b.publishTime - a.publishTime);
        // console.log(`[Reviews API] Total reviews found for ${lang}: ${sortedReviews.length}`);

        // Limit to top 9 for the UI
        const finalReviews = sortedReviews.slice(0, 9);

        if (finalReviews.length > 0) {
            cachedReviews[lang] = finalReviews;
            lastFetchTime[lang] = now;
        } else {
            console.warn(`[Reviews API] No valid reviews found across all shops for ${lang}`);
        }

        return NextResponse.json(finalReviews.length > 0 ? finalReviews : cachedReviews[lang] || []);
    } catch (error) {
        console.error('[Reviews API] Global error:', error);
        return NextResponse.json(cachedReviews[lang] && cachedReviews[lang]!.length > 0 ? cachedReviews[lang] : { error: 'Failed' }, {
            status: (cachedReviews[lang] && cachedReviews[lang]!.length > 0) ? 200 : 500
        });
    }
}
