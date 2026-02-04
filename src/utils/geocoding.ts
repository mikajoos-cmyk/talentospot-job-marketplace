
export interface GeoLocation {
    city: string;
    street?: string;
    houseNumber?: string;
    state?: string;
    postalCode?: string;
    country: string;
    lat: number;
    lon: number;
    displayName: string;
}

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

export async function searchCities(query: string, countryCode?: string, type?: 'city' | 'address'): Promise<GeoLocation[]> {
    try {
        if (!query || query.length < 2) return [];

        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
        if (countryCode) {
            url += `&countrycodes=${countryCode}`;
        }

        if (type === 'city') {
            url += '&featuretype=city';
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'TalentoSpot-App/1.0'
            }
        });

        if (!response.ok) {
            console.warn('Location search API request failed:', response.statusText);
            return [];
        }

        const data = await response.json();

        return data.map((item: any) => ({
            city: item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || item.address?.suburb || item.name,
            street: item.address?.road || item.address?.pedestrian || item.address?.footway,
            houseNumber: item.address?.house_number,
            state: item.address?.state || item.address?.region || item.address?.county || "",
            country: item.address?.country,
            postalCode: item.address?.postcode,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            displayName: item.display_name
        }));

    } catch (error) {
        console.error('Location search error:', error);
        return [];
    }
}
