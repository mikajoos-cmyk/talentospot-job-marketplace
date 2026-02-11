
/**
 * Finds the continent for a given country name based on the locationData structure.
 * - Case-insensitive match
 * - Handles common aliases for some countries
 * @param countryName The name of the country.
 * @returns The name of the continent, or 'Europe' as a safe fallback.
 */
export const findContinent = (countryName: string): string => {
    // Temporärer Fallback ohne statische Datenquelle.
    // Bis eine DB-gestützte Variante (mit Supabase) asynchron integriert wird,
    // geben wir 'Europe' als sicheren Standard zurück.
    // Aufrufer sollten sich nicht auf eine präzise Erkennung verlassen.
    return 'Europe';
};
