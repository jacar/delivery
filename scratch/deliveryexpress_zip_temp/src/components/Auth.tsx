import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Truck, ShoppingBag, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import LegalModal from './LegalModal';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'returns'>('about');

  const openLegal = (tab: 'about' | 'terms' | 'privacy' | 'returns') => {
    setLegalTab(tab);
    setShowLegal(true);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      toast.success('¡Bienvenido a DeliveryExpress!');
    } catch (error: any) {
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin || isStaffLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('¡Hola de nuevo!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nombre });
        
        // Create user doc
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          uid: userCredential.user.uid,
          nombre,
          email,
          rol: 'cliente',
          createdAt: new Date().toISOString()
        });
        toast.success('Cuenta creada con éxito');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Hero Content */}
      <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-screen flex items-center justify-center p-8 lg:p-20 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/bg-2-1.png" 
            alt="DeliveryExpress Hero" 
            className="w-full h-full object-cover scale-105"
            style={{ imageRendering: 'auto' }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl text-white space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-center">
              <motion.div 
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ 
                  duration: 2.5, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="w-full max-w-[500px] h-auto flex items-center justify-center"
                style={{ perspective: '1000px' }}
              >
                <img 
                  src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/bg-800-x-800-px-1.png" 
                  alt="DeliveryExpress Logo" 
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
            
            <p className="text-3xl lg:text-6xl font-black text-white leading-tight tracking-tighter drop-shadow-lg text-center lg:text-left">
              Te hacemos la vida más fácil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Truck className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-400">Rápido</p>
                  <p className="text-sm font-bold">Entregas en minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-blue-400">Seguro</p>
                  <p className="text-sm font-bold">Garantía total</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-20 bg-[#f8f9fa] relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isStaffLogin ? 'Acceso Personal' : (isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta')}
            </h2>
            <p className="text-gray-500 font-medium">
              {isStaffLogin ? 'Ingresa con tus credenciales de empleado' : 'Gestiona tus envíos de forma inteligente'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && !isStaffLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none shadow-sm"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none shadow-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin || isStaffLogin ? 'Entrar' : 'Registrarme')}
              <ArrowRight size={18} />
            </button>
          </form>

          {!isStaffLogin && (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-[#f8f9fa] px-4 text-gray-400">O continúa con</span></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 text-center">
            {!isStaffLogin && (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-bold text-orange-600 hover:text-orange-700"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
              </button>
            )}
            
            <button
              onClick={() => {
                setIsStaffLogin(!isStaffLogin);
                setIsLogin(true);
              }}
              className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
            >
              {isStaffLogin ? <><ArrowLeft size={14} /> Volver a Clientes</> : 'Acceso para Personal'}
            </button>
          </div>
        </motion.div>

        {/* Footer Links */}
        <div className="mt-12 lg:mt-20 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <button onClick={() => openLegal('about')} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">Sobre Nosotros</button>
          <button onClick={() => openLegal('terms')} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">Términos</button>
          <button onClick={() => openLegal('privacy')} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">Privacidad</button>
          <button onClick={() => openLegal('returns')} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">Devoluciones</button>
        </div>
      </div>

      <LegalModal 
        isOpen={showLegal} 
        onClose={() => setShowLegal(false)} 
        initialTab={legalTab} 
      />
    </div>
  );
}
