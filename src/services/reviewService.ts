import { SHOPS } from '../constants';

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

export interface FormattedReview {
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
    publishTime: number;
    shopName: string;
    photoUrl?: string;
}

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export async function getReviews(lang: string = 'fr'): Promise<FormattedReview[]> {
    if (!GOOGLE_API_KEY) {
        console.error('[Review Service] Missing Google API Key');
        return [];
    }

    try {
        const allReviews: FormattedReview[] = [];
        const activeShops = SHOPS.filter(shop => shop.googlePlaceId && shop.status !== 'coming_soon');

        // Fetching reviews for all shops in parallel
        const fetchPromises = activeShops.map(async (shop) => {
            try {
                const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${shop.googlePlaceId}&fields=reviews,rating,user_ratings_total,name&key=${GOOGLE_API_KEY}&language=${lang}`;
                const response = await fetch(url, { next: { revalidate: 3600 } });
                const data = await response.json() as GooglePlaceResponse;

                if (data.status === 'OK' && data.result?.reviews) {
                    return data.result.reviews
                        .filter((r: GoogleReview) => r.rating >= 4)
                        .map((r: GoogleReview) => ({
                            id: `${shop.id}-${r.time}-${r.author_name}`,
                            author: r.author_name,
                            rating: r.rating,
                            text: r.text,
                            date: r.relative_time_description,
                            publishTime: r.time,
                            shopName: shop.name,
                            photoUrl: r.profile_photo_url
                        }));
                }
            } catch (err) {
                console.error(`[Review Service] Fetch error for ${shop.id}:`, err);
            }
            return [];
        });

        const results = await Promise.all(fetchPromises);
        results.forEach(reviews => allReviews.push(...reviews));

        // Sort by date (newest first) and limit to top 9
        return allReviews
            .sort((a, b) => b.publishTime - a.publishTime)
            .slice(0, 9);
    } catch (error) {
        console.error('[Review Service] Global error:', error);
        return [];
    }
}
