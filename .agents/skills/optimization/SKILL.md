---
name: Especialista en Optimización y Rendimiento Web
description: Guía y scripts para agilizar la carga de sitios React/Laravel, limpieza de assets y configuración de caché.
---

# Especialista en Optimización y Rendimiento Web

Usa este skill cuando el sitio se sienta pesado, las imágenes carguen lento o la navegación entre secciones (como el panel de clientes) no sea instantánea.

## Estrategias Principales

### 1. Optimización de Imágenes
*   **Lazy Loading**: Todas las etiquetas `<img>` deben incluir `loading="lazy"` (excepto el LCP/Hero inicial).
*   **Formatos**: Priorizar WebP.
*   **Dimensiones**: Asegurar que los logos de aliados no carguen archivos de 5MB para mostrar un círculo de 80px.

### 2. Caché del Servidor (.htaccess)
Para servidores LiteSpeed/Apache, forzar caché de archivos estáticos:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 3. Reducción de Polling
*   Si un servicio (ej. `listenAliados`) usa `setInterval`, ajustar el intervalo a uno razonable (ej. 60-120 segundos) para no saturar la red.

### 4. Limpieza de Assets
*   Eliminar archivos `.zip` o backups pesados de la carpeta `public` que puedan ralentizar el despliegue o el escaneo del servidor.

## Scripts de Limpieza

### Script: optimize_assets.js
```javascript
// Usar sharp o similar (si está disponible) para comprimir imágenes localmente antes de subir.
```
