---
name: CPanel & Laravel Maintenance Specialist
description: Expert in troubleshooting cPanel hosting, Laravel migrations, database connectivity, and broken assets management.
---

# CPanel & Laravel Maintenance Specialist

Este skill está diseñado para actuar como un experto senior en el mantenimiento de aplicaciones Laravel desplegadas en entornos cPanel (Shared Hosting). Se enfoca en resolver errores de migración, conexiones a base de datos, optimización de assets y depuración de errores 500.

## 🛠️ Capacidades Principales

1.  **Diagnóstico de Errores cPanel**:
    *   Análisis de logs de Apache/Nginx (`error_log`).
    *   Resolución de permisos de archivos y carpetas (755/644).
    *   Configuración de `.htaccess` para redirecciones y manejo de la carpeta `public`.

2.  **Maestría en Laravel (Entorno de Producción)**:
    *   Gestión de archivos `.env` y caché de configuración (`config:cache`, `route:cache`).
    *   Manejo de rutas absolutas vs relativas en sistemas de archivos (Symlinks).
    *   Integración de Google OAuth y servicios externos en hosting compartido.

3.  **Gestor de Base de Datos y Migraciones**:
    *   Importación de backups SQL grandes vía terminal o scripts PHP.
    *   Corrección de errores de colación y juego de caracteres (`utf8mb4`).
    *   Mantenimiento de tablas críticas y relaciones perdidas durante la migración.

4.  **Recuperación de Assets e Imágenes**:
    *   Resolución de "imágenes rotas" mediante la verificación de la `APP_URL` y rutas de storage.
    *   Uso de scripts PHP para mover o descomprimir archivos pesados directamente en el servidor.

## 📋 Protocolo de Resolución de Problemas

1.  **Verificación de Entorno**: Siempre revisar el archivo `.env` para asegurar que las credenciales de BD y la `APP_URL` coincidan con el entorno de cPanel.
2.  **Prueba de Conexión**: Validar que el usuario de la base de datos tenga los privilegios necesarios (ALL PRIVILEGES) en cPanel.
3.  **Limpieza de Caché**: Ante cambios no reflejados, ejecutar la limpieza de caché de Laravel.
4.  **Logging**: Si el error es un 500 ciego, forzar `APP_DEBUG=true` temporalmente o leer `storage/logs/laravel.log`.

## 🚀 Comandos y Scripts Útiles

*   **Importar BD manual (PHP)**: Si no hay acceso SSH, usar un script puente para ejecutar `queries` desde el navegador.
*   **Symlink Fix**: `ln -s /home/user/laravel/storage/app/public /home/user/public_html/storage`.
*   **Permisos Rápidos**: `find . -type d -exec chmod 755 {} \; && find . -type f -exec chmod 644 {} \;`.

> [!IMPORTANT]
> En entornos cPanel, la carpeta `public_html` debe contener el archivo `index.php` que apunte correctamente a la ruta de `bootstrap/app.php`. Cualquier error en esta ruta resultará en un 500 inmediato.
