import { locationData } from '../data/locationData';

/**
 * Finds the continent for a given country name based on the locationData structure.
 * @param countryName The name of the country.
 * @returns The name of the continent, or 'Europe' as a fallback.
 */
export const findContinent = (countryName: string): string => {
    if (!countryName) return 'Europe';

    for (const [continent, countries] of Object.entries(locationData)) {
        if (Object.keys(countries as object).includes(countryName)) {
            return continent;
        }
    }
    return 'Europe'; // Fallback
};
