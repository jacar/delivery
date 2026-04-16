/**
 * Servicio de Geocodificación usando Nominatim (OpenStreetMap)
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  display_name: string;
}

export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  if (!address || address.length < 3) return null;

  try {
    // Añadimos una restricción de país si es posible, o simplemente buscamos
    // Nominatim requiere un User-Agent identificativo
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'DeliveryExpressApp/1.0'
      }
    });

    if (!response.ok) throw new Error('Error en geocodificación');

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
