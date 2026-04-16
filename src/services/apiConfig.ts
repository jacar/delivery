/**
 * Detección dinámica y robusta de la URL de la API.
 */

const getApiBaseUrl = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;

    // 1. Detección Localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'https://www.webcincodev.com/b2b/public/api';
    }

    // 2. Detección Dinámica basada en el path actual
    // Buscamos si estamos en /b2b/ o /sas/
    const segment = path.includes('/b2b/') ? '/b2b/' : (path.includes('/sas/') ? '/sas/' : '/b2b/');
    
    // Si la URL ya incluye /public, lo mantenemos como base
    if (path.includes('/public')) {
        const publicPath = path.substring(0, path.indexOf('/public') + 7);
        return `${origin}${publicPath}/api`;
    }

    // Fallback estándar
    return `${origin}${segment}public/api`;
};

export const API_BASE_URL = getApiBaseUrl();
console.log('API_BASE_URL detectada:', API_BASE_URL);
