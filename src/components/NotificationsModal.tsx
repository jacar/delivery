import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle2, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getNotifications, markAsRead, clearNotifications, Notification } from '../services/notificationService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function NotificationsModal({ isOpen, onClose, userId }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const handleMarkAsRead = async (id: string | number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('¿Deseas limpiar todas las notificaciones?')) return;
    try {
      await clearNotifications(userId);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Bell className="text-orange-500" size={24} /> Notificaciones
              </h2>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Limpiar todo"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-orange-100 border-t-orange-500 rounded-full"
                  />
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-gray-300" size={32} />
                  </div>
                  <p className="text-gray-400 font-bold">No tienes notificaciones nuevas</p>
                  <p className="text-gray-300 text-xs mt-1">Te avisaremos cuando haya actualizaciones.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-5 rounded-3xl border transition-all ${
                        notif.leido 
                          ? 'bg-gray-50/50 border-gray-100' 
                          : 'bg-white border-orange-100 shadow-sm shadow-orange-500/5'
                      }`}
                      onClick={() => !notif.leido && handleMarkAsRead(notif.id)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className={`text-sm font-black mb-1 ${notif.leido ? 'text-gray-500' : 'text-gray-900'}`}>
                            {notif.titulo}
                          </h4>
                          <p className={`text-xs leading-relaxed ${notif.leido ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notif.mensaje}
                          </p>
                          <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                            <Clock size={12} />
                            {format(new Date(notif.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                          </div>
                        </div>
                        {!notif.leido && (
                          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5 shadow-lg shadow-orange-500/40" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
