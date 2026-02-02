
export async function getCoordinates(city: string, country?: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
        const query = country ? `${city}, ${country}` : city;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TalentoSpot-App/1.0'
            }
        });

        if (!response.ok) {
            console.warn('Geocoding API request failed:', response.statusText);
            return null;
        }

        const data = await response.json();
        if (data && data.length > 0 && data[0].lat && data[0].lon) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}
