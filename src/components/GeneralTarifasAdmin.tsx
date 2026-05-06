import React, { useState, useEffect } from 'react';
import { getTarifasGenerales, guardarTarifaGeneral } from '../services/pedidoService';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Settings, DollarSign, Loader2, Save, ShoppingCart, Package } from 'lucide-react';

export default function GeneralTarifasAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [precios, setPrecios] = useState({
    compra: '0',
    recoleccion: '0'
  });

  useEffect(() => {
    const load = async () => {
      const data = await getTarifasGenerales();
      setPrecios({
        compra: String(data.compra?.precio || '0'),
        recoleccion: String(data.recoleccion?.precio || '0')
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (tipo: 'compra' | 'recoleccion') => {
    setSaving(true);
    try {
      const p = parseFloat(precios[tipo]);
      if (isNaN(p)) throw new Error('Precio inválido');
      await guardarTarifaGeneral(tipo, p);
      toast.success(`Precio de ${tipo} actualizado correctamente`);
    } catch (e: any) {
      toast.error('Error al guardar: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-gray-400 font-bold">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100/50">
          <Settings className="text-orange-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Tarifas Generales</h2>
          <p className="text-gray-400 font-medium text-sm">Configura los precios base para servicios que no son Moto Taxi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* COMPRAS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl">
              <ShoppingCart size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Base Compras</span>
          </div>
          
          <div>
            <h3 className="text-lg font-black text-gray-900">Servicio de Compra</h3>
            <p className="text-xs text-gray-400 mt-1">Precio que se cobrará al cliente por gestionar una compra (aliados o externa)</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                type="number"
                value={precios.compra}
                onChange={(e) => setPrecios({ ...precios, compra: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xl font-black text-gray-900 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            
            <button
              onClick={() => handleSave('compra')}
              disabled={saving}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar Precio Compra
            </button>
          </div>
        </motion.div>

        {/* RECOLECCION */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <Package size={24} />
            </div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Base Envío</span>
          </div>
          
          <div>
            <h3 className="text-lg font-black text-gray-900">Servicio de Recolección</h3>
            <p className="text-xs text-gray-400 mt-1">Precio para recoger un paquete y entregarlo en otro punto</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                type="number"
                value={precios.recoleccion}
                onChange={(e) => setPrecios({ ...precios, recoleccion: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-xl font-black text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            
            <button
              onClick={() => handleSave('recoleccion')}
              disabled={saving}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Guardar Precio Recolección
            </button>
          </div>
        </motion.div>
      </div>

      <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100">
        <p className="text-xs font-medium text-orange-800 leading-relaxed">
          <strong>Nota:</strong> Estos precios se aplicarán a todas las nuevas órdenes iniciadas por los usuarios. 
          Los cambios se sincronizan en tiempo real con la aplicación del cliente.
        </p>
      </div>
    </div>
  );
}
