import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Bike, ShoppingBag, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import LegalModal from './LegalModal';
import { useAuth } from '../hooks/useAuth';
import { Usuario } from '../types';

import { API_BASE_URL } from '../services/apiConfig';

interface AuthProps {
  onBack?: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function Auth({ onBack }: AuthProps) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'returns'>('about');

  useEffect(() => {
    // Configurar Google Identity Services
    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "1091184859542-08v05fjt73llrkjcrb9ord7van58rkuk.apps.googleusercontent.com",
          callback: handleGoogleResponse
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "outline", size: "large", width: 320 }
        );
      }
    };

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = initializeGoogle;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);
      // Decodificar el JWT de Google de forma básica para obtener el email/nombre
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const googleUser = JSON.parse(jsonPayload);
      
      // Enviar a Laravel para sincronizar/login
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          nombre: googleUser.name,
          google_id: googleUser.sub,
          fotoUrl: googleUser.picture
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`;
        console.error("Server Error Response (auth/google):", errorData);
        throw new Error(msg);
      }
      
      const userData = await res.json();
      
      login(userData);
      toast.success(`¡Bienvenido, ${userData.nombre}!`);
    } catch (error: any) {
      console.error("Google Auth Error Detail:", error);
      toast.error(`Error al iniciar sesión: ${error.message}`);
    } finally {

      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin || isStaffLogin ? '/login' : '/register';
      const body = isLogin || isStaffLogin 
        ? { email, password }
        : { email, password, nombre, rol: 'cliente' };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      login(data as Usuario);
      toast.success(isLogin ? '¡Hola de nuevo!' : 'Cuenta creada con éxito');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openLegal = (tab: 'about' | 'terms' | 'privacy' | 'returns') => {
    setLegalTab(tab);
    setShowLegal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-indigo-50 p-3 rounded-2xl">
              {isStaffLogin ? <Bike className="text-indigo-600" size={24} /> : <ShoppingBag className="text-indigo-600" size={24} />}
            </div>
            <div className="w-10" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {isStaffLogin ? 'Acceso Staff' : isLogin ? '¡Bienvenido!' : 'Crear Cuenta'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isStaffLogin 
                ? 'Ingresa tus credenciales de repartidor o admin' 
                : isLogin ? 'Inicia sesión para continuar con tu pedido' : 'Únete a Delivery Express hoy'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && !isStaffLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 outline-none"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 outline-none"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-700 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin || isStaffLogin ? 'Entrar Ahora' : 'Empezar Registro'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {!isStaffLogin && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400">O continúa con Google</span>
                </div>
              </div>

              <div id="googleBtn" className="w-full flex justify-center min-h-[44px]"></div>
            </>
          )}

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setIsStaffLogin(false);
              }}
              className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsStaffLogin(!isStaffLogin)}
                className="text-slate-400 text-sm hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck size={14} />
                {isStaffLogin ? 'Ir a Login Cliente' : 'Acceso Personal Autorizado'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <button onClick={() => openLegal('about')} className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">Sobre Nosotros</button>
            <button onClick={() => openLegal('terms')} className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">Términos y Condiciones</button>
            <button onClick={() => openLegal('privacy')} className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">Privacidad</button>
            <button onClick={() => openLegal('returns')} className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">Devoluciones</button>
          </div>
          <p className="mt-4 text-[10px] text-center text-slate-300">
            © 2026 Delivery Express. Todos los derechos reservados.
          </p>
        </div>
      </motion.div>

      <LegalModal 
        isOpen={showLegal} 
        onClose={() => setShowLegal(false)} 
        initialTab={legalTab} 
      />
    </div>
  );
}
