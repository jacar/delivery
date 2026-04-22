import React, { useState, useEffect } from 'react';
import { createPedido, listenMisPedidosCliente, getUsuario, getTarifasMotoTaxi, getTarifasGenerales } from '../services/pedidoService';
import { listenAliados } from '../services/aliadoService';
import { Usuario, Pedido, PedidoTipo, TarifaMotoTaxi, Aliado, Producto } from '../types';
import { MapPin, Package, ShoppingCart, Clock, CheckCircle2, Bike, AlertCircle, Plus, History, User, Loader2, Navigation, X, Tag, Store, Minus, ChevronRight, Info, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import TrackingMap from './TrackingMap';
import AddressInputWithMap from './AddressInputWithMap';

interface ClienteViewProps {
  userData: Usuario;
  activeTab?: string;
}

export default function ClienteView({ userData, activeTab: propActiveTab }: ClienteViewProps) {
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
  const [recogidaCoords, setRecogidaCoords] = useState<{lat: number, lng: number} | null>(null);
  const [entregaCoords, setEntregaCoords] = useState<{lat: number, lng: number} | null>(null);
  const [driverDetails, setDriverDetails] = useState<Usuario | null>(null);
  // Moto Taxi
  const [tarifas, setTarifas] = useState<TarifaMotoTaxi[]>([]);
  const [tarifaSeleccionada, setTarifaSeleccionada] = useState<TarifaMotoTaxi | null>(null);
  const [tarifasGenerales, setTarifasGenerales] = useState<{compra?: any, recoleccion?: any}>({});

  // Aliados & Shopping
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [selectedAliado, setSelectedAliado] = useState<Aliado | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [cart, setCart] = useState<{producto: Producto, cantidad: number}[]>([]);

  useEffect(() => {
    if (propActiveTab) {
      if (propActiveTab === 'home') setShowForm(false);
      else if (propActiveTab === 'pedidos') setShowForm(false);
    }
  }, [propActiveTab]);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      if (trackingPedido?.motorizado_id) {
        const driver = await getUsuario(trackingPedido.motorizado_id);
        setDriverDetails(driver);
      } else {
        setDriverDetails(null);
      }
    };
    fetchDriverDetails();
  }, [trackingPedido?.motorizado_id]);

  useEffect(() => {
    const unsubscribe = listenMisPedidosCliente(userData.uid, setPedidos);
    
    // Get current location for better defaults
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err)
      );
    }

    // Cargar tarifas de moto taxi
    getTarifasMotoTaxi().then(data => setTarifas(data.filter(t => t.activo)));

    // Cargar aliados
    const unsubscribeAliados = listenAliados((data) => {
      setAliados(data);
    });

    // Cargar tarifas generales
    getTarifasGenerales().then(setTarifasGenerales);

    return () => {
      unsubscribe();
      unsubscribeAliados();
    }
  }, [userData.uid]);

  const handleAddToCart = (producto: Producto) => {
    setCart(prev => {
      const existing = prev.find(item => item.producto.id === producto.id);
      if (existing) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
    toast.success(`${producto.nombre} añadido al carrito`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.producto.id === productId);
      if (item && item.cantidad > 1) {
        return prev.map(i => i.producto.id === productId ? { ...i, cantidad: i.cantidad - 1 } : i);
      }
      return prev.filter(i => i.producto.id !== productId);
    });
  };

  const getCartItemQuantity = (productId: string) => {
    return cart.find(i => i.producto.id === productId)?.cantidad || 0;
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);

  const handleConfirmCartOrder = async () => {
    if (cart.length === 0 || !selectedAliado) return;
    setLoading(true);
    try {
      const desc = `PEDIDO ${selectedAliado.nombre.toUpperCase()}: ${cart.map(i => `${i.cantidad}x ${i.producto.nombre}`).join(', ')}`;
      
      const rawRecogidaDir = selectedAliado.direccion || `Local de ${selectedAliado.nombre}`;
      const ubicacionRecogida = {
        lat: selectedAliado.lat || 10.4806,
        lng: selectedAliado.lng || -66.9036,
        direccion: rawRecogidaDir
      };

      const finalEntregaCoords = entregaCoords || currentCoords || { lat: 10.4856, lng: -66.8986 };
      const ubicacionEntrega = {
        lat: finalEntregaCoords.lat,
        lng: finalEntregaCoords.lng,
        direccion: entrega || userData.direccion || 'Dirección de entrega no especificada'
      };

      await createPedido(userData.uid, userData.nombre, userData.telefono || '', 'compra', desc, ubicacionRecogida, ubicacionEntrega);
      toast.success('¡Pedido de tienda realizado con éxito!');
      setIsMenuModalOpen(false);
      setCart([]);
      setSelectedAliado(null);
    } catch (err: any) {
      toast.error('Error al procesar el pedido de tienda');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const cleanRecogida = recogida.trim();
      const cleanEntrega = entrega.trim();

      if (!cleanRecogida || !cleanEntrega) {
        throw new Error('Los campos de dirección son obligatorios');
      }

      // Para moto taxi la descripción viene de la tarifa
      let cleanDesc = descripcion.trim();
      if (tipo === 'mototaxi') {
        if (!tarifaSeleccionada) throw new Error('Selecciona una tarifa');
        cleanDesc = `Moto Taxi - ${tarifaSeleccionada.nombre} - $ ${Number(tarifaSeleccionada.precio).toFixed(2)}`;
      } else {
        if (!cleanDesc) throw new Error('La descripción es obligatoria');
        const tg = tipo === 'compra' ? tarifasGenerales.compra : tarifasGenerales.recoleccion;
        if (tg) {
          cleanDesc = `${tipo.toUpperCase()} - ${cleanDesc} - Tarifa Base: $ ${Number(tg.precio).toFixed(2)}`;
        }
      }

      // Validar que tengamos coordenadas (al menos las por defecto si no se buscaron)
      const finalRecogidaCoords = recogidaCoords || currentCoords || { lat: 10.4806, lng: -66.9036 };
      const finalEntregaCoords = entregaCoords || (currentCoords ? { lat: currentCoords.lat + 0.005, lng: currentCoords.lng + 0.005 } : { lat: 10.4906, lng: -66.8936 });

      const ubicacionRecogida = { 
        lat: finalRecogidaCoords.lat, 
        lng: finalRecogidaCoords.lng, 
        direccion: cleanRecogida 
      };
      
      const ubicacionEntrega = { 
        lat: finalEntregaCoords.lat, 
        lng: finalEntregaCoords.lng, 
        direccion: cleanEntrega 
      };
      
      await createPedido(userData.uid, userData.nombre, userData.telefono || '', tipo, cleanDesc, ubicacionRecogida, ubicacionEntrega);
      toast.success('¡Pedido creado con éxito!');
      setDescripcion('');
      setRecogida('');
      setEntrega('');
      setTarifaSeleccionada(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Error al crear el pedido. Intenta de nuevo.');
      toast.error('Error al crear el pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'disponible': return <Clock className="text-gray-400" />;
      case 'asignado': return <CheckCircle2 className="text-blue-500" />;
      case 'en_camino': return <Bike className="text-orange-500" />;
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
          
          <div className="flex gap-4 flex-wrap">
            {showForm ? (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-5 rounded-[2rem] shadow-xl transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
              >
                <History size={20} />
                Regresar al Historial
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 30px -10px rgba(249, 115, 22, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTipo('compra');
                    setShowForm(true);
                    setTimeout(() => {
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                      });
                    }, 100);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-orange-200 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
                >
                  <Package size={20} />
                  Nuevo Envío
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 30px -10px rgba(139, 92, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTipo('mototaxi');
                    setShowForm(true);
                    setTimeout(() => {
                      window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                      });
                    }, 100);
                  }}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-violet-200 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs"
                >
                  <Bike size={20} />
                  Pedir Moto Taxi
                </motion.button>
              </>
            )}
          </div>

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
          className="relative overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all bg-gray-900"
        >
          <video 
            src={`${import.meta.env.BASE_URL}banners/hero-video.webm`} 
            className="w-full h-auto object-cover"
            style={{ 
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
            autoPlay 
            loop 
            muted 
            playsInline
          />
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
              {/* Selector de tipo */}
              <div className="flex gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setTipo('compra'); setTarifaSeleccionada(null); }}
                  className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tipo === 'compra' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <ShoppingCart size={18} /> Compra
                </button>
                <button
                  type="button"
                  onClick={() => { setTipo('recolección'); setTarifaSeleccionada(null); }}
                  className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tipo === 'recolección' ? 'bg-white shadow-md text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Package size={18} /> Recolección
                </button>
                <button
                  type="button"
                  onClick={() => { setTipo('mototaxi'); setDescripcion(''); }}
                  className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tipo === 'mototaxi' ? 'bg-white shadow-md text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Bike size={18} /> Moto Taxi
                </button>
              </div>

              {/* Campo descripción (solo para compra y recolección) */}
              {tipo !== 'mototaxi' && (
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
              )}

              {/* Tarifa Informativa para Compra/Recolección */}
              {tipo !== 'mototaxi' && (tarifasGenerales.compra || tarifasGenerales.recoleccion) && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Tarifa del servicio</p>
                      <p className="text-sm font-bold text-gray-700">
                        {tipo === 'compra' ? 'Base por Compra' : 'Base por Recolección'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-orange-600">
                    $ {Number(tipo === 'compra' ? tarifasGenerales.compra?.precio || 0 : tarifasGenerales.recoleccion?.precio || 0).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Selector de tarifas (solo mototaxi) */}
              {tipo === 'mototaxi' && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Selecciona una Tarifa</label>
                    {tarifas.length === 0 ? (
                      <div className="p-6 bg-violet-50 rounded-2xl text-center">
                        <Bike className="text-violet-300 mx-auto mb-2" size={28} />
                        <p className="text-sm font-bold text-violet-400">Aún no hay tarifas disponibles.</p>
                        <p className="text-xs text-violet-300 mt-1">El administrador debe configurarlas.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {tarifas.map(tarifa => (
                          <button
                            type="button"
                            key={tarifa.id}
                            onClick={() => setTarifaSeleccionada(tarifa)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              tarifaSeleccionada?.id === tarifa.id
                                ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                                : 'border-gray-100 bg-gray-50 hover:border-violet-200 hover:bg-violet-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Tag size={14} className={tarifaSeleccionada?.id === tarifa.id ? 'text-violet-500' : 'text-gray-400'} />
                                <span className={`text-sm font-black ${
                                  tarifaSeleccionada?.id === tarifa.id ? 'text-violet-700' : 'text-gray-700'
                                }`}>{tarifa.nombre}</span>
                              </div>
                              {tarifaSeleccionada?.id === tarifa.id && (
                                <CheckCircle2 size={16} className="text-violet-500" />
                              )}
                            </div>
                            {tarifa.descripcion && (
                              <p className="text-[11px] text-gray-400 font-medium ml-6 leading-tight">{tarifa.descripcion}</p>
                            )}
                            <p className={`text-xl font-black mt-2 ml-6 ${
                              tarifaSeleccionada?.id === tarifa.id ? 'text-violet-600' : 'text-gray-600'
                            }`}>
                              $ {Number(tarifa.precio).toFixed(2)}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Banner resumen tarifa seleccionada */}
                    {tarifaSeleccionada && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-4 bg-violet-600 rounded-2xl text-white shadow-lg shadow-violet-200"
                      >
                        <div className="flex items-center gap-3">
                          <Bike size={20} />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Tarifa seleccionada</p>
                            <p className="font-black text-sm">{tarifaSeleccionada.nombre}</p>
                          </div>
                        </div>
                        <span className="text-2xl font-black">$ {Number(tarifaSeleccionada.precio).toFixed(2)}</span>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AddressInputWithMap
                  label={tipo === 'mototaxi' ? '¿Dónde te recogemos?' : 'Punto de Recogida'}
                  placeholder={tipo === 'mototaxi' ? '¿En qué dirección estás?' : '¿Dónde lo buscamos?'}
                  value={recogida}
                  onChange={setRecogida}
                  onLocationResolved={setRecogidaCoords}
                  initialCoords={currentCoords}
                  icon={<MapPin className="text-gray-300" size={20} />}
                />
                <AddressInputWithMap
                  label={tipo === 'mototaxi' ? '¿A dónde vas?' : 'Punto de Entrega'}
                  placeholder={tipo === 'mototaxi' ? '¿Cuál es tu destino?' : '¿A dónde lo llevamos?'}
                  value={entrega}
                  onChange={setEntrega}
                  onLocationResolved={setEntregaCoords}
                  icon={<MapPin className="text-orange-400" size={20} />}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || (tipo === 'mototaxi' && !tarifaSeleccionada)}
                className={`w-full text-white font-black py-5 rounded-2xl transition-all shadow-2xl disabled:opacity-50 text-lg tracking-tight ${
                  tipo === 'mototaxi'
                    ? 'bg-gradient-to-r from-violet-600 to-violet-700 shadow-violet-200'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200'
                }`}
              >
                {loading ? 'Procesando...' : tipo === 'mototaxi' ? 'Solicitar Moto Taxi' : 'Confirmar Pedido'}
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
            className="space-y-12"
          >
            {/* TIENDAS Y ALIADOS SECTION */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Tiendas y Aliados</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pide comida, medicinas y más</p>
                  </div>
                </div>
                {aliados.length > 5 && (
                  <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                    Ver Todos <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {aliados.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center">
                  <Loader2 className="animate-spin text-orange-200 mx-auto mb-4" size={32} />
                  <p className="text-gray-400 font-bold">Cargando aliados cercanos...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {aliados.map((aliado) => (
                    <motion.div 
                      key={aliado.id} 
                      whileHover={{ y: -8, scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedAliado(aliado); setIsMenuModalOpen(true); }}
                      className="group cursor-pointer bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/20 transition-all relative overflow-hidden"
                    >
                      <div className="aspect-square w-full max-w-[120px] mx-auto mb-4 rounded-3xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500 bg-gray-50 border-4 border-white">
                        <img 
                          src={aliado.logoUrl} 
                          alt={aliado.nombre} 
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="text-sm sm:text-lg font-black text-gray-900 truncate tracking-tight">{aliado.nombre}</h3>
                        <p className="text-[10px] font-medium text-gray-400 line-clamp-1">
                          {aliado.descripcion || 'Especialidades locales'}
                        </p>
                        <div className="pt-2">
                          <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                             VER MENÚ <Plus size={10} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Tu Historial</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Gestiona tus pedidos activos</p>
                </div>
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
                            {(() => {
                              try {
                                if (!pedido.timestamp) return 'Recién';
                                const d = (pedido.timestamp as any).toDate ? (pedido.timestamp as any).toDate() : new Date(pedido.timestamp as any);
                                return format(d, "d MMM, HH:mm", { locale: es });
                              } catch (e) {
                                return 'Recién';
                              }
                            })()}
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

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTrackingPedido(pedido)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                        >
                          <MapPin size={16} /> Ver Mapa
                        </motion.button>

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
                    </div>
                  </motion.div>
                ))
              )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Menu & Shop Modal */}
      <AnimatePresence>
        {isMenuModalOpen && selectedAliado && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center overflow-hidden border border-orange-100">
                    {selectedAliado.logoUrl ? (
                      <img src={selectedAliado.logoUrl} alt={selectedAliado.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="text-orange-500" size={24} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{selectedAliado.nombre}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-md uppercase tracking-wider">{selectedAliado.categoria || 'Aliado'}</span>
                      <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <MapPin size={12} /> {selectedAliado.direccion || 'Ubicación Premium'}
                      </p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuModalOpen(false)}
                  className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {!selectedAliado.productos || selectedAliado.productos.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100">
                      <ShoppingCart size={40} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold">No hay productos disponibles por ahora.</p>
                    </div>
                  ) : (
                    selectedAliado.productos.map((producto, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={producto.id}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 hover:shadow-xl hover:shadow-orange-100/30 transition-all group"
                      >
                        <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-50">
                          {producto.imagenUrl ? (
                            <img src={producto.imagenUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-gray-900 mb-1 truncate">{producto.nombre}</h5>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed mb-3">
                            {producto.descripcion || 'Producto de alta calidad seleccionado para ti.'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-black text-orange-600">$ {Number(producto.precio).toFixed(2)}</span>
                            
                            <div className="flex items-center gap-3">
                              {getCartItemQuantity(producto.id) > 0 ? (
                                <div className="flex items-center gap-3 bg-gray-900 text-white rounded-xl px-1 py-1">
                                  <button 
                                    onClick={() => handleRemoveFromCart(producto.id)}
                                    className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-[10px] font-black w-4 text-center">{getCartItemQuantity(producto.id)}</span>
                                  <button 
                                    onClick={() => handleAddToCart(producto)}
                                    className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleAddToCart(producto)}
                                  className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                >
                                  <Plus size={20} />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* Checkout Bar */}
              {cart.length > 0 && (
                <motion.div 
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="p-8 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
                      <ShoppingCart size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen de Pedido</p>
                      <h4 className="text-xl font-black text-gray-900">{cart.length} Productos • $ {Number(cartTotal).toFixed(2)}</h4>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setCart([])}
                      className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2"
                    >
                      Vaciar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleConfirmCartOrder}
                      disabled={loading}
                      className="flex-1 sm:flex-none px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-200 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                      Confirmar Compra
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
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
                    <Bike size={24} />
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
                <TrackingMap 
                  pedido={trackingPedido} 
                  userPos={currentCoords} 
                  driverVehicleType={driverDetails?.tipoVehiculo} 
                />
                
                {driverDetails && (
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    {driverDetails.fotoUrl ? (
                      <img src={driverDetails.fotoUrl} alt={driverDetails.nombre} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shadow-sm">
                        <User size={24} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Tu Repartidor</p>
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">{driverDetails.nombre}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        {driverDetails.telefono && (
                          <span className="text-xs font-medium text-gray-500">{driverDetails.telefono}</span>
                        )}
                        {driverDetails.tipoVehiculo && (
                          <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {driverDetails.tipoVehiculo}
                          </span>
                        )}
                        {driverDetails.placaVehiculo && (
                          <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            {driverDetails.placaVehiculo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
