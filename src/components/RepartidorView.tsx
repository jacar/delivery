import React, { useState, useEffect, useRef } from 'react';
import { 
  listenPedidosDisponibles, 
  listenMisPedidosMotorizado, 
  tomarPedido, 
  actualizarEstadoPedido,
  aceptarPedido,
  actualizarUbicacionRepartidor,
  actualizarDisponibilidadMotorizado
} from '../services/pedidoService';
import { Pedido, Usuario } from '../types';
import { MapPin, Package, Bike, CheckCircle2, AlertCircle, Loader2, Navigation, Clock, User, Power, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { playNotificationSound } from '../services/soundService';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import 'leaflet/dist/leaflet.css';
const DefaultIcon = L.divIcon({
  html: `<div style="width: 24px; height: 24px; background-color: #f97316; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DriverIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="position: relative; width: 56px; height: 56px;">
      <div style="position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; background-color: #f97316; border-radius: 50%; opacity: 0.3; animation: pulse 2s infinite;"></div>
      <div style="position: relative; width: 56px; height: 56px; background-color: #111827; border-radius: 50%; border: 4px solid #f97316; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #f97316;">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="7" cy="18" r="2"/>
          <circle cx="18" cy="18" r="2"/>
          <path d="M12 18V9c0-1-1-2-2-2H8l-5 5v4h3"/>
          <rect x="14" y="6" width="6" height="6" rx="1" fill="currentColor" fill-opacity="0.2"/>
          <path d="M16 18V13l-4-4"/>
        </svg>
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
  iconSize: [56, 56],
  iconAnchor: [28, 28],
});

const isValidCoord = (lat: any, lng: any): boolean => {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return !isNaN(nLat) && !isNaN(nLng) && Math.abs(nLat) <= 90 && Math.abs(nLng) <= 180 && !(nLat === 0 && nLng === 0);
};

function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (coords && isValidCoord(coords[0], coords[1])) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
}

interface RepartidorViewProps {
  userData: Usuario;
  activeTab?: string;
}

export default function RepartidorView({ userData, activeTab: propActiveTab }: RepartidorViewProps) {
  const [disponibles, setDisponibles] = useState<Pedido[]>([]);
  const [misPedidos, setMisPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const prevIdsRef = useRef<string[]>([]);
  const prevMisPedidosIdsRef = useRef<string[]>([]);
  const [activeTab, setActiveTab] = useState<'misPedidos' | 'disponibles'>('misPedidos');
  const [isOnline, setIsOnline] = useState(userData.disponible || false);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (propActiveTab) {
      if (propActiveTab === 'home') setActiveTab('misPedidos');
      else if (propActiveTab === 'pedidos') setActiveTab('disponibles');
    }
  }, [propActiveTab]);

  // GPS Tracking Logic
  useEffect(() => {
    // Track location if there's an active delivery (assigned and accepted, or on the way)
    const activePedido = misPedidos.find(p => 
      (p.estado === 'en_camino') || 
      (p.estado === 'asignado' && p.aceptado_por_motorizado)
    );

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // Metros
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let watchId: number | null = null;
    let lastUpdate = 0;
    let lastUpdateServer = 0;
    const DISTANCE_THRESHOLD = 100; // 100 metros

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (!isValidCoord(latitude, longitude)) return;

          const now = Date.now();
          // Solo actualizamos el estado local si ha pasado tiempo o hay cambio real
          if (now - lastUpdate > 5000) { // Throttle UI updates to 5s
            setCurrentCoords([latitude, longitude]);
            lastUpdate = now;
          }
          
          if (activePedido) {
            // Actualización al servidor cada 2 minutos para ahorrar batería y datos
            const SERVER_UPDATE_INTERVAL = 120000; 
            if (now - (lastUpdateServer || 0) > SERVER_UPDATE_INTERVAL) {
              actualizarUbicacionRepartidor(activePedido.id, latitude, longitude);
              lastUpdateServer = now;
            }
          }
        },
        (error) => console.error('Error de GPS:', error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [misPedidos]);

  useEffect(() => {
    const unsubDisponibles = listenPedidosDisponibles((data) => {
      const currentIds = data.map(p => p.id);
      const newOrders = data.filter(p => !prevIdsRef.current.includes(p.id));
      
      if (prevIdsRef.current.length > 0 && newOrders.length > 0) {
        playNotificationSound();
        newOrders.forEach(p => toast.info(`Nuevo pedido disponible: ${p.descripcion}`));
      }
      
      prevIdsRef.current = currentIds;
      setDisponibles(data);
    });

    const unsubMisPedidos = listenMisPedidosMotorizado(userData.uid, (data) => {
      const currentIds = data.map(p => p.id);
      const newAssigned = data.filter(p => !prevMisPedidosIdsRef.current.includes(p.id));

      if (prevMisPedidosIdsRef.current.length > 0 && newAssigned.length > 0) {
        playNotificationSound();
        newAssigned.forEach(p => toast.success(`¡Pedido asignado!: ${p.descripcion}`));
      }

      prevMisPedidosIdsRef.current = currentIds;
      setMisPedidos(data);
    });

    return () => {
      unsubDisponibles();
      unsubMisPedidos();
    };
  }, [userData.uid]);

  const handleTomarPedido = async (pedidoId: string) => {
    setLoading(pedidoId);
    setError('');
    try {
      await tomarPedido(pedidoId, userData.uid, userData.nombre, userData.telefono || '');
      toast.success('Pedido tomado con éxito');
    } catch (err: any) {
      setError('No se pudo tomar el pedido. Quizás ya fue asignado.');
      toast.error('No se pudo tomar el pedido');
    } finally {
      setLoading(null);
    }
  };

  const handleActualizarEstado = async (pedidoId: string, nuevoEstado: any) => {
    console.log(`[DEBUG] Iniciando actualización atómica para pedido ${pedidoId} a ${nuevoEstado}`);
    setLoading(pedidoId);
    
    // Watchdog: si pasan 10 segundos sin respuesta, liberar el botón
    const watchdog = setTimeout(() => {
      setLoading(prev => prev === pedidoId ? null : prev);
      setError('La operación está tardando más de lo habitual. Verifica tu conexión.');
    }, 10000);

    try {
      await actualizarEstadoPedido(pedidoId, nuevoEstado, userData.uid);
      clearTimeout(watchdog);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } catch (err: any) {
      clearTimeout(watchdog);
      console.error("[DEBUG] Error en transacción:", err);
      const errorMsg = err.message || 'Error desconocido al actualizar el estado.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(null);
    }
  };

  const handleAceptarPedido = async (pedidoId: string) => {
    setLoading(pedidoId);
    try {
      await aceptarPedido(pedidoId, userData.uid);
      toast.success('Pedido aceptado');
    } catch (err: any) {
      setError('Error al aceptar el pedido.');
      toast.error('Error al aceptar el pedido');
    } finally {
      setLoading(null);
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !isOnline;
    try {
      await actualizarDisponibilidadMotorizado(userData.uid, newStatus);
      setIsOnline(newStatus);
      toast.success(newStatus ? 'Ahora estás en línea' : 'Ahora estás fuera de línea');
    } catch (error) {
      toast.error('Error al cambiar disponibilidad');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header with Availability Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <User size={32} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 truncate">
              {userData.nombre}
            </h2>
            {(() => {
              const estaOcupado = misPedidos.some(p => p.estado === 'asignado' || p.estado === 'en_camino');
              return (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isOnline ? (estaOcupado ? 'bg-orange-500' : 'bg-green-500 animate-pulse') : 'bg-gray-300'}`} />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
                    {isOnline 
                      ? (estaOcupado ? 'Ocupado con un pedido' : 'Disponible para pedidos') 
                      : 'No disponible'}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
            isOnline 
              ? 'bg-green-50 text-green-600 border border-green-100' 
              : 'bg-gray-50 text-gray-400 border border-gray-100'
          }`}
        >
          <Power size={18} />
          {isOnline ? 'En Línea' : 'Fuera de Línea'}
        </button>
      </div>

      {/* Mis Pedidos y Mapa */}
      {activeTab === 'misPedidos' && (
        <div className="space-y-12">
          {/* Mis Pedidos Asignados */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tight">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Bike className="text-orange-600" size={20} />
                </div>
                Mis Entregas
              </h2>
              <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {misPedidos.filter(p => p.estado !== 'entregado').length} Activas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {misPedidos.filter(p => p.estado !== 'entregado').length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bike className="text-gray-200" size={32} />
                    </div>
                    <p className="text-gray-400 font-bold">No tienes entregas pendientes</p>
                  </motion.div>
                ) : (
                  misPedidos.filter(p => p.estado !== 'entregado').map((pedido) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={pedido.id} 
                      className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-orange-50 space-y-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 opacity-50" />
                      
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {pedido.estado}
                          </span>
                          <h3 className="text-xl font-black text-gray-900 mt-3 capitalize">{pedido.tipo}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <User size={14} className="text-orange-400" />
                            <p className="text-gray-500 font-bold text-sm">Cliente: {pedido.cliente_nombre || 'Usuario'} {pedido.cliente_telefono && `(${pedido.cliente_telefono})`}</p>
                          </div>
                          <p className="text-gray-500 font-medium mt-2">{pedido.descripcion}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pedido ID</p>
                          <p className="text-xs font-bold text-gray-400">#{pedido.id.substring(0, 8)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-gray-50 relative z-10">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            <MapPin size={12} /> Recoger en
                          </div>
                          <p className="text-sm font-bold text-gray-700">{pedido.ubicacion_recogida?.direccion || 'No especificada'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-orange-300 uppercase tracking-widest">
                            <Navigation size={12} /> Entregar en
                          </div>
                          <p className="text-sm font-bold text-gray-700">{pedido.ubicacion_entrega?.direccion || 'No especificada'}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 relative z-10">
                        {pedido.estado === 'asignado' && !pedido.aceptado_por_motorizado && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAceptarPedido(pedido.id)}
                            disabled={loading === pedido.id}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
                          >
                            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Aceptar Pedido</>}
                          </motion.button>
                        )}
                        {pedido.estado === 'asignado' && pedido.aceptado_por_motorizado && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActualizarEstado(pedido.id, 'en_camino')}
                            disabled={loading === pedido.id}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-200"
                          >
                            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><Bike size={20} /> Iniciar Entrega</>}
                          </motion.button>
                        )}
                        {pedido.estado === 'en_camino' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActualizarEstado(pedido.id, 'entregado')}
                            disabled={loading === pedido.id}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-200"
                          >
                            {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Confirmar Entrega</>}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mapa Section */}
          <AnimatePresence>
            {misPedidos.some(p => p.estado !== 'entregado') && (
              <motion.div
                key="map-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tight">
                    <MapIcon className="text-orange-500" /> Mapa de Ruta
                  </h3>
                </div>
                <div className="h-[400px] w-full bg-gray-100 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner relative z-10">
                  {currentCoords ? (
                    <MapContainer center={currentCoords} zoom={15} scrollWheelZoom={false}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={currentCoords} icon={DriverIcon}>
                        <Popup>Tu ubicación actual</Popup>
                      </Marker>
                      
                      {misPedidos.filter(p => p.estado !== 'entregado').map(pedido => (
                        <React.Fragment key={`map-markers-${pedido.id}`}>
                          {pedido.ubicacion_recogida && isValidCoord(pedido.ubicacion_recogida.lat, pedido.ubicacion_recogida.lng) && (
                            <Marker 
                              position={[Number(pedido.ubicacion_recogida.lat), Number(pedido.ubicacion_recogida.lng)]}
                              icon={L.divIcon({
                                html: `<div style="width: 32px; height: 32px; background-color: #f97316; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 18V9c0-1-1-2-2-2H8l-5 5v4h3"/><path d="M16 18V13l-4-4"/></svg>
                                       </div>`,
                                className: '',
                                iconSize: [32, 32],
                                iconAnchor: [16, 16]
                              })}
                            >
                              <Popup>Punto de Recogida: {pedido.descripcion}</Popup>
                            </Marker>
                          )}
                          {pedido.ubicacion_entrega && isValidCoord(pedido.ubicacion_entrega.lat, pedido.ubicacion_entrega.lng) && (
                            <Marker 
                              position={[Number(pedido.ubicacion_entrega.lat), Number(pedido.ubicacion_entrega.lng)]}
                              icon={L.divIcon({
                                html: `<div style="width: 32px; height: 32px; background-color: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white;">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M12 18V9c0-1-1-2-2-2H8l-5 5v4h3"/><path d="M16 18V13l-4-4"/></svg>
                                       </div>`,
                                className: '',
                                iconSize: [32, 32],
                                iconAnchor: [16, 16]
                              })}
                            >
                              <Popup>Punto de Entrega: {pedido.descripcion}</Popup>
                            </Marker>
                          )}
                          {pedido.ubicacion_recogida && pedido.ubicacion_entrega && 
                           isValidCoord(pedido.ubicacion_recogida.lat, pedido.ubicacion_recogida.lng) && 
                           isValidCoord(pedido.ubicacion_entrega.lat, pedido.ubicacion_entrega.lng) && (
                            <Polyline 
                              positions={[
                                [Number(pedido.ubicacion_recogida.lat), Number(pedido.ubicacion_recogida.lng)],
                                [Number(pedido.ubicacion_entrega.lat), Number(pedido.ubicacion_entrega.lng)]
                              ]} 
                              color="#f97316"
                              dashArray="10, 10"
                            />
                          )}
                        </React.Fragment>
                      ))}
                      <MapRecenter coords={currentCoords} />
                    </MapContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 font-bold bg-white p-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="text-gray-300" size={32} />
                      </div>
                      <p className="text-center">Por favor, asegúrate de tener el GPS activado para ver el mapa de la ruta.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Pedidos Disponibles Section */}
      {activeTab === 'disponibles' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tight">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="text-blue-600" size={20} />
              </div>
              Pedidos Disponibles
            </h2>
            <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {disponibles.length} Nuevos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {disponibles.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-200" size={32} />
                  </div>
                  <p className="text-gray-400 font-bold">No hay pedidos disponibles por ahora</p>
                </motion.div>
              ) : (
                disponibles.map((pedido) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={`disp-${pedido.id}`} 
                    className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-blue-50 space-y-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Nuevo Pedido
                        </span>
                        <h3 className="text-xl font-black text-gray-900 mt-3 capitalize">{pedido.tipo}</h3>
                        <p className="text-gray-500 font-medium mt-2">{pedido.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pedido ID</p>
                        <p className="text-xs font-bold text-gray-400">#{pedido.id.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-gray-50 relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          <MapPin size={12} /> Recoger en
                        </div>
                        <p className="text-sm font-bold text-gray-700">{pedido.ubicacion_recogida?.direccion || 'No especificada'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-orange-300 uppercase tracking-widest">
                          <Navigation size={12} /> Entregar en
                        </div>
                        <p className="text-sm font-bold text-gray-700">{pedido.ubicacion_entrega?.direccion || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTomarPedido(pedido.id)}
                        disabled={loading === pedido.id}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
                      >
                        {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> Tomar Pedido</>}
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}



    </div>
  );
}
