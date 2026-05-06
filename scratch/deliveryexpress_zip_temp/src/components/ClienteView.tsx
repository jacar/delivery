import React, { useState, useEffect } from 'react';
import { createPedido, listenMisPedidosCliente } from '../services/pedidoService';
import { Usuario, Pedido, PedidoTipo } from '../types';
import { MapPin, Package, ShoppingCart, Clock, CheckCircle2, Truck, AlertCircle, Plus, History, User, Loader2, Navigation, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import TrackingMap from './TrackingMap';

interface ClienteViewProps {
  userData: Usuario;
}

export default function ClienteView({ userData }: ClienteViewProps) {
  const [tipo, setTipo] = useState<PedidoTipo>('compra');
  const [descripcion, setDescripcion] = useState('');
  const [recogida, setRecogida] = useState('');
  const [entrega, setEntrega] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [trackingPedido, setTrackingPedido] = useState<Pedido | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const unsubscribe = listenMisPedidosCliente(userData.uid, setPedidos);
    
    // Get current location for better defaults
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err)
      );
    }

    return () => unsubscribe();
  }, [userData.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use current coords as fallback for mock if real ones aren't picked by a map (which we don't have yet)
      const baseLat = currentCoords?.lat || 10.4806;
      const baseLng = currentCoords?.lng || -66.9036;

      const mockRecogida = { lat: baseLat, lng: baseLng, direccion: recogida };
      const mockEntrega = { lat: baseLat + 0.01, lng: baseLng + 0.01, direccion: entrega };
      
      await createPedido(userData.uid, userData.nombre, userData.telefono || '', tipo, descripcion, mockRecogida, mockEntrega);
      toast.success('¡Pedido creado con éxito!');
      setDescripcion('');
      setRecogida('');
      setEntrega('');
      setShowForm(false);
    } catch (err: any) {
      setError('Error al crear el pedido. Intenta de nuevo.');
      toast.error('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'disponible': return <Clock className="text-gray-400" />;
      case 'asignado': return <CheckCircle2 className="text-blue-500" />;
      case 'en_camino': return <Truck className="text-orange-500" />;
      case 'entregado': return <CheckCircle2 className="text-green-500" />;
      default: return <AlertCircle />;
    }
  };

  const stats = {
    activos: pedidos.filter(p => p.estado !== 'entregado').length,
    completados: pedidos.filter(p => p.estado === 'entregado').length,
    total: pedidos.length
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header & Stats Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight"
            >
              Hola, <span className="text-orange-500">{userData.nombre.split(' ')[0]}</span> 👋
            </motion.h2>
            <p className="text-gray-500 font-medium text-lg">¿Qué enviamos hoy a tu destino?</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 30px -10px rgba(249, 115, 22, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-orange-200 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
          >
            {showForm ? <Clock size={20} /> : <Plus size={20} />}
            {showForm ? 'Ver Mis Pedidos' : 'Nuevo Envío Express'}
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Pedidos Activos', value: stats.activos, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Entregados', value: stats.completados, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
            { label: 'Total Histórico', value: stats.total, icon: History, color: 'text-blue-500', bg: 'bg-blue-50' }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-3xl font-black text-gray-900">{stat.value}</span>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Promo Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden bg-gray-900 rounded-[2.5rem] p-8 lg:p-12 text-white"
        >
          <div className="relative z-10 max-w-lg space-y-4">
            <span className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Oferta Especial</span>
            <h3 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">Envía lo que sea, <br/>donde sea, hoy.</h3>
            <p className="text-gray-400 font-medium">Usa el código <span className="text-white font-black">EXPRESS2026</span> para un 10% de descuento en tu próximo envío.</p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 right-0 p-8 opacity-20 lg:opacity-40">
            <Truck size={180} className="text-white rotate-[-15deg]" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-8 border border-gray-50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Package className="text-orange-500" size={20} />
              </div>
              Detalles del Envío
            </h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex gap-4 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setTipo('compra')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tipo === 'compra' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ShoppingCart size={18} /> Compra
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('recolección')}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tipo === 'recolección' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Package size={18} /> Recolección
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                <textarea
                  placeholder="Ej: Comprar 2 leches y pan en el súper..."
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 outline-none transition-all min-h-[120px] text-gray-700 font-medium"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Punto de Recogida</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-orange-400 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="¿Dónde lo buscamos?"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 outline-none transition-all text-gray-700 font-medium"
                      value={recogida}
                      onChange={(e) => setRecogida(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Punto de Entrega</label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400 transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="¿A dónde lo llevamos?"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/20 outline-none transition-all text-gray-700 font-medium"
                      value={entrega}
                      onChange={(e) => setEntrega(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-orange-200 disabled:opacity-50 text-lg tracking-tight"
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </motion.button>
              {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <History className="text-gray-300" size={20} />
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest text-xs">Historial de Pedidos</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {pedidos.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Package className="text-gray-200" size={48} />
                  </motion.div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">¿Listo para tu primer envío?</h4>
                  <p className="text-gray-400 font-medium max-w-xs mx-auto mb-8">Realiza tu primer pedido y experimenta la rapidez de DeliveryExpress.</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)}
                    className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200"
                  >
                    Comenzar Ahora
                  </motion.button>
                </div>
              ) : (
                pedidos.map((pedido, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={pedido.id} 
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden"
                  >
                    {/* Progress Bar for active orders */}
                    {pedido.estado !== 'entregado' && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gray-50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: pedido.estado === 'disponible' ? '25%' : 
                                   pedido.estado === 'asignado' ? '50%' : '75%' 
                          }}
                          className="h-full bg-orange-500"
                        />
                      </div>
                    )}

                    <div className="flex items-start gap-6 flex-1">
                      <div className={`p-5 rounded-[1.5rem] transition-all duration-500 group-hover:rotate-6 ${
                        pedido.estado === 'entregado' ? 'bg-green-50 text-green-600' : 
                        pedido.estado === 'en_camino' ? 'bg-orange-50 text-orange-600' : 
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {getStatusIcon(pedido.estado)}
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="font-black text-gray-900 capitalize text-xl tracking-tight">{pedido.tipo}</h4>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest">#{pedido.id.substring(0, 6)}</span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              pedido.estado === 'disponible' ? 'bg-gray-100 text-gray-500' :
                              pedido.estado === 'asignado' ? 'bg-blue-100 text-blue-600' :
                              pedido.estado === 'en_camino' ? 'bg-orange-100 text-orange-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {pedido.estado.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-md">{pedido.descripcion}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <Clock size={14} className="text-gray-300" />
                            {pedido.timestamp?.toDate ? format(pedido.timestamp.toDate(), "d MMM, HH:mm", { locale: es }) : 'Recién'}
                          </div>
                          
                          {pedido.motorizado_nombre && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                              <User size={14} />
                              {pedido.motorizado_nombre}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4">
                      <div className="flex flex-col items-end gap-1 hidden lg:block">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Destino</p>
                        <p className="text-sm font-bold text-gray-700 truncate max-w-[150px]">{pedido.ubicacion_entrega?.direccion}</p>
                      </div>

                      {pedido.estado === 'en_camino' ? (
                        <motion.button
                          whileHover={{ scale: 1.05, x: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTrackingPedido(pedido)}
                          className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-gray-200 transition-all"
                        >
                          <Navigation size={16} className="text-orange-500" /> Rastrear en Vivo
                        </motion.button>
                      ) : pedido.estado === 'entregado' ? (
                        <div className="flex items-center gap-2 text-green-500 bg-green-50 px-6 py-3 rounded-2xl">
                          <CheckCircle2 size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Completado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-6 py-3 rounded-2xl">
                          <Clock size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pendiente</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingPedido && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrackingPedido(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ruta de Entrega</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Repartidor: {trackingPedido.motorizado_nombre} {trackingPedido.motorizado_telefono && `• ${trackingPedido.motorizado_telefono}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setTrackingPedido(null)}
                  className="p-3 hover:bg-white rounded-2xl transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <TrackingMap pedido={trackingPedido} userPos={currentCoords} />
                
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Clock className="text-orange-500" size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado Actual</p>
                      <p className="text-sm font-bold text-gray-900">En camino a tu ubicación</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destino</p>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                      {trackingPedido.ubicacion_entrega?.direccion}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
