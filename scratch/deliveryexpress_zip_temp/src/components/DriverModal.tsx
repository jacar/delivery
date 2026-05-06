import React, { useState, useEffect } from 'react';
import { Usuario } from '../types';
import { actualizarDatosUsuario } from '../services/pedidoService';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Truck, CreditCard, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Usuario | null;
}

export default function DriverModal({ isOpen, onClose, driver }: DriverModalProps) {
  const [nombre, setNombre] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [documentoId, setDocumentoId] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driver) {
      setNombre(driver.nombre || '');
      setTipoVehiculo(driver.tipoVehiculo || '');
      setDocumentoId(driver.documentoId || '');
      setFotoUrl(driver.fotoUrl || '');
    }
  }, [driver]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;

    setLoading(true);
    try {
      await actualizarDatosUsuario(driver.uid, {
        nombre,
        tipoVehiculo,
        documentoId,
        fotoUrl
      });
      toast.success('Datos del repartidor actualizados');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && driver && (
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
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Perfil del Repartidor</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {driver.uid.substring(0, 8)}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] bg-gray-100 overflow-hidden border-4 border-white shadow-xl">
                    <img 
                      src={fotoUrl || `https://picsum.photos/seed/${driver.uid}/200/200`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                    <ImageIcon size={16} />
                  </div>
                </div>
              </div>

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
                      placeholder="Nombre del repartidor"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Tipo de Vehículo</label>
                    <div className="relative">
                      <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={tipoVehiculo}
                        onChange={(e) => setTipoVehiculo(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                        placeholder="Moto, Carro..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Documento ID</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={documentoId}
                        onChange={(e) => setDocumentoId(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                        placeholder="Cédula / DNI"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">URL de Foto</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={fotoUrl}
                      onChange={(e) => setFotoUrl(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Guardar Cambios
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
