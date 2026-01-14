import { SendCloudParcel } from '../../types';
import { logger } from '@/utils/logger';

/**
 * Server-side Logistics Service
 * Manage shipping labels, tracking, and courier interactions via SendCloud.
 */
export const logisticsService = {

    /**
     * Creates a Shipping Label via SendCloud API.
     * Requires SENDCLOUD_PUBLIC_KEY and SENDCLOUD_SECRET_KEY in environment variables.
     */
    async createShippingLabel(parcelData: SendCloudParcel): Promise<{ trackingNumber: string; labelUrl: string; trackingUrl?: string }> {
        const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
        const secretKey = process.env.SENDCLOUD_SECRET_KEY;

        // Fallback to Mock if keys are missing (Dev/Demo mode)
        if (!publicKey || !secretKey) {
            logger.warn('[Logistics] Missing SendCloud Keys. Using Mock Data.', { action: 'label_mock' });
            return {
                trackingNumber: `MOCK-BE-${Date.now().toString().slice(-6)}`,
                labelUrl: 'https://belmobile.be/assets/mock-label.pdf',
                trackingUrl: 'https://belmobile.be/track'
            };
        }

        logger.info('[Logistics] Creating SendCloud Label', { action: 'label_creation_start', email: parcelData.email });

        try {
            const payload = {
                parcel: {
                    name: parcelData.name,
                    address: parcelData.address,
                    city: parcelData.city,
                    postal_code: parcelData.postal_code,
                    country: parcelData.country,
                    email: parcelData.email,
                    telephone: parcelData.telephone,
                    request_label: parcelData.request_label,
                    // Default to 'send' mode standard shipping if not specified
                    // In a real app, you'd select the shipment_method_id based on carrier preference
                }
            };

            // Basic Auth Header
            const authHeader = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64');

            const response = await fetch('https://panel.sendcloud.sc/api/v2/parcels', {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                logger.error('[Logistics] SendCloud API Error:', { action: 'label_creation_api_error', status: response.status, errorBody });
                throw new Error(`SendCloud API Error: ${response.status}`);
            }

            const data = await response.json();
            const parcel = data.parcel;

            logger.info('[Logistics] Label Created Successfully', { action: 'label_creation_success', parcelId: parcel.id });

            return {
                trackingNumber: parcel.tracking_number,
                labelUrl: parcel.label?.label_printer || parcel.label?.normal_printer || '',
                trackingUrl: parcel.tracking_url
            };

        } catch (error) {
            logger.error('[Logistics] Failed to create label:', { action: 'label_creation_error' }, error);
            // Fallback to avoid breaking the order flow entirely, but alert admin
            // We return nulls to indicate failure without crashing
            throw error;
        }
    },

    /**
     * Determines the initial status based on delivery method.
     */
    getInitialStatus(deliveryMethod: string): string {
        switch (deliveryMethod) {
            case 'send':
            case 'courier':
                return 'pending_drop'; // Wait for user to drop package
            case 'dropoff':
            default:
                return 'new'; // Wait for user to come to shop
        }
    }
};
