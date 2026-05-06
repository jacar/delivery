/**
 * Detección dinámica y robusta de la URL de la API.
 * Configurado para dominio principal: deliveryexpressmg.com
 */

const getApiBaseUrl = () => {
    const origin = window.location.origin;

    // 1. Detección Localhost → apunta al servidor de producción
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'https://deliveryexpressmg.com/api';
    }

    // 2. Producción: La app está en la raíz del dominio
    // API se accede directamente en /api
    return `${origin}/api`;
};


export const API_BASE_URL = getApiBaseUrl();
console.log('API_BASE_URL detectada:', API_BASE_URL);

/**
 * Formatea una URL de imagen para asegurar que sea absoluta.
 * También rescata URLs del dominio antiguo (webcincodev.com).
 */
export const formatImageUrl = (url: string | null | undefined) => {
    if (!url) return undefined;

    const domain = 'https://deliveryexpressmg.com';

    // Rescatar URLs del dominio antiguo
    if (url.includes('webcincodev.com')) {
        const parts = url.split('/storage/');
        if (parts.length > 1) {
            return `${domain}/storage/${parts[1]}`;
        }
    }

    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Si la ruta no es absoluta y no empieza por /storage, añadirlo
    // Laravel guarda en public/storage/...
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    if (!cleanUrl.startsWith('/storage/') && !cleanUrl.startsWith('/banners/') && !cleanUrl.startsWith('/fotogramas/')) {
        cleanUrl = `/storage${cleanUrl}`;
    }

    return `${domain}${cleanUrl}`;
};
