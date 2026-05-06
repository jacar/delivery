import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import ProfileModal from './components/ProfileModal';
import NotificationsModal from './components/NotificationsModal';
import LegalModal from './components/LegalModal';
import { getNotifications } from './services/notificationService';
import MobileNav from './components/MobileNav';
import { Toaster, toast } from 'sonner';
import { LogOut, HelpCircle, Bell, Settings, ShieldCheck } from 'lucide-react';
import { UserRole } from './types';
import { motion, AnimatePresence } from 'motion/react';
import ChatWidget from './components/ChatWidget';
import { actualizarRolUsuario } from './services/pedidoService';
import { playNotificationSound } from './services/soundService';
import { useRef } from 'react';

// Lazy load views for performance
const ClienteView = lazy(() => import('./components/ClienteView'));
const RepartidorView = lazy(() => import('./components/RepartidorView'));
const AdminView = lazy(() => import('./components/AdminView'));
const HomeInformativo = lazy(() => import('./components/HomeInformativo'));
const AliadoView = lazy(() => import('./components/AliadoView'));

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
  const [showChat, setShowChat] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [legalTab, setLegalTab] = useState<'about' | 'terms' | 'privacy' | 'returns'>('about');
  const [hasUnread, setHasUnread] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const hasDismissed = localStorage.getItem('installPromptDismissed');
      if (!hasDismissed) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);
  const [unreadMsgSourceIds, setUnreadMsgSourceIds] = useState<string[]>([]);
  const lastNotifIds = useRef<string[]>([]);

  const openLegal = (tab: 'about' | 'terms' | 'privacy' | 'returns') => {
    setLegalTab(tab);
    setShowLegal(true);
  };



  // Polling para notificaciones no leídas
  useEffect(() => {
    if (!userData?.uid) return;

    const checkNotifications = async () => {
      try {
        const notifs = await getNotifications(userData.uid);
        const unread = notifs.filter(n => !n.leido);
        setHasUnread(unread.length > 0);
        
        const unreadMsgs = unread.filter(n => n.tipo === 'mensaje');
        setHasUnreadMessages(unreadMsgs.length > 0);
        
        // Extraer IDs de remitentes de los mensajes no leídos (asumiendo que están en el título o mensaje)
        // O mejor, el backend podría enviar el source_id. Por ahora, trataremos de inferirlo o simplemente marcar que hay mensajes.
        setUnreadMsgSourceIds(unreadMsgs.map(n => n.titulo.split(':').pop()?.trim() || ''));

        // Detectar si hay notificaciones realmente nuevas (IDs que no estaban antes)
        const currentIds = unread.map(n => n.id.toString());
        const newNotifs = unread.filter(n => !lastNotifIds.current.includes(n.id.toString()));

        if (newNotifs.length > 0 && lastNotifIds.current.length > 0) {
          // Play sound and show toast for new notifications
          playNotificationSound();
          newNotifs.forEach(n => {
            toast.info(n.titulo || "Nueva notificación", { 
              description: n.mensaje || "Tienes un nuevo mensaje de soporte",
              duration: 5000 
            });
          });
        }

        lastNotifIds.current = currentIds;
      } catch (e) {
        console.error('Error checking notifications:', e);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 7000); // Cada 7s para mayor agilidad
    return () => clearInterval(interval);
  }, [userData?.uid]);

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
          <main className="w-full overflow-hidden">
            <HomeInformativo onStart={() => setShowLogin(true)} />
          </main>
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
                  src={`${import.meta.env.BASE_URL}banners/bg-7.webp`} 
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
                  {hasUnread && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                  )}
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
      <main className={`py-6 px-4 lg:px-6 pb-24 flex-1 w-full overflow-x-hidden ${
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
              {(() => {
                if (userData?.rol === 'aliado') return <AliadoView />;
                if (activeMobileTab === 'home' && userData?.rol === 'cliente') return <HomeInformativo onStart={() => setActiveMobileTab('pedidos')} />;
                
                if (userData?.rol === 'admin') return <AdminView activeTab={activeMobileTab} />;
                if (userData?.rol === 'motorizado') return <RepartidorView userData={userData} activeTab={activeMobileTab} />;
                if (userData?.rol === 'cliente') return <ClienteView userData={userData} activeTab={activeMobileTab} />;
                
                return null;
              })()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Mobile Navigation */}
      <MobileNav 
        rol={userData?.rol || 'cliente'} 
        hasUnreadChat={hasUnreadMessages}
        onNavigate={(tab) => {
          if (tab === 'notificaciones') setShowNotifications(true);
          else if (tab === 'perfil') setShowProfile(true);
          else if (tab === 'chat') setShowChat(true);
          else {
            setActiveMobileTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }} 
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 lg:px-10 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center">
            <img src={`${import.meta.env.BASE_URL}banners/bg-7.webp`} alt="Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
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
      
      {showNotifications && userData && (
        <NotificationsModal 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
          userId={userData.uid}
        />
      )}
      {userData && (
        <ChatWidget 
          currentUser={userData} 
          hasUnread={hasUnreadMessages} 
          unreadSourceIds={unreadMsgSourceIds}
          isOpen={showChat}
          onToggle={setShowChat}
        />
      )}

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-10 left-6 right-6 md:left-auto md:right-10 md:w-96 z-[100] bg-gray-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center gap-6 border border-white/10 backdrop-blur-xl"
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-3 shadow-xl">
              <img 
                src={`${import.meta.env.BASE_URL}icono_pwa.png`} 
                alt="App Icon" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h4 className="text-xl font-black tracking-tight">DeliveryExpress</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2 px-4 leading-relaxed">
                Instala la aplicación en tu escritorio para una mejor experiencia y acceso rápido.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => { setShowInstallPrompt(false); localStorage.setItem('installPromptDismissed', 'true'); }}
                className="flex-1 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Más tarde
              </button>
              <button 
                onClick={async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                      setShowInstallPrompt(false);
                      localStorage.setItem('installPromptDismissed', 'true');
                    }
                  }
                }}
                className="flex-1 px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                Instalar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
