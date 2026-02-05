
interface Location {
    street: string;
    avenue: string;
}

// Simple regex-based extraction for demonstration. A real-world app would use a Geocoding API.
const extractStreetAndAvenue = (address: string): Location => {
    const streetRegex = /(\d{1,4}[a-zA-Z]?\s(?:St|Street|Rd|Road|Dr|Drive|Blvd|Boulevard))\b/i;
    const avenueRegex = /(\d{1,4}[a-zA-Z]?\s(?:Ave|Avenue))\b/i;

    const streetMatch = address.match(streetRegex);
    const avenueMatch = address.match(avenueRegex);

    return {
        street: streetMatch ? streetMatch[0] : 'Unknown Street',
        avenue: avenueMatch ? avenueMatch[0] : 'Unknown Avenue'
    };
}


export const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // In a real production app, you would use a proper Geocoding service API here.
                // For this demo, we'll simulate a lookup.
                console.log(`Simulating reverse geocode for: ${latitude}, ${longitude}`);
                // This is a placeholder. A real API would provide a formatted address.
                const mockAddress = "1 Sir Winston Churchill Square, 102A Ave NW, Edmonton, AB";
                const location = extractStreetAndAvenue(mockAddress);
                resolve(location);
            },
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error("Geolocation permission denied."));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error("Location information is unavailable."));
                        break;
                    case error.TIMEOUT:
                        reject(new Error("The request to get user location timed out."));
                        break;
                    default:
                        reject(new Error("An unknown error occurred while fetching location."));
                        break;
                }
            },
            { timeout: 10000 } // Add a timeout for the request
        );
    });
};
