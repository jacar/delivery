import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Loader2, ArrowRight, ShieldCheck, Bike, ShoppingBag, ArrowLeft, Info, Store } from 'lucide-react';
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
  const googleInitialized = useRef(false);
  const [mode, setMode] = useState<'login' | 'register' | 'staff' | 'aliado' | 'aliado_register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'returns'>('about');

  useEffect(() => {
    // 1. CARGAR SCRIPT UNA SOLA VEZ
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // 2. INICIALIZAR Y RENDERIZAR BOTÓN
    const timer = setTimeout(() => {
      if (window.google?.accounts?.id) {
        if (!googleInitialized.current) {
          window.google.accounts.id.initialize({
            client_id: "1091184859542-08v05fjt73llrkjcrb9ord7van58rkuk.apps.googleusercontent.com",
            callback: handleGoogleResponse
          });
          googleInitialized.current = true;
        }

        const btnElem = document.getElementById("googleBtn");
        if (btnElem) {
          btnElem.innerHTML = ""; // Limpiar antes de renderizar
          window.google.accounts.id.renderButton(btnElem, { 
            theme: "outline", 
            size: "large", 
            width: 320,
            text: mode === 'aliado' ? 'signup_with' : 'signin_with'
          });
        }
      }
    }, 500); // Pequeño delay para asegurar que el DOM y el script estén listos

    return () => clearTimeout(timer);
  }, [mode]);

  const handleGoogleResponse = async (response: any) => {
    try {
      setLoading(true);
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const googleUser = JSON.parse(jsonPayload);
      const targetRol = (mode === 'aliado' || mode === 'aliado_register') ? 'aliado' : 'cliente';
      
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          nombre: googleUser.name,
          google_id: googleUser.sub,
          fotoUrl: googleUser.picture,
          rol: targetRol
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error en Google Auth');
      }
      
      login(data);

      if (data.rol === 'aliado' && !data.aprobado) {
        toast.info('Registro de aliado pendiente de aprobación (Modo Edición Habilitado).');
      } else {
        toast.success(`¡Bienvenido, ${data.nombre}!`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isRegister = mode === 'register' || mode === 'aliado_register';
      const endpoint = isRegister ? '/register' : '/login';
      const targetRol = mode === 'aliado_register' ? 'aliado' : 'cliente';

      const body = !isRegister
        ? { email, password }
        : { email, password, nombre, rol: targetRol };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error en la autenticación');
      }

      // Si es login y estamos en modo Aliado, verificar que el rol coincida
      if (!isRegister && (mode === 'aliado') && data.rol !== 'aliado') {
        throw new Error('Esta cuenta no está registrada como Aliado Comercial.');
      }

      login(data as Usuario);
      if (data.rol === 'aliado' && !data.aprobado) {
        toast.info('Tu registro de aliado está pendiente de aprobación (Modo Edición Habilitado).');
      } else {
        toast.success(isRegister ? 'Cuenta creada con éxito' : '¡Hola de nuevo!');
      }
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
              {mode === 'staff' && <ShieldCheck className="text-indigo-600" size={24} />}
              {(mode === 'aliado' || mode === 'aliado_register') && <Store className="text-indigo-600" size={24} />}
              {(mode === 'login' || mode === 'register') && <ShoppingBag className="text-indigo-600" size={24} />}
            </div>
            <div className="w-10" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2 uppercase tracking-tighter">
              {mode === 'staff' ? 'Acceso Staff' : (mode === 'aliado' || mode === 'aliado_register') ? 'Acceso Aliados' : mode === 'login' ? '¡Bienvenido!' : 'Crear Cuenta'}
            </h1>
            <p className="text-slate-500 text-sm">
              {mode === 'staff' && 'Ingresa tus credenciales de repartidor o admin'}
              {(mode === 'aliado' || mode === 'aliado_register') && 'Gestiona tu comercio y productos'}
              {mode === 'login' && 'Inicia sesión para continuar con tu pedido'}
              {mode === 'register' && 'Únete a Delivery Express hoy'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {(mode === 'register' || mode === 'aliado_register') && (
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
                  {(mode === 'register' || mode === 'aliado_register') ? 'Crear Cuenta de Aliado' : 'Entrar al Panel'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {mode !== 'staff' && (
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

          <div className="mt-8 text-center space-y-6">
            {(mode === 'login' || mode === 'register') ? (
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                {mode === 'login' ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            ) : (mode === 'aliado' || mode === 'aliado_register') ? (
              <button
                onClick={() => setMode(mode === 'aliado' ? 'aliado_register' : 'aliado')}
                className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
              >
                {mode === 'aliado' ? '¿No tienes cuenta? Regístrate como Aliado' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            ) : (
              <button
                onClick={() => setMode('login')}
                className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} /> Volver al Login Cliente
              </button>
            )}

            <div className="flex flex-col gap-3">
              {(mode === 'login' || mode === 'register' || mode === 'staff') && (
                <button
                  onClick={() => setMode('aliado')}
                  className="w-full py-3 border border-slate-200 rounded-2xl text-slate-500 text-sm hover:text-indigo-600 hover:border-indigo-100 flex items-center justify-center gap-2 transition-all hover:bg-indigo-50/50"
                >
                  <Store size={16} />
                  Soy un Aliado Comercial
                </button>
              )}
              {mode !== 'staff' && (mode !== 'aliado' && mode !== 'aliado_register') && (
                <button
                  onClick={() => setMode('staff')}
                  className="w-full py-3 border border-slate-200 rounded-2xl text-slate-400 text-sm hover:text-indigo-600 hover:border-indigo-100 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck size={16} />
                  Acceso Personal Autorizado
                </button>
              )}
              {(mode === 'aliado' || mode === 'aliado_register' || mode === 'staff') && (
                <button
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                >
                   Volver al Inicio
                </button>
              )}
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
