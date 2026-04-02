import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import NotificationsModal from './components/NotificationsModal';
import LegalModal from './components/LegalModal';
import MobileNav from './components/MobileNav';
import { Toaster, toast } from 'sonner';
import { LogOut, HelpCircle, Bell, Settings, ShieldCheck } from 'lucide-react';
import { UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import ChatWidget from './components/ChatWidget';
import { actualizarRolUsuario } from './services/pedidoService';

// Lazy load views for performance
const ClienteView = lazy(() => import('./components/ClienteView'));
const RepartidorView = lazy(() => import('./components/RepartidorView'));
const AdminView = lazy(() => import('./components/AdminView'));
const HomeInformativo = lazy(() => import('./components/HomeInformativo'));

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
  const { user, userData, loading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('home');
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'returns'>('about');

  const openLegal = (tab: 'about' | 'terms' | 'privacy' | 'returns') => {
    setLegalTab(tab);
    setShowLegal(true);
  };

  useEffect(() => {
    if (userData && activeMobileTab === 'home') {
      setActiveMobileTab('pedidos');
    }
  }, [userData, activeMobileTab]);

  const handleSignOut = () => {
    logout();
    toast.success("Sesión cerrada correctamente");
  };

  const handleChangeRole = async (newRole: UserRole) => {
    if (userData?.uid) {
      try {
        await actualizarRolUsuario(userData.uid, newRole);
        toast.success(`Cambiando a perfil de ${newRole}`);
        window.location.reload(); // Recargar para aplicar cambios de contexto
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
    return !showLogin ? (
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-white font-sans text-gray-900">
          <Toaster position="top-center" richColors />
          <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <div className="flex justify-between h-20 items-center">
                <img src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/bg-800-x-800-px-1.png" alt="Logo" className="h-12 w-auto" />
                <button 
                  onClick={() => setShowLogin(true)}
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-colors shadow-lg shadow-gray-900/10"
                >
                  Acceder
                </button>
              </div>
            </div>
          </nav>
          <main className="w-full overflow-hidden">
            <HomeInformativo onStart={() => setShowLogin(true)} />
          </main>
          <footer className="bg-gray-900 py-20 px-6 lg:px-10 mt-20">
            <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
              <img src="https://www.webcincodev.com/blog/wp-content/uploads/2026/03/bg-800-x-800-px-1.png" alt="Logo" className="h-12 w-auto grayscale brightness-200" />
              <div className="flex gap-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <button onClick={() => openLegal('terms')}>Términos</button>
                <button onClick={() => openLegal('privacy')}>Privacidad</button>
              </div>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">© 2026 DeliveryExpress Menegrande</p>
            </div>
          </footer>
          {showLegal && (
            <LegalModal isOpen={showLegal} onClose={() => setShowLegal(false)} initialTab={legalTab} />
          )}
        </div>
      </Suspense>
    ) : (
      <Auth onBack={() => setShowLogin(false)} />
    );
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

              <div className="h-8 w-[1px] bg-gray-100 hidden sm:block" />

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openLegal('about')}
                  className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                  title="Ayuda"
                >
                  <HelpCircle size={20} />
                </button>
                <button 
                  onClick={() => setShowProfile(true)}
                  className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                >
                  <Settings size={20} />
                </button>
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all relative"
                >
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
      <main className={`py-6 px-4 lg:px-6 pb-24 flex-1 w-full ${
        userData?.rol === 'cliente' ? 'max-w-4xl mx-auto' : 'max-w-screen-2xl mx-auto'
      }`}>
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={userData?.rol + activeMobileTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeMobileTab === 'home' && <HomeInformativo onStart={() => setActiveMobileTab('pedidos')} />}
              {activeMobileTab !== 'home' && (
                <>
                  {/* Seguridad: Solo admins ven la gestión total o usuarios */}
                  {userData?.rol === 'admin' && activeMobileTab === 'usuarios' && <AdminView activeTab="usuarios" />}
                  
                  {/* Vista principal según rol */}
                  {activeMobileTab === 'pedidos' && (
                    <>
                      {userData?.rol === 'admin' && <AdminView activeTab="pedidos" />}
                      {userData?.rol === 'motorizado' && <RepartidorView userData={userData} activeTab="pedidos" />}
                      {userData?.rol === 'cliente' && <ClienteView userData={userData} activeTab="pedidos" />}
                    </>
                  )}
                  
                  {/* Otros estados del móvil se manejan por defecto si no hay coincidencia */}
                  {activeMobileTab !== 'pedidos' && activeMobileTab !== 'usuarios' && (
                    <>
                      {userData?.rol === 'cliente' && <ClienteView userData={userData} activeTab={activeMobileTab} />}
                      {userData?.rol === 'motorizado' && <RepartidorView userData={userData} activeTab={activeMobileTab} />}
                      {userData?.rol === 'admin' && <AdminView activeTab={activeMobileTab} />}
                    </>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Mobile Navigation */}
      <MobileNav rol={userData?.rol || 'cliente'} onNavigate={(tab) => {
        if (tab === 'notificaciones') setShowNotifications(true);
        else if (tab === 'perfil') setShowProfile(true);
        else setActiveMobileTab(tab);
      }} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 lg:px-10 hidden md:block">
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
      
      {userData && showProfile && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          userData={userData} 
        />
      )}

      {showLegal && (
        <LegalModal 
          isOpen={showLegal} 
          onClose={() => setShowLegal(false)} 
          initialTab={legalTab} 
        />
      )}
      
      {showNotifications && (
        <NotificationsModal 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      )}
      {userData && (
        <ChatWidget currentUser={userData} />
      )}
    </div>
  );
}
