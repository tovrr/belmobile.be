/**
 * Intelligent Address Parser v1
 * 
 * Goal: Split a single string into Street + Number, Postal Code, and City.
 * Focus: Belgian (4-digit zip) and common European formats.
 */

export interface ParsedAddress {
    streetAddress: string;
    postalCode: string;
    city: string;
    confidence: number;
}

export const parseAddressString = (input: string): ParsedAddress => {
    const defaultResult: ParsedAddress = {
        streetAddress: input.trim(),
        postalCode: '',
        city: '',
        confidence: 0
    };

    if (!input || input.length < 5) return defaultResult;

    const cleanInput = input.trim();

    // 1. Try splitting by comma (High Confidence Pattern: "Rue Gallait 4, 1030 Schaerbeek")
    const commaParts = cleanInput.split(',').map(p => p.trim());

    if (commaParts.length >= 2) {
        const streetPart = commaParts[0];
        const restPart = commaParts.slice(1).join(' ').trim();

        // Look for 4-digit postal code in the second part
        const zipMatch = restPart.match(/(\d{4})/);
        if (zipMatch) {
            const postalCode = zipMatch[1];
            const city = restPart.replace(postalCode, '').replace(/[^a-zA-ZÀ-ÿ\s-]/g, '').trim();

            return {
                streetAddress: streetPart,
                postalCode: postalCode,
                city: city,
                confidence: 0.9
            };
        }
    }

    // 2. Logic for space-separated format (e.g., "Rue Gallait 4 1030 Schaerbeek")
    // Use regex to locate a 4-digit zip code surrounded by optional words
    const spaceZipMatch = cleanInput.match(/(.*?)(\d{4})\s+(.*)/);
    if (spaceZipMatch) {
        const streetPart = spaceZipMatch[1].trim();
        const postalCode = spaceZipMatch[2].trim();
        const cityPart = spaceZipMatch[3].trim();

        if (streetPart && postalCode && cityPart) {
            return {
                streetAddress: streetPart,
                postalCode: postalCode,
                city: cityPart,
                confidence: 0.8
            };
        }
    }

    // 3. Fallback: Just street and number detection without zip/city (Manual verification needed)
    // Looking for a name followed by a number or vice-versa
    const numberAtEnd = cleanInput.match(/(.+?)\s+(\d+[a-zA-Z]?)$/);
    const numberAtStart = cleanInput.match(/^(\d+[a-zA-Z]?)\s+(.+)/);

    if (numberAtEnd || numberAtStart) {
        return {
            streetAddress: cleanInput,
            postalCode: '',
            city: '',
            confidence: 0.5
        };
    }

    return defaultResult;
};
