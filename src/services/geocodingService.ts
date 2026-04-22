/**
 * Servicio de Geocodificación usando Nominatim (OpenStreetMap)
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}


export const geocodeAddress = async (address: string): Promise<GeocodeResult[] | null> => {
  if (!address || address.length < 3) return null;

  try {
    // Bias results specifically for Mene Grande, Zulia, Venezuela
    // Viewbox for Baralt/Mene Grande area: approx -71.2 to -70.7 Longitude, 9.6 to 10.0 Latitude
    const viewbox = "-71.2,9.6,-70.7,10.0";
    
    // Add context if not present to avoid unrelated global results
    let query = address;
    if (!address.toLowerCase().includes('zulia') && !address.toLowerCase().includes('venezuela')) {
      query = `${address}, Mene Grande, Zulia, Venezuela`;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=ve&viewbox=${viewbox}&bounded=1&accept-language=es`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DeliveryExpressApp/1.1'
      }
    });

    if (!response.ok) throw new Error('Error en geocodificación');

    const data = await response.json();

    if (data && data.length > 0) {
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name
      }));
    }

    // Si con el query específico no hallamos nada, intentamos uno más amplio pero aún filtrado
    if (query !== address) {
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=3&addressdetails=1&countrycodes=ve&accept-language=es`;
      const fallbackResponse = await fetch(fallbackUrl, { headers: { 'User-Agent': 'DeliveryExpressApp/1.1' } });
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData && fallbackData.length > 0) {
        return fallbackData.map((item: any) => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          display_name: item.display_name
        }));
      }
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
