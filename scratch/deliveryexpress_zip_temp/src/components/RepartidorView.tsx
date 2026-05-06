import React, { useState, useEffect } from 'react';
import { 
  listenPedidosDisponibles, 
  listenMisPedidosMotorizado, 
  tomarPedido, 
  actualizarEstadoPedido,
  aceptarPedido,
  actualizarUbicacionRepartidor
} from '../services/pedidoService';
import { Pedido, Usuario } from '../types';
import { MapPin, Package, Truck, CheckCircle2, AlertCircle, Loader2, Navigation, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface RepartidorViewProps {
  userData: Usuario;
}

export default function RepartidorView({ userData }: RepartidorViewProps) {
  const [disponibles, setDisponibles] = useState<Pedido[]>([]);
  const [misPedidos, setMisPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // GPS Tracking Logic
  useEffect(() => {
    // Track location if there's an active delivery (assigned and accepted, or on the way)
    const activePedido = misPedidos.find(p => 
      (p.estado === 'en_camino') || 
      (p.estado === 'asignado' && p.aceptado_por_motorizado)
    );
    let watchId: number | null = null;
    let lastUpdate = 0;
    const THROTTLE_MS = 5000; // Update every 5 seconds

    if (activePedido && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastUpdate > THROTTLE_MS) {
            const { latitude, longitude } = position.coords;
            actualizarUbicacionRepartidor(activePedido.id, latitude, longitude);
            lastUpdate = now;
          }
        },
        (error) => {
          console.error('Error de GPS:', error);
          toast.error('Error al obtener ubicación GPS');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [misPedidos]);

  useEffect(() => {
    const unsubDisponibles = listenPedidosDisponibles(setDisponibles);
    const unsubMisPedidos = listenMisPedidosMotorizado(userData.uid, setMisPedidos);
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
    setLoading(pedidoId);
    try {
      await actualizarEstadoPedido(pedidoId, nuevoEstado);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } catch (err: any) {
      setError('Error al actualizar el estado.');
      toast.error('Error al actualizar el estado');
    } finally {
      setLoading(null);
    }
  };

  const handleAceptarPedido = async (pedidoId: string) => {
    setLoading(pedidoId);
    try {
      await aceptarPedido(pedidoId);
      toast.success('Pedido aceptado');
    } catch (err: any) {
      setError('Error al aceptar el pedido.');
      toast.error('Error al aceptar el pedido');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Mis Pedidos Asignados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Truck className="text-orange-600" size={20} />
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
                  <Truck className="text-gray-200" size={32} />
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
                        {loading === pedido.id ? <Loader2 className="animate-spin" /> : <><Truck size={20} /> Iniciar Entrega</>}
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

      {/* Pool de Pedidos Disponibles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            Pedidos Disponibles
          </h2>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Actualizado recién</span>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100"
          >
            <AlertCircle size={20} /> {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {disponibles.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100"
              >
                <p className="text-gray-400 font-bold">No hay pedidos nuevos en el área</p>
              </motion.div>
            ) : (
              disponibles.map((pedido, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={pedido.id} 
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {pedido.tipo}
                      </span>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={12} />
                        {pedido.timestamp?.toDate ? format(pedido.timestamp.toDate(), "HH:mm", { locale: es }) : 'Ahora'}
                      </span>
                    </div>
                    <h4 className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{pedido.descripcion}</h4>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-blue-400" /> 
                        {pedido.cliente_nombre || 'Cliente'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-blue-400" /> 
                        {pedido.ubicacion_entrega?.direccion || 'Destino'}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTomarPedido(pedido.id)}
                    disabled={loading === pedido.id}
                    className="bg-gray-900 hover:bg-blue-600 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading === pedido.id ? <Loader2 className="animate-spin" /> : 'Aceptar'}
                  </motion.button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
