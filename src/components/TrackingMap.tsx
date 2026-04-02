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
  
  const bikeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>`;
  
  const carSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;

  return L.divIcon({
    html: `<div class="w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white">
            ${isCar ? carSvg : bikeSvg}
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

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
  driverVehicleType?: string;
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

const TrackingMap = memo(({ pedido, userPos, driverVehicleType }: TrackingMapProps) => {
  const driverPos = pedido.ubicacion_actual && isValidCoord(pedido.ubicacion_actual.lat, pedido.ubicacion_actual.lng)
    ? [Number(pedido.ubicacion_actual.lat), Number(pedido.ubicacion_actual.lng)] as [number, number] : null;
  const destPos = pedido.ubicacion_entrega && isValidCoord(pedido.ubicacion_entrega.lat, pedido.ubicacion_entrega.lng)
    ? [Number(pedido.ubicacion_entrega.lat), Number(pedido.ubicacion_entrega.lng)] as [number, number] : null;
  const clientPos = userPos && isValidCoord(userPos.lat, userPos.lng)
    ? [Number(userPos.lat), Number(userPos.lng)] as [number, number] : null;
  
  const defaultCenter = driverPos || clientPos || destPos;

  // Si no hay ninguna coordenada válida, mostrar alerta de GPS
  if (!defaultCenter) {
    return (
      <div className="h-[400px] w-full rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-lg font-black text-gray-900">Activa tu GPS</h4>
          <p className="text-sm text-gray-500 font-medium max-w-xs">Para rastrear tu pedido en tiempo real, activa la ubicación en tu dispositivo y permite el acceso a esta página.</p>
        </div>
        <button 
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              () => window.location.reload(),
              () => alert('Por favor activa el GPS en los ajustes de tu dispositivo y recarga la página.'),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-600 transition-colors"
        >
          Activar Ubicación
        </button>
      </div>
    );
  }

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
            <Marker position={driverPos} icon={getDriverIcon(driverVehicleType)}>
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

