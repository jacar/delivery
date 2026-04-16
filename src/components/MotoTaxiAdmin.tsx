import React, { useState, useEffect } from 'react';
import { TarifaMotoTaxi } from '../types';
import { getTarifasMotoTaxi, crearTarifaMotoTaxi, actualizarTarifaMotoTaxi, eliminarTarifaMotoTaxi } from '../services/pedidoService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Bike, DollarSign, ToggleLeft, ToggleRight, X, Loader2, Tag } from 'lucide-react';

interface FormState {
  nombre: string;
  descripcion: string;
  precio: string;
  activo: boolean;
}

const emptyForm: FormState = {
  nombre: '',
  descripcion: '',
  precio: '',
  activo: true,
};

export default function MotoTaxiAdmin() {
  const [tarifas, setTarifas] = useState<TarifaMotoTaxi[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cargarTarifas = async () => {
    const data = await getTarifasMotoTaxi();
    setTarifas(data);
  };

  useEffect(() => {
    cargarTarifas();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (tarifa: TarifaMotoTaxi) => {
    setEditingId(tarifa.id);
    setForm({
      nombre: tarifa.nombre,
      descripcion: tarifa.descripcion || '',
      precio: String(tarifa.precio),
      activo: tarifa.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(form.precio);
    if (!form.nombre.trim() || isNaN(precio) || precio < 0) {
      toast.error('Completa todos los campos correctamente');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await actualizarTarifaMotoTaxi(editingId, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio,
          activo: form.activo,
        });
        toast.success('Tarifa actualizada');
      } else {
        await crearTarifaMotoTaxi({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          precio,
          activo: form.activo,
        });
        toast.success('Tarifa creada exitosamente');
      }
      await cargarTarifas();
      setShowModal(false);
    } catch {
      toast.error('Error al guardar la tarifa');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (tarifa: TarifaMotoTaxi) => {
    try {
      await actualizarTarifaMotoTaxi(tarifa.id, { activo: !tarifa.activo });
      await cargarTarifas();
      toast.success(`Tarifa ${!tarifa.activo ? 'activada' : 'desactivada'}`);
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await eliminarTarifaMotoTaxi(id);
      await cargarTarifas();
      toast.success('Tarifa eliminada');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center">
              <Bike className="text-violet-600" size={20} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Tarifas de Moto Taxi</h2>
          </div>
          <p className="text-gray-400 font-medium text-sm ml-[52px]">
            Gestiona las tarifas que verán los clientes al solicitar el servicio
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={openCreate}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-200 transition-all"
        >
          <Plus size={18} /> Nueva Tarifa
        </motion.button>
      </div>

      {/* Tarifas Grid */}
      {tarifas.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bike className="text-violet-300" size={36} />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">Sin tarifas configuradas</h3>
          <p className="text-gray-400 font-medium text-sm mb-6">
            Crea la primera tarifa para que los clientes puedan solicitar Moto Taxi
          </p>
          <button
            onClick={openCreate}
            className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-violet-700 transition-all"
          >
            Crear Primera Tarifa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tarifas.map((tarifa, i) => (
              <motion.div
                key={tarifa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-white rounded-[2rem] border-2 p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden ${
                  tarifa.activo ? 'border-violet-100' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Decorative blob */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${tarifa.activo ? 'bg-violet-50' : 'bg-gray-50'}`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${tarifa.activo ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Tag size={20} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActivo(tarifa)}
                        className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
                        title={tarifa.activo ? 'Desactivar' : 'Activar'}
                      >
                        {tarifa.activo
                          ? <ToggleRight className="text-violet-600" size={22} />
                          : <ToggleLeft className="text-gray-400" size={22} />
                        }
                      </button>
                      <button
                        onClick={() => openEdit(tarifa)}
                        className="p-2 rounded-xl hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(tarifa.id)}
                        disabled={deletingId === tarifa.id}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === tarifa.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <Trash2 size={16} />
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-gray-900 leading-tight">{tarifa.nombre}</h3>
                    {tarifa.descripcion && (
                      <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">{tarifa.descripcion}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <DollarSign size={14} className="text-violet-500" />
                      <span className="text-2xl font-black text-violet-600">{Number(tarifa.precio).toFixed(2)}</span>
                      <span className="text-xs font-bold text-gray-400">USD</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      tarifa.activo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {tarifa.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-violet-100 rounded-2xl flex items-center justify-center">
                    <Bike className="text-violet-600" size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      {editingId ? 'Editar Tarifa' : 'Nueva Tarifa'}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">Moto Taxi</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Nombre de la Tarifa *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    placeholder="Ej: Dentro de la ciudad, Zona Especial..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl font-medium text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all min-h-[80px] resize-none"
                    placeholder="Ej: Aplica para rutas dentro del área urbana..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Precio (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.50"
                      value={form.precio}
                      onChange={e => setForm({ ...form, precio: e.target.value })}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-2xl font-black text-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-gray-700">Tarifa Activa</p>
                    <p className="text-xs text-gray-400 font-medium">Solo las tarifas activas se muestran a los clientes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, activo: !form.activo })}
                    className="flex-shrink-0"
                  >
                    {form.activo
                      ? <ToggleRight className="text-violet-600" size={36} />
                      : <ToggleLeft className="text-gray-400" size={36} />
                    }
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {editingId ? 'Guardar Cambios' : 'Crear Tarifa'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
