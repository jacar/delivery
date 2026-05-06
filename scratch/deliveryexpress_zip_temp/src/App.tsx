import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import LegalModal from './components/LegalModal';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDocFromServer } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { LogOut, Shield, Truck, ShoppingBag, ChevronDown, Bell, Settings } from 'lucide-react';
import { UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load views for performance
const ClienteView = lazy(() => import('./components/ClienteView'));
const RepartidorView = lazy(() => import('./components/RepartidorView'));
const AdminView = lazy(() => import('./components/AdminView'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full"
    />
  </div>
);

export default function App() {
  const { user, userData, loading } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'returns'>('about');

  const openLegal = (tab: 'about' | 'terms' | 'privacy' | 'returns') => {
    setLegalTab(tab);
    setShowLegal(true);
  };

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  const handleSignOut = () => signOut(auth);

  const handleChangeRole = async (newRole: UserRole) => {
    if (user) {
      try {
        const userRef = doc(db, 'usuarios', user.uid);
        await updateDoc(userRef, { rol: newRole });
        toast.success(`Cambiando a perfil de ${newRole}`);
        setShowRoleMenu(false);
      } catch (error) {
        toast.error('Error al cambiar de rol');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] gap-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full"
        />
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">DeliveryExpress</h2>
          <p className="text-gray-400 text-sm mt-1 animate-pulse">Preparando tu entrega...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 flex flex-col">
      <Toaster position="top-center" richColors />
      {/* Modern Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <motion.div 
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ 
                  duration: 2.5, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                whileHover={{ scale: 1.1 }}
                className="h-16 flex items-center justify-center overflow-hidden"
                style={{ perspective: '1000px' }}
              >
                <img 
                  src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/bg-800-x-800-px-1.png" 
                  alt="DeliveryExpress Logo"
                  className="h-full w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              {/* Phone Warning */}
              {!userData?.telefono && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-red-100 animate-pulse"
                >
                  <Bell size={14} /> <span className="hidden sm:inline">Falta Teléfono</span><span className="sm:hidden">!</span>
                </motion.button>
              )}

              {/* Role Switcher */}
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-xs font-bold text-gray-700 border border-gray-100"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    userData?.rol === 'admin' ? 'bg-purple-500' : 
                    userData?.rol === 'motorizado' ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                  <span className="capitalize">{userData?.rol}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showRoleMenu ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {showRoleMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 py-3 z-50 overflow-hidden"
                    >
                      <p className="px-5 py-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">Cambiar Perfil</p>
                      <button onClick={() => handleChangeRole('cliente')} className="w-full text-left px-5 py-3.5 hover:bg-orange-50 text-sm font-bold flex items-center gap-3 transition-colors group">
                        <ShoppingBag size={18} className="text-orange-400 group-hover:text-orange-600" /> Cliente
                      </button>
                      <button onClick={() => handleChangeRole('motorizado')} className="w-full text-left px-5 py-3.5 hover:bg-blue-50 text-sm font-bold flex items-center gap-3 transition-colors group">
                        <Truck size={18} className="text-blue-400 group-hover:text-blue-600" /> Repartidor
                      </button>
                      <button onClick={() => handleChangeRole('admin')} className="w-full text-left px-5 py-3.5 hover:bg-purple-50 text-sm font-bold flex items-center gap-3 transition-colors group">
                        <Shield size={18} className="text-purple-400 group-hover:text-purple-600" /> Administrador
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowProfile(true)}
                  className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                >
                  <Settings size={20} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Transitions */}
      <main className="max-w-7xl mx-auto py-10 px-6 lg:px-10 pb-24 flex-1 w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={userData?.rol}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {userData?.rol === 'cliente' && <ClienteView userData={userData} />}
              {userData?.rol === 'motorizado' && <RepartidorView userData={userData} />}
              {userData?.rol === 'admin' && <AdminView />}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center">
            <img src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/bg-800-x-800-px-1.png" alt="Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <button onClick={() => openLegal('about')} className="text-xs font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-colors">Sobre Nosotros</button>
            <button onClick={() => openLegal('terms')} className="text-xs font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-colors">Términos</button>
            <button onClick={() => openLegal('privacy')} className="text-xs font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-colors">Privacidad</button>
            <button onClick={() => openLegal('returns')} className="text-xs font-black text-gray-400 hover:text-orange-500 uppercase tracking-widest transition-colors">Devoluciones</button>
          </div>

          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">© 2026 DeliveryExpress</p>
        </div>
      </footer>

      {/* Floating Status Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md">
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl py-3 px-6 shadow-2xl flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              {userData?.nombre} • {userData?.rol}
            </p>
          </div>
          <p className="text-[10px] text-gray-500 font-medium">
            v1.3.0
          </p>
        </div>
      </div>

      {userData && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          userData={userData} 
        />
      )}

      <LegalModal 
        isOpen={showLegal} 
        onClose={() => setShowLegal(false)} 
        initialTab={legalTab} 
      />
    </div>
  );
}
