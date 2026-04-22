import React, { memo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pedido } from '../types';

// Fix for default marker icons in Leaflet with Webpack/Vite
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for the driver (motorizado)
const driverIcon = L.divIcon({
  html: `<div class="w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
         </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Custom icon for the destination
const destinationIcon = L.divIcon({
  html: `<div class="w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
         </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// Custom icon for the user
const userIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-blue-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
          <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
         </div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface TrackingMapProps {
  pedido: Pedido;
  userPos?: { lat: number, lng: number } | null;
}

const TrackingMap = memo(({ pedido, userPos }: TrackingMapProps) => {
  const driverPos = pedido.ubicacion_actual ? [pedido.ubicacion_actual.lat, pedido.ubicacion_actual.lng] as [number, number] : null;
  const destPos = pedido.ubicacion_entrega ? [pedido.ubicacion_entrega.lat, pedido.ubicacion_entrega.lng] as [number, number] : null;
  const clientPos = userPos ? [userPos.lat, userPos.lng] as [number, number] : null;
  
  // Default center if no positions are available
  const defaultCenter: [number, number] = driverPos || clientPos || destPos || [10.4806, -66.9036]; // Caracas as fallback

  return (
    <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-inner border border-gray-100">
      <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {clientPos && (
          <Marker position={clientPos} icon={userIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}

        {driverPos && (
          <>
            <Marker position={driverPos} icon={driverIcon}>
              <Popup>
                <div className="font-bold">Repartidor: {pedido.motorizado_nombre}</div>
                <div className="text-xs text-gray-500">En camino a tu ubicación</div>
              </Popup>
            </Marker>
            <ChangeView center={driverPos} />
          </>
        )}

        {destPos && (
          <Marker position={destPos} icon={destinationIcon}>
            <Popup>
              <div className="font-bold">Destino de Entrega</div>
              <div className="text-xs text-gray-500">{pedido.ubicacion_entrega?.direccion}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
});

TrackingMap.displayName = 'TrackingMap';

export default TrackingMap;

