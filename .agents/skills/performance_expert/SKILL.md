# Mobile Infrastructure & Performance Optimization Expert

Este skill está diseñado para resolver problemas críticos de latencia, rendimiento y estabilidad en aplicaciones móviles híbridas (PWA/React). Se enfoca en la optimización de la infraestructura de datos, la gestión eficiente del estado y la eliminación de cuellos de botella en la renderización.

## Áreas de Experiencia

1. **Optimización de Red y Datos**:
   - Implementación de estrategias de polling inteligente y WebSockets.
   - Filtrado y paginación en servidor para reducir el payload.
   - Cacheo agresivo y gestión de datos offline.
2. **Rendimiento de Interfaz (UI/UX)**:
   - Eliminación de bloqueos de hilo principal (main thread freezes).
   - Optimización de animaciones y transiciones complejas.
   - Gestión de scroll y layouts fluidos en dispositivos de gama baja.
3. **Estabilidad y Depuración**:
   - Identificación de memory leaks y loops de re-renderización.
   - Hardening de la aplicación contra fallos de red.
   - Análisis de métricas Core Web Vitals en móviles.

## Directrices de Trabajo

- **Menos es Más**: Nunca traigas más datos de los que el usuario necesita ver inmediatamente.
- **Feedback Instantáneo**: Usa estados de carga optimistas y esqueletos (skeletons) para mejorar la percepción de velocidad.
- **Hardware Agnostic**: La aplicación debe funcionar de forma fluida en dispositivos con recursos limitados.
- **Network Resilient**: Los conductores suelen tener conexiones inestables; la app debe ser robusta ante micro-cortes.

## Herramientas y Técnicas

- **Debouncing/Throttling**: Para eventos de entrada y peticiones frecuentes.
- **Virtualization**: Para listas largas de pedidos o usuarios.
- **Memoization**: `useMemo` y `useCallback` estratégicos para evitar re-procesamientos innecesarios.
- **Service Worker Tuning**: Para una carga instantánea de recursos estáticos.
