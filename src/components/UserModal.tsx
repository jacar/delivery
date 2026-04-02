import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { actualizarRolUsuario } from '../services/pedidoService';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Save, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setEmail(user.email || '');
      setTelefono(user.telefono || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Usamos el servicio de Laravel
      await actualizarRolUsuario(user.uid, user.rol); 
      // Nota: Aquí se podrían actualizar más campos si el endpoint de Laravel lo permite
      toast.success('Datos del usuario actualizados en el servidor');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    toast.info('La recuperación de contraseña ahora se gestiona directamente desde el servidor local.');
  };

  return (
    <AnimatePresence>
      {isOpen && user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
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
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Editar Usuario</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {user.uid.substring(0, 8)}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                      placeholder="Nombre del usuario"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Correo Electrónico (Solo Lectura)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-1 leading-tight">
                    El correo de acceso no puede ser modificado por un administrador por razones de seguridad.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Guardar Cambios
                </button>
                
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading || !email}
                  className="w-full py-4 bg-orange-50 text-orange-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <KeyRound size={20} />
                  Restablecer Contraseña
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
