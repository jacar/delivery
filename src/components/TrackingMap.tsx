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
const getDriverIcon = (vehicleType?: string) => {
  const isCar = vehicleType?.toLowerCase().includes('auto') || vehicleType?.toLowerCase().includes('carro');
  
  // Moto SVG más detallada con caja de delivery
  const bikeSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="7" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
      <path d="M12 18V9c0-1-1-2-2-2H8l-5 5v4h3"/>
      <rect x="14" y="6" width="6" height="6" rx="1" fill="currentColor" fill-opacity="0.2"/>
      <path d="M16 18V13l-4-4"/>
    </svg>
  `;
  
  const carSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
  
  return L.divIcon({
    html: `
      <div style="position: relative; width: 56px; height: 56px;">
        <div style="position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; background-color: #f97316; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div>
        <div style="position: relative; width: 56px; height: 56px; background-color: #111827; border-radius: 50%; border: 4px solid #f97316; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #f97316;">
          ${isCar ? carSvg : bikeSvg}
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.4; }
            70% { transform: scale(1.3); opacity: 0; }
            100% { transform: scale(1); opacity: 0; }
          }
        </style>
      </div>
    `,
    className: '',
    iconSize: [56, 56],
    iconAnchor: [28, 28]
  });
};

// Custom icon for the destination (now as a Moto Icon)
const destinationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 44px; height: 44px;">
      <div style="position: absolute; inset: -2px; background-color: #3b82f6; border-radius: 50%; opacity: 0.2;"></div>
      <div style="position: relative; width: 44px; height: 44px; background-color: white; border-radius: 50%; border: 3px solid #3b82f6; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: #3b82f6;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="7" cy="18" r="2"/>
          <circle cx="18" cy="18" r="2"/>
          <path d="M12 18V9c0-1-1-2-2-2H8l-5 5v4h3"/>
          <path d="M16 18V13l-4-4"/>
        </svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Custom icon for the user
const userIcon = L.divIcon({
  html: `<div style="width: 32px; height: 32px; background-color: #60a5fa; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; animation: ping 1.5s infinite;"></div>
          <style>
            @keyframes ping {
              0% { transform: scale(1); opacity: 1; }
              100% { transform: scale(3); opacity: 0; }
            }
          </style>
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
  pedido?: Pedido; // Opcional en modo picker
  userPos?: { lat: number, lng: number } | null;
  driverVehicleType?: string;
  isPicker?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  initialCenter?: [number, number];
}

const isValidCoord = (lat: any, lng: any): boolean => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    !isNaN(nLat) && 
    !isNaN(nLng) && 
    Math.abs(nLat) <= 90 && 
    Math.abs(nLng) <= 180 &&
    !(nLat === 0 && nLng === 0)
  );
};

const TrackingMap = memo(({ pedido, userPos, driverVehicleType, isPicker, onLocationChange, initialCenter }: TrackingMapProps) => {
  const driverPos = pedido?.ubicacion_actual && isValidCoord(pedido.ubicacion_actual.lat, pedido.ubicacion_actual.lng)
    ? [Number(pedido.ubicacion_actual.lat), Number(pedido.ubicacion_actual.lng)] as [number, number] : null;
  const destPos = (pedido?.ubicacion_entrega && isValidCoord(pedido.ubicacion_entrega.lat, pedido.ubicacion_entrega.lng))
    ? [Number(pedido.ubicacion_entrega.lat), Number(pedido.ubicacion_entrega.lng)] as [number, number] 
    : (isPicker && initialCenter ? initialCenter : null);
  const clientPos = userPos && isValidCoord(userPos.lat, userPos.lng)
    ? [Number(userPos.lat), Number(userPos.lng)] as [number, number] : null;
  
  const defaultCenter = initialCenter || driverPos || clientPos || destPos || [9.8159, -70.9324]; // Mene Grande Default

  const markerEvents = {
    dragend(e: any) {
      const marker = e.target;
      const position = marker.getLatLng();
      if (onLocationChange) {
        onLocationChange(position.lat, position.lng);
      }
    },
  };

  return (
    <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-inner border border-gray-100">
      <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {clientPos && !isPicker && (
          <Marker position={clientPos} icon={userIcon}>
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}

        {driverPos && (
          <>
            <Marker position={driverPos} icon={getDriverIcon(driverVehicleType)}>
              <Popup>
                <div className="font-bold">Repartidor: {pedido?.motorizado_nombre}</div>
                <div className="text-xs text-gray-500">En camino a tu ubicación</div>
              </Popup>
            </Marker>
            <ChangeView center={driverPos} />
          </>
        )}

        {destPos && (
          <>
            <Marker 
              position={destPos} 
              icon={destinationIcon}
              draggable={isPicker}
              eventHandlers={isPicker ? markerEvents : undefined}
            >
              <Popup>
                <div className="font-bold">{isPicker ? 'Ajusta tu ubicación' : 'Destino de Entrega'}</div>
                {!isPicker && <div className="text-xs text-gray-500">{pedido?.ubicacion_entrega?.direccion}</div>}
                {isPicker && <div className="text-xs text-gray-400">Puedes arrastrar este marcador para mayor precisión</div>}
              </Popup>
            </Marker>
            {isPicker && <ChangeView center={destPos} />}
          </>
        )}
      </MapContainer>
    </div>
  );
});

TrackingMap.displayName = 'TrackingMap';

export default TrackingMap;

