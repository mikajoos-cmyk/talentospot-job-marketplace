import { locationData } from '../data/locationData';

/**
 * Finds the continent for a given country name based on the locationData structure.
 * - Case-insensitive match
 * - Handles common aliases for some countries
 * @param countryName The name of the country.
 * @returns The name of the continent, or 'Europe' as a safe fallback.
 */
export const findContinent = (countryName: string): string => {
    if (!countryName) return 'Europe';

    const raw = countryName.trim();
    const lower = raw.toLowerCase();

    // Common alias normalization
    const aliasMap: Record<string, string> = {
        'usa': 'United States',
        'us': 'United States',
        'united states of america': 'United States',
        'u.k.': 'United Kingdom',
        'uk': 'United Kingdom',
        'great britain': 'United Kingdom',
        'uae': 'United Arab Emirates',
        'u.a.e.': 'United Arab Emirates',
        'republic of korea': 'South Korea',
        'korea, republic of': 'South Korea',
        'south korea': 'South Korea',
        'czechia': 'Czech Republic'
    };

    const normalized = aliasMap[lower] || raw;

    for (const [continent, countries] of Object.entries(locationData)) {
        const countryKeys = Object.keys(countries as object);
        // Try exact (case-insensitive)
        if (countryKeys.some(k => k.toLowerCase() === normalized.toLowerCase())) {
            return continent;
        }
    }
    return 'Europe'; // Fallback
};
