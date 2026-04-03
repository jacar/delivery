import React, { useState, useEffect } from 'react';
import { listenAliados } from '../services/aliadoService';
import { createPedido, crearUsuarioPersonal } from '../services/pedidoService';
import { Aliado } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, MapPin, ArrowRight, ShoppingBag, Package, Truck, 
  Phone, MessageCircle, Loader2, User, Mail, Lock, CheckCircle2, 
  Menu, X, Zap, Clock, Globe, Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = 'https://www.webcincodev.com/b2b/public/api';

interface HomeInformativoProps {
  onStart: () => void;
}

export default function HomeInformativo({ onStart }: HomeInformativoProps) {
  const { user, userData, login } = useAuth();
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [selectedAliado, setSelectedAliado] = useState<Aliado | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'menu' | 'register' | 'checkout'>('menu');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'privacidad' | 'terminos' | 'faq' | null>(null);

  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regError, setRegError] = useState('');
  const [direccion, setDireccion] = useState('');
  const [localUser, setLocalUser] = useState<{uid: string, nombre: string, telefono: string} | null>(null);

  const effectiveUser = userData || localUser;
  const [cart, setCart] = useState<Record<string, number>>({});

  const updateQuantity = (productoId: string, delta: number) => {
    setCart(prev => {
      const actual = prev[productoId] || 0;
      const newValue = Math.max(0, actual + delta);
      if (newValue === 0) { const copy = { ...prev }; delete copy[productoId]; return copy; }
      return { ...prev, [productoId]: newValue };
    });
  };

  useEffect(() => {
    const unsub = listenAliados((data) => setAliados(data));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (userData) {
      setRegNombre(userData.nombre || '');
      setRegTelefono(userData.telefono || '');
      setRegEmail(userData.email || '');
    }
  }, [userData]);

  const handleProceedToCheckout = () => {
    if (Object.keys(cart).length === 0) {
      toast.error("Selecciona al menos un producto pulsando en [+].");
      return;
    }
    if (effectiveUser) {
      setCheckoutStep('checkout');
    } else {
      setCheckoutStep('register');
    }
  };

  const handleQuickRegister = async () => {
    setRegError('');
    if (!regNombre || !regEmail || !regPassword || !regTelefono) {
      setRegError('Todos los campos son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const response = await crearUsuarioPersonal(regEmail, regPassword, regNombre, 'cliente');
      if (response && (response.uid || response.id)) {
        login(response);
        setLocalUser({ uid: response.uid || response.id, nombre: regNombre, telefono: regTelefono });
        toast.success('¡Cuenta creada! Continúa con tu pedido.');
        setCheckoutStep('checkout');
      }
    } catch (err: any) {
      setRegError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAliado || !effectiveUser) return;
    if (!direccion) { toast.error("Ingresa tu dirección de entrega."); return; }
    setLoading(true);
    try {
      const prods = selectedAliado.productos?.filter(p => cart[p.id]) || [];
      const resumen = prods.map(p => `${cart[p.id]}x ${p.nombre}`).join(', ');

      await createPedido(
        effectiveUser.uid, effectiveUser.nombre, effectiveUser.telefono || regTelefono,
        'compra',
        `Pedido Express a ${selectedAliado.nombre}: ${resumen}`,
        { lat: 0, lng: 0, direccion: selectedAliado.nombre },
        { lat: 0, lng: 0, direccion: direccion }
      );
      toast.success("¡Envío Express coordinado!");
      const pedidoTexto = prods.map(p => `- *${cart[p.id]}* ${p.nombre}`).join('%0A');
      const message = encodeURIComponent(`¡Hola ${selectedAliado.nombre}! Soy ${effectiveUser.nombre}. %0AMe gustaría pedir:%0A${pedidoTexto}%0A%0A*Dirección de entrega:* ${direccion}%0A%0A---%0A🛵 *YA COORDINÉ EL DELIVERY CON ENVÍOS EXPRESS*.`);
      setTimeout(() => {
        window.open(`https://wa.me/${selectedAliado.whatsapp}?text=${message}`, '_blank');
        handleClose();
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Error al coordinar el envío.");
    } finally { setLoading(false); }
  };

  const handleClose = () => {
    setSelectedAliado(null);
    setCheckoutStep('menu');
    setDireccion('');
    setCart({});
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white text-gray-900 font-sans selection:bg-orange-500/30">
      <div className="fixed top-0 left-0 right-0 h-1 z-[110] bg-orange-600 shadow-sm" />
      
      {/* NAVBAR STICKY (SIMPLIFICADO EN MÓVIL) */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 h-16 lg:h-24 flex items-center transition-all duration-300">
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* LOGO */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="w-12 h-12 lg:w-24 lg:h-24 transition-transform duration-500 group-hover:scale-110">
              <img 
                src="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/bg-7.png" 
                alt="DeliveryExpress Logo" 
                className="w-full h-full object-contain" 
                fetchPriority="high"
                decoding="sync"
              />
            </div>
            <div className="text-2xl lg:text-5xl font-black italic tracking-tighter text-gray-900 leading-none">
              DELIVERY<span className="text-orange-600">EXPRESS</span>
            </div>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden lg:flex items-center gap-12 text-sm font-black uppercase tracking-widest text-gray-500">
            {['Servicios', 'Rastreo', 'Contacto'].map((item) => (
              <button 
                key={item} 
                onClick={() => scrollToSection(item.toLowerCase())}
                className="hover:text-gray-900 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </nav>

          {/* CTA LOGIN / REGISTER */}
          <div className="hidden lg:flex items-center">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="bg-orange-600 text-white px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-[0.1em] shadow-lg shadow-orange-600/20 hover:bg-orange-500 transition-colors flex items-center gap-2"
            >
              Registrarse y Ordenar
              <ArrowRight size={16} />
            </motion.button>
          </div>

          {/* MOBILE TOGGLE */}
          <button className="lg:hidden p-2 text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-white pt-32 px-6 flex flex-col gap-8"
          >
            {['Servicios', 'Rastreo', 'Contacto'].map((item) => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-4xl font-black text-left tracking-tighter uppercase">{item}</button>
            ))}
            <button onClick={onStart} className="mt-4 bg-orange-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest">Registrarse y Ordenar</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-12 lg:pt-56 lg:pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
          
          {/* TEXTO IZQUIERDA */}
          <div className="flex-1 space-y-10 text-center lg:text-left">

            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 text-orange-600 text-xs font-black uppercase tracking-[0.3em]"
            >
              <Zap size={14} fill="currentColor" />
              Tu Logística Urbana de Confianza
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl lg:text-[7rem] font-black text-gray-900 leading-[1.1] lg:leading-[0.95] tracking-tight uppercase"
            >
              Te Hacemos la <br/>
              <span className="text-orange-600">Vida Más <span className="tracking-normal">Fácil</span></span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-lg lg:text-xl font-medium max-w-xl leading-relaxed mx-auto lg:mx-0"
            >
              Comida, súper, farmacia o mensajería. <br className="hidden lg:block"/> 
              Entregamos lo que necesites en minutos con nuestra <span className="text-gray-900 font-bold">red de mensajeros urbanos de élite</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-orange-600 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl shadow-orange-600/30 hover:bg-orange-500 transition-all hover:scale-105 active:scale-95"
              >
                Comenzar <ShoppingBag size={20} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm">
                      <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px] font-black">USER</div>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  +50k usuarios ya disfrutan la <span className="text-orange-600">entrega ultra-rápida</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* IMAGEN DERECHA (bg.png) */}
          <div className="flex-1 relative w-full max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }} 
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-8 border-white bg-gray-100 group"
            >
              <img 
                src="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/bg-6.png" 
                alt="Delivery Hero" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                fetchPriority="high"
                decoding="sync"
              />
              
              {/* RASTREO FLOTANTE CARD */}
              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-10 left-10 right-10 bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-gray-100/50 z-20 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Rastreador Urbano en Vivo</span>
                    <h4 className="font-extrabold text-gray-900 text-sm">Pedido: Hamburguesa Gourmet</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">A 2 min</span>
                  </div>
                </div>
                
                <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" 
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  <span>Restaurante</span>
                  <span>Tu Casa</span>
                </div>
              </motion.div>
            </motion.div>

            {/* ELEMENTOS DECORATIVOS */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-700" />
          </div>
        </div>
      </section>

      {/* CARRUSEL DE SERVICIOS 3D (REPOSICIONADO) */}
      <div className="relative z-20 -mt-12 mb-12">
        <div className="w-full overflow-hidden py-4 bg-white/30 backdrop-blur-sm border-y border-white/20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 whitespace-nowrap overflow-visible"
          >
            <div className="flex gap-6 animate-scroll-infinite">
              {[
                { i: '🍔', t: 'Restaurantes' },
                { i: '💊', t: 'Farmacia' },
                { i: '🛍️', t: 'Comercio' },
                { i: '🍾', t: 'Licorería' },
                { i: '🥦', t: 'Verduras' },
                { i: '📦', t: 'Paquetes' }
              ].map((s, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all cursor-default"
                >
                  <span className="text-3xl drop-shadow-[0_5px_10px_rgba(0,0,0,0.15)]">{s.i}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">{s.t}</span>
                </motion.div>
              ))}
              {/* Duplicado para loop infinito */}
              {[
                { i: '🍔', t: 'Restaurantes' },
                { i: '💊', t: 'Farmacia' },
                { i: '🛍️', t: 'Comercio' },
                { i: '🍾', t: 'Licorería' },
                { i: '🥦', t: 'Verduras' },
                { i: '📦', t: 'Paquetes' }
              ].map((s, idx) => (
                <motion.div 
                  key={`dup2-${idx}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="inline-flex items-center gap-4 bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all cursor-default"
                >
                  <span className="text-3xl drop-shadow-[0_5px_10px_rgba(0,0,0,0.15)]">{s.i}</span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">{s.t}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ALIADOS GRID */}
      <section id="aliados" className="py-16 lg:py-32 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
            <div>
              <h2 className="text-xs font-black text-orange-600 uppercase tracking-[0.5em] mb-4">Red de Comercios</h2>
              <p className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[1] uppercase text-balance">Nuestros <span className="text-orange-600">Aliados</span></p>
            </div>
            <p className="text-gray-400 font-medium max-w-xs text-sm leading-relaxed">
              Trabajamos con los comercios más exclusivos para garantizar calidad y variedad en cada pedido.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aliados.map((aliado) => (
              <motion.div 
                key={aliado.id} 
                whileHover={{ y: -10, scale: 1.02 }} 
                onClick={() => { setSelectedAliado(aliado); setCheckoutStep('menu'); }}
                className="group cursor-pointer bg-white/70 backdrop-blur-md p-8 rounded-[3.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div className="aspect-square w-full max-w-[200px] mx-auto mb-8 rounded-[3rem] overflow-hidden shadow-xl group-hover:scale-105 transition-transform duration-500 bg-gray-50 border-4 border-white">
                  <img 
                    src={aliado.logoUrl} 
                    alt={aliado.nombre} 
                    className="w-full h-full object-cover" 
                    loading="lazy" 
                    decoding="async" 
                  />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter truncate">{aliado.nombre}</h3>
                  <p className="text-xs font-medium text-gray-400 line-clamp-2 leading-relaxed h-8">{aliado.descripcion || 'Especialidades locales seleccionadas'}</p>
                  <div className="pt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                       Ver Menú <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICIOS SECTION */}
      <section id="servicios" className="py-16 lg:py-32 bg-white">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-12 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter uppercase mb-6">Entrega Urbana Total</h2>
            <div className="h-1.5 w-32 bg-orange-600 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShoppingBag, color: 'text-red-500', bg: 'bg-red-50', title: 'Restaurantes', desc: 'Tus platos favoritos de los mejores locales de la ciudad, calientes y en tiempo récord.' },
              { icon: Package, color: 'text-orange-500', bg: 'bg-orange-50', title: 'Súper y Verduras', desc: 'Frutas frescas, verduras y básicos del hogar directamente a tu cocina sin filas.' },
              { icon: Truck, color: 'text-gray-900', bg: 'bg-gray-50', title: 'Mensajería', desc: '¿Olvidaste las llaves? ¿Necesitas enviar un documento? Lo recogemos y entregamos.' },
              { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50', title: 'Farmacia 24/7', desc: 'Medicamentos y bienestar entregados con discreción y urgencia en cualquier momento.' }
            ].map((s, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all h-full space-y-6"
              >
                <div className={`w-16 h-16 ${s.bg} ${s.color} rounded-x2l rounded-3xl flex items-center justify-center`}>
                  <s.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{s.title}</h3>
                <p className="text-gray-400 font-medium text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTROL SECTION (Radar) */}
      <section id="rastreo" className="py-20 lg:py-44 bg-zinc-950 overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-24 relative z-10">
          <div className="flex-1 space-y-12">
            <div className="space-y-4">
              <span className="text-orange-500 text-xs font-black uppercase tracking-[0.4em]">Sala de Control</span>
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                Control <br/>
                <span className="text-zinc-600">Rastreador Kinetic</span>
              </h2>
            </div>

            <div className="space-y-10">
              {[
                { n: '01', title: 'Mapeo Hiperlocal', desc: 'Visualización del repartidor en tiempo real por cada callejón de la ciudad.' },
                { n: '02', title: 'ETA Inteligente', desc: 'Predicción exacta de llegada considerando tráfico urbano y semáforos.' },
                { n: '03', title: 'Chat Directo', desc: 'Comunicación instantánea con tu mensajero para cualquier instrucción extra.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 max-w-sm">
                  <span className="text-orange-600 text-xl font-black">{item.n}.</span>
                  <div className="space-y-2">
                    <h4 className="text-white font-black text-lg uppercase tracking-tight">{item.title}</h4>
                    <p className="text-zinc-500 text-sm font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            {/* RADAR ANIMADO */}
            <div className="relative w-full aspect-square max-w-[500px]">
              <div className="absolute inset-0 border border-zinc-800 rounded-full" />
              <div className="absolute inset-[15%] border border-zinc-800 rounded-full" />
              <div className="absolute inset-[30%] border border-zinc-800 rounded-full" />
              <div className="absolute inset-[45%] border border-zinc-800 rounded-full" />
              
              {/* Barrido de Radar */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 origin-center bg-gradient-to-r from-transparent to-orange-500/20"
                style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 0%, 50% 0%)' }}
              />

              {/* Centro / Motorizado */}
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-48 h-48 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-2">
                    <div className="w-full h-full bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600">
                       <Navigation size={40} className="animate-pulse" />
                    </div>
                  </div>
               </div>

              {/* Blips */}
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} className="absolute top-[20%] left-[30%] w-3 h-3 bg-orange-600 rounded-full shadow-[0_0_20px_orange]" />
              <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} className="absolute bottom-[30%] right-[25%] w-3 h-3 bg-orange-600 rounded-full shadow-[0_0_20px_orange]" />
            </div>
          </div>
        </div>
      </section>


      {/* FOOTER - FONDO CON VIDEO CINEMÁTICO */}
      <footer id="contacto" className="relative py-12 lg:py-44 overflow-hidden min-h-[400px] lg:min-h-[500px] flex items-center bg-zinc-950">
        {/* VIDEO DE FONDO */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          poster="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/bg-7.png"
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
          preload="metadata"
        >
          <source src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/DELIVERY-EXPRESS-_1_.webm" type="video/webm" />
        </video>

        {/* OVERLAY DE COLOR (TINTE NARANJA) */}
        <div className="absolute inset-0 bg-orange-600/40 backdrop-blur-[2px] z-10" />
        
        <div className="container mx-auto px-6 flex flex-col items-center text-center gap-12 relative z-20">
          {/* LOGO DE IMAGEN OFICIAL */}
          <div className="flex flex-col items-center gap-6 group cursor-default">
            <div className="w-64 lg:w-[450px] transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl">
               <img 
                 src="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/bg-800-x-800-px-3.png" 
                 alt="DeliveryExpress Logo" 
                 className="w-full h-auto" 
                 loading="lazy"
                 decoding="async"
               />
            </div>
            <p className="text-[12px] lg:text-sm font-black uppercase tracking-[0.8em] text-white/90 not-italic drop-shadow-lg">Tu Logística Urbana de Confianza</p>
          </div>

          <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-white uppercase tracking-widest">
            {[
              { id: 'privacidad', label: 'Política de Privacidad' },
              { id: 'terminos', label: 'Términos de Servicio' },
              { id: 'faq', label: 'Preguntas Frecuentes' }
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setInfoModal(item.id as any)} 
                className="hover:text-orange-200 transition-colors uppercase border-b border-white pb-1"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
             <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
                © 2026 TODOS LOS DERECHOS RESERVADOS DELIVERYEXPRESS
             </div>
             <div className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] drop-shadow-md">
                Desarrollado por <a href="https://jacomeovalle.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-200 transition-colors underline underline-offset-4 font-bold">Armando Ovalle</a>
             </div>
          </div>
        </div>
      </footer>

      {/* MODAL ALIADO (CART & CHECKOUT) - Mantenemos la lógica pero con estilos más pulidos */}
      <AnimatePresence>
        {selectedAliado && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
              
              <button onClick={handleClose} className="absolute top-8 right-8 z-10 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                <X size={20} />
              </button>

              <div className="p-10 lg:p-14 space-y-10">
                {/* MODAL CONTENT STEPS (MENU, REGISTER, CHECKOUT) */}
                {checkoutStep === 'menu' && (
                  <>
                    <div className="flex items-center gap-8">
                       <div className="w-32 h-32 bg-gray-50 rounded-[2.5rem] overflow-hidden border-4 border-gray-50 flex-shrink-0 shadow-lg">
                          <img src={selectedAliado.logoUrl} alt={selectedAliado.nombre} className="w-full h-full object-cover" />
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">{selectedAliado.nombre}</h3>
                          <div className="text-orange-600 font-black text-[10px] uppercase tracking-[0.3em] py-1">Establecimiento Aliado</div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-4">Nuestra Carta Digital</h4>
                       <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                          {selectedAliado.productos?.map((prod) => (
                            <div key={prod.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <h4 className="text-sm font-black text-gray-900 uppercase">{prod.nombre}</h4>
                                <div className="text-orange-600 font-black">{prod.precio}</div>
                              </div>
                              <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-2xl shadow-sm">
                                {cart[prod.id] > 0 && (
                                  <>
                                    <button onClick={() => updateQuantity(prod.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold">-</button>
                                    <span className="font-black text-xs w-4 text-center">{cart[prod.id]}</span>
                                  </>
                                )}
                                <button onClick={() => updateQuantity(prod.id, 1)} className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">+</button>
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleProceedToCheckout}
                      className="w-full bg-orange-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20"
                    >
                      {Object.keys(cart).length > 0 ? `Hacer Pedido (${Object.values(cart).reduce((a, b) => a + b, 0)} items)` : 'Seleccionar Productos'}
                    </motion.button>
                  </>
                )}

                {/* REGISTER STEP */}
                {checkoutStep === 'register' && (
                  <div className="space-y-10">
                    <div className="text-center space-y-2">
                       <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Crea tu Cuenta</h2>
                       <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Es rápido y solo lo harás una vez</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       <input type="text" value={regNombre} onChange={e => setRegNombre(e.target.value)} placeholder="Nombre Completo" className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" />
                       <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Correo Electrónico" className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" />
                       <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Contraseña (mín 6 car.)" className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" />
                       <input type="text" value={regTelefono} onChange={e => setRegTelefono(e.target.value)} placeholder="WhatsApp (584120000000)" className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all" />
                    </div>
                    {regError && <p className="text-red-500 text-[10px] font-black uppercase text-center">{regError}</p>}
                    <div className="flex gap-4">
                       <button onClick={() => setCheckoutStep('menu')} className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px]">Atrás</button>
                       <button onClick={handleQuickRegister} className="flex-[2] py-5 bg-zinc-900 text-white rounded-2xl font-black uppercase text-xs">Registrarme</button>
                    </div>
                  </div>
                )}

                {/* CHECKOUT STEP */}
                {checkoutStep === 'checkout' && (
                  <div className="space-y-10">
                    <div className="text-center space-y-2">
                       <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Último Paso</h2>
                       <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">¿A dónde enviamos tu pedido?</p>
                    </div>
                    <div className="space-y-4">
                       <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center gap-4">
                          <CheckCircle2 className="text-orange-600" />
                          <div className="text-xs font-black uppercase text-orange-900">Usuario: {effectiveUser?.nombre}</div>
                       </div>
                       <textarea 
                          value={direccion} onChange={e => setDireccion(e.target.value)} 
                          placeholder="Tu dirección completa aquí..."
                          className="w-full p-6 bg-gray-100 border-none rounded-3xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-orange-500/20 transition-all h-32 resize-none"
                       />
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setCheckoutStep(effectiveUser ? 'menu' : 'register')} className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px]">Atrás</button>
                       <button onClick={handleConfirmOrder} disabled={loading} className="flex-[2] py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2">
                          {loading ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18}/> Confirmar Pedido</>}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setInfoModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row min-h-[500px]"
            >
              {/* SIDEBAR DECORATIVO */}
              <div className="md:w-1/3 bg-orange-600 p-12 flex flex-col justify-between items-center text-center">
                <div className="w-32 h-32 brightness-0 invert drop-shadow-xl">
                  <img 
                    src="https://www.webcincodev.com/blog/wp-content/uploads/2026/04/bg-7.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="space-y-4">
                  <Zap size={48} className="text-white/30 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 leading-relaxed">Información Oficial<br/>DeliveryExpress</p>
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div className="md:flex-1 p-12 lg:p-20 relative overflow-y-auto max-h-[80vh]">
                <button onClick={() => setInfoModal(null)} className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>

                {infoModal === 'privacidad' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Privacidad</h2>
                      <div className="h-2 w-20 bg-orange-600 rounded-full" />
                    </div>
                    <div className="space-y-6 text-gray-500 font-bold leading-relaxed text-sm">
                      <p>En DeliveryExpress, tu seguridad es nuestra prioridad más absoluta. Nuestra Política de Privacidad está diseñada para que comprendas cómo manejamos tu información con total transparencia.</p>
                      <ul className="space-y-4 list-none">
                        <li className="flex gap-4"><CheckCircle2 className="text-orange-600 shrink-0" size={18}/><span>Solo almacenamos datos críticos: nombre, teléfono y ubicación GPS real para la entrega.</span></li>
                        <li className="flex gap-4"><CheckCircle2 className="text-orange-600 shrink-0" size={18}/><span>Tus datos de ubicación solo se activan cuando tienes un pedido en curso.</span></li>
                        <li className="flex gap-4"><CheckCircle2 className="text-orange-600 shrink-0" size={18}/><span>Cifrado de grado bancario para todas tus transacciones y datos personales.</span></li>
                      </ul>
                      <p className="bg-gray-100 p-6 rounded-3xl text-[10px] uppercase tracking-widest leading-relaxed">Nunca compartimos tus datos con terceros para fines publicitarios. Tu información es solo tuya.</p>
                    </div>
                  </div>
                )}

                {infoModal === 'terminos' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Términos</h2>
                      <div className="h-2 w-20 bg-orange-600 rounded-full" />
                    </div>
                    <div className="space-y-6 text-gray-500 font-bold leading-relaxed text-sm">
                      <p>Al acceder a nuestra plataforma, te unes a una red logística de alto rendimiento. Estos son los pilares de nuestro servicio:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 space-y-2">
                          <h4 className="text-orange-600 font-black uppercase text-[10px] tracking-widest">Responsabilidad</h4>
                          <p className="text-[11px] leading-relaxed">El usuario debe proporcionar datos de entrega exactos para garantizar la velocidad de envío.</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-3xl space-y-2">
                          <h4 className="text-gray-900 font-black uppercase text-[10px] tracking-widest">Entregas</h4>
                          <p className="text-[11px] leading-relaxed">Los tiempos son estimados según tráfico y operación del Aliado. Siempre buscamos la ruta más rápida.</p>
                        </div>
                      </div>
                      <p className="border-l-4 border-orange-600 pl-6 italic">DeliveryExpress actúa como el catalizador logístico entre los mejores establecimientos y tu puerta.</p>
                    </div>
                  </div>
                )}

                {infoModal === 'faq' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase">Ayuda / FAQ</h2>
                      <div className="h-2 w-20 bg-orange-600 rounded-full" />
                    </div>
                    <div className="space-y-8">
                       {[
                         { q: '¿Cuál es el costo del envío?', a: 'Varía según la zona y promociones vigentes. Lo verás reflejado siempre antes de confirmar.' },
                         { q: '¿Cómo rastreo mi pedido?', a: 'Usa la sección "Rastreo" en el menú superior e ingresa tu ID de pedido para verlo en el radar.' },
                         { q: '¿Qué hago si mi pedido llega mal?', a: 'Contáctanos de inmediato mediante el soporte de la app. Gestionaremos una solución con el Aliado en minutos.' },
                         { q: '¿Soy seguro pagando en la app?', a: 'Absolutamente. Utilizamos pasarelas de pago certificadas con los más altos estándares de seguridad.' }
                       ].map((item, idx) => (
                         <div key={idx} className="space-y-2 group">
                            <h4 className="text-gray-900 font-black uppercase text-[11px] tracking-widest flex items-center gap-3">
                              <span className="w-6 h-6 bg-orange-600 text-white rounded-lg flex items-center justify-center italic">?</span> 
                              {item.q}
                            </h4>
                            <p className="text-gray-400 font-bold text-xs leading-relaxed pl-9">{item.a}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV BAR (APP-LIKE EXPERIENCE - MINIMAL GLASS) */}
      <div className="lg:hidden fixed bottom-4 left-6 right-6 z-[110]">
        <motion.nav 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="bg-white/70 backdrop-blur-2xl px-4 py-2 rounded-[2.5rem] border border-white shadow-[0_15px_50px_-10px_rgba(0,0,0,0.1)] flex justify-between items-center"
        >
          {[
            { id: 'home', icon: Globe, label: 'Inicio' },
            { id: 'aliados', icon: ShoppingBag, label: 'Servicios' },
            { id: 'rastreo', icon: Navigation, label: 'Radar' },
            { id: 'soporte', icon: MessageCircle, label: 'Ayuda' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'soporte') setInfoModal('faq');
                else scrollToSection(item.id);
              }}
              className="flex flex-col items-center gap-0.5 relative p-2"
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-orange-500' : 'text-gray-400'} />
              <span className={`text-[8px] font-black uppercase tracking-tighter ${activeTab === item.id ? 'text-gray-900' : 'text-gray-400 opacity-60'}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <motion.div layoutId="navDot" className="absolute -top-1 w-1 h-1 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </motion.nav>
      </div>
    </div>
  );
}
