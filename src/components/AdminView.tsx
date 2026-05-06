import React, { useState, useEffect, useRef } from 'react';
import { listenTodosLosPedidos, listenUsuarios, actualizarRolUsuario, asignarPedido, crearUsuarioPersonal, actualizarEstadoPedido, deleteUsuario } from '../services/pedidoService';
import { Pedido, Usuario, UserRole } from '../types';
import { LayoutDashboard, Clock, CheckCircle2, Bike, Package, BarChart3, Users, TrendingUp, Shield, Store, User as UserIcon, MoreVertical, Loader2, Send, Edit2, UserPlus, Mail, Lock, Eye, EyeOff, Settings, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { playNotificationSound } from '../services/soundService';
import { motion, AnimatePresence } from 'motion/react';
import DriverModal from './DriverModal';
import UserModal from './UserModal';
import AliadosAdmin from './AliadosAdmin';
import MotoTaxiAdmin from './MotoTaxiAdmin';
import GeneralTarifasAdmin from './GeneralTarifasAdmin';
interface AdminViewProps {
  activeTab?: string;
}

export default function AdminView({ activeTab: propActiveTab }: AdminViewProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const [loadingPedido, setLoadingPedido] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<{ [pedidoId: string]: string }>({});
  const [editingDriver, setEditingDriver] = useState<Usuario | null>(null);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'pedidos' | 'usuarios' | 'registro' | 'aliados' | 'mototaxi' | 'general_tarifas' | 'mantenimiento'>('stats');

  useEffect(() => {
    if (propActiveTab) {
      const tabMap: { [key: string]: 'stats' | 'pedidos' | 'usuarios' | 'registro' | 'aliados' | 'mototaxi' | 'general_tarifas' | 'mantenimiento' } = {
        'home': 'stats',
        'pedidos': 'pedidos',
        'usuarios': 'usuarios',
        'registro': 'registro',
        'aliados': 'aliados',
        'mototaxi': 'mototaxi',
        'config': 'general_tarifas',
        'mantenimiento': 'mantenimiento'
      };
      if (tabMap[propActiveTab]) {
        setActiveTab(tabMap[propActiveTab]);
      }
    }
  }, [propActiveTab]);

  // Formulario de registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRol, setRegRol] = useState<UserRole>('motorizado');
  const [showPass, setShowPass] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanNombre = regNombre.trim();
    
    if (!cleanEmail || !regPass || !cleanNombre) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setRegLoading(true);
    try {
      await crearUsuarioPersonal(cleanEmail, regPass, cleanNombre, regRol);
      toast.success(`${regRol === 'admin' ? 'Administrador' : 'Repartidor'} registrado con éxito`);
      setRegNombre('');
      setRegEmail('');
      setRegPass('');
      setActiveTab('usuarios');
    } catch (error: any) {
      console.error(error);
      toast.error('Error al registrar personal: ' + (error.message || 'Error desconocido'));
    } finally {
      setRegLoading(false);
    }
  };

  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    enCamino: 0,
    entregados: 0
  });

  const prevIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const unsubPedidos = listenTodosLosPedidos((data) => {
      const currentIds = data.map(p => p.id);
      const newOrders = data.filter(p => !prevIdsRef.current.includes(p.id));
      
      if (prevIdsRef.current.length > 0 && newOrders.length > 0) {
        playNotificationSound();
        newOrders.forEach(p => toast.info(`Nuevo pedido: ${p.descripcion}`));
      }
      
      prevIdsRef.current = currentIds;
      setPedidos(data);
      setStats({
        total: data.length,
        disponibles: data.filter(p => p.estado === 'disponible').length,
        enCamino: data.filter(p => p.estado === 'en_camino' || p.estado === 'asignado').length,
        entregados: data.filter(p => p.estado === 'entregado').length
      });
    });

    const unsubUsuarios = listenUsuarios(setUsuarios);

    return () => {
      unsubPedidos();
      unsubUsuarios();
    };
  }, []);

  const [selectedUserForRole, setSelectedUserForRole] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRol: UserRole) => {
    setLoadingUser(userId);
    try {
      await actualizarRolUsuario(userId, newRol);
      toast.success(`Rol actualizado a ${newRol}`);
      setSelectedUserForRole(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el rol');
    } finally {
      setLoadingUser(null);
    }
  };

  const handleAsignarPedido = async (pedidoId: string) => {
    const motorizadoId = selectedDriver[pedidoId];
    if (!motorizadoId) return;

    const motorizado = usuarios.find(u => u.uid === motorizadoId);
    if (!motorizado) return;

    setLoadingPedido(pedidoId);
    try {
      await asignarPedido(pedidoId, motorizado.uid, motorizado.nombre, motorizado.telefono || '');
      toast.success(`Pedido asignado a ${motorizado.nombre}`);
    } catch (error) {
      console.error(error);
      toast.error('Error al asignar el pedido');
    } finally {
      setLoadingPedido(null);
    }
  };

  const handleActualizarEstadoPedido = async (pedidoId: string, nuevoEstado: any) => {
    setLoadingPedido(pedidoId);
    try {
      await actualizarEstadoPedido(pedidoId, nuevoEstado);
      toast.success('Estado del pedido actualizado por el Administrador');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el estado del pedido');
    } finally {
      setLoadingPedido(null);
    }
  };

  const handleEliminarPedido = async (pedidoId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido permanentemente?')) return;
    
    setLoadingPedido(pedidoId);
    try {
      await import('../services/pedidoService').then(s => s.eliminarPedido(pedidoId));
      toast.success('Pedido eliminado correctamente');
    } catch (e) {
      toast.error('Error al eliminar el pedido');
    } finally {
      setLoadingPedido(null);
    }
  };


  const handleLimpiarHistorial = async (tipo: 'orders' | 'messages' | 'notifications' | 'all') => {
    if (!window.confirm(`¿Estás seguro de que deseas limpiar ${tipo === 'all' ? 'TODO el historial' : 'los registros de ' + tipo}? Esta acción no se puede deshacer.`)) return;
    
    try {
      await import('../services/pedidoService').then(s => s.limpiarHistorial(tipo));
      toast.success('Limpieza completada correctamente');
    } catch (e) {
      toast.error('Error al limpiar el historial');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Se perderán todos sus datos.')) return;
    
    setLoadingUser(userId);
    try {
      await deleteUsuario(userId);
      setUsuarios(prev => prev.filter(u => u.uid !== userId));
      toast.success('Usuario eliminado correctamente');
    } catch (e: any) {
      const errorMsg = e.message || 'Error al eliminar el usuario';
      toast.error(`No se pudo eliminar: ${errorMsg}`);
    } finally {
      setLoadingUser(null);
    }
  };

  // Helper para disponibilidad dinámica
  const isMotorizadoOcupado = (uid: string) => {
    return pedidos.some(p => p.motorizado_id === uid && (p.estado === 'asignado' || p.estado === 'en_camino'));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium mt-2">Monitoreo global de Envío Express</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-100/50 rounded-[2rem] w-full md:w-fit">
          {[
            { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
            { id: 'pedidos', label: 'Pedidos', icon: Package },
            { id: 'usuarios', label: 'Usuarios', icon: Users },
            { id: 'aliados', label: 'Comercios', icon: Store },
            { id: 'mototaxi', label: 'Moto Taxi', icon: Bike },
            { id: 'general_tarifas', label: 'Tarifas', icon: Settings },
            { id: 'registro', label: 'Registrar', icon: UserPlus },
            { id: 'mantenimiento', label: 'Limpieza', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-[1.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all flex-1 md:flex-none justify-center md:justify-start ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
              }`}
            >
              <tab.icon size={14} className="shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Pedidos', value: stats.total, icon: Package, color: 'gray', trend: '+12%' },
                { label: 'Disponibles', value: stats.disponibles, icon: Clock, color: 'blue', trend: 'Libres' },
                { label: 'En Camino', value: stats.enCamino, icon: Bike, color: 'orange', trend: 'Activos' },
                { label: 'Entregados', value: stats.entregados, icon: CheckCircle2, color: 'green', trend: 'Hoy' }
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color === 'gray' ? 'slate' : stat.color}-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 bg-${stat.color === 'gray' ? 'slate' : stat.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                      <stat.icon className={`text-${stat.color === 'gray' ? 'slate' : stat.color}-600`} size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-end gap-3 mt-1">
                      <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                      <span className={`text-[10px] font-black text-${stat.color === 'gray' ? 'slate' : stat.color}-500 mb-1.5`}>{stat.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50">
                  <h3 className="text-xl font-black text-gray-900 mb-6">Actividad Reciente</h3>
                  <div className="space-y-4">
                    {pedidos.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Package className="text-gray-400" size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{p.descripcion}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          p.estado === 'entregado' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {p.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pedidos' && (
          <motion.div
            key="pedidos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Gestión de Pedidos</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-gray-500">En tiempo real</span>
              </div>
            </div>
            {/* Escritorio: Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asignación</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            p.tipo === 'compra' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{p.descripcion}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-bold text-gray-700">{p.cliente_nombre || 'Cliente'}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {p.cliente_id.slice(0, 6)}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          p.estado === 'disponible' ? 'bg-blue-100 text-blue-600' :
                          p.estado === 'asignado' ? 'bg-orange-100 text-orange-600' :
                          p.estado === 'en_camino' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="p-6">
                        {p.estado === 'disponible' ? (
                          <div className="flex items-center gap-2">
                            <select 
                              className="text-xs font-bold bg-gray-50 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-orange-500 outline-none"
                              value={selectedDriver[p.id] || ''}
                              onChange={(e) => setSelectedDriver({ ...selectedDriver, [p.id]: e.target.value })}
                            >
                              <option value="">Seleccionar...</option>
                              {usuarios.filter(u => u.rol === 'motorizado').map(u => (
                                <option key={u.uid} value={u.uid} disabled={isMotorizadoOcupado(u.uid)}>
                                  {u.nombre} {isMotorizadoOcupado(u.uid) ? '🟠' : '🟢'}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAsignarPedido(p.id)}
                              disabled={!selectedDriver[p.id] || loadingPedido === p.id}
                              className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all disabled:opacity-50"
                            >
                              {loadingPedido === p.id ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                              <img src={`https://picsum.photos/seed/${p.motorizado_id}/50/50`} alt="Motorizado" />
                            </div>
                            <p className="text-xs font-bold text-gray-600">{p.motorizado_nombre.split(' ')[0]}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => handleEliminarPedido(p.id)}
                          className="p-3 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Móvil: Tarjetas */}
            <div className="md:hidden divide-y divide-gray-50">
              {pedidos.map((p) => (
                <div key={p.id} className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        p.tipo === 'compra' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{p.descripcion}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      p.estado === 'disponible' ? 'bg-blue-100 text-blue-600' :
                      p.estado === 'asignado' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {p.estado}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 p-3 rounded-2xl">
                    <div className="space-y-1">
                      <p className="opacity-50">Cliente</p>
                      <p className="text-gray-700">{p.cliente_nombre || 'Cliente'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="opacity-50">Motorizado</p>
                      <p className="text-gray-700">{p.motorizado_nombre ? p.motorizado_nombre.split(' ')[0] : 'Pendiente'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {p.estado === 'disponible' ? (
                      <>
                        <select 
                          className="flex-1 text-xs font-bold bg-white border border-gray-100 rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                          value={selectedDriver[p.id] || ''}
                          onChange={(e) => setSelectedDriver({ ...selectedDriver, [p.id]: e.target.value })}
                        >
                          <option value="">Asignar...</option>
                          {usuarios.filter(u => u.rol === 'motorizado').map(u => (
                            <option key={u.uid} value={u.uid} disabled={isMotorizadoOcupado(u.uid)}>
                              {u.nombre}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAsignarPedido(p.id)}
                          disabled={!selectedDriver[p.id] || loadingPedido === p.id}
                          className="p-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-100 disabled:opacity-50"
                        >
                          <Send size={18} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleActualizarEstadoPedido(p.id, 'entregado')}
                        className="flex-1 py-3 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-100"
                      >
                        Forzar Entrega
                      </button>
                    )}
                    <button 
                      onClick={() => handleEliminarPedido(p.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl border border-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'usuarios' && (
          <motion.div
            key="usuarios"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden"
          >
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Gestión de Usuarios</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Repartidores</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Info Adicional</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {usuarios.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            <img 
                              src={u.fotoUrl || `https://picsum.photos/seed/${u.uid}/100/100`} 
                              alt="User" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer" 
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{u.nombre}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {u.uid.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.rol === 'admin' ? 'bg-purple-100 text-purple-600' :
                          u.rol === 'motorizado' ? 'bg-blue-100 text-blue-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-6">
                        {u.rol === 'motorizado' ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const ocupado = isMotorizadoOcupado(u.uid);
                                return (
                                  <>
                                    <div className={`w-2 h-2 rounded-full ${ocupado ? 'bg-orange-500' : (u.disponible ? 'bg-green-500 animate-pulse' : 'bg-gray-300')}`} />
                                    <p className="text-xs font-bold text-gray-700">
                                      {ocupado ? 'Ocupado' : (u.disponible ? 'Online' : 'Offline')}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                            <p className="text-xs font-medium text-gray-500">{u.tipoVehiculo || 'Sin vehículo'}</p>
                            {u.placaVehiculo && (
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.placaVehiculo}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">N/A</p>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {u.rol === 'motorizado' && (
                            <button 
                              onClick={() => {
                                setEditingDriver(u);
                                setIsDriverModalOpen(true);
                              }}
                              className="p-2 hover:bg-orange-50 rounded-xl transition-colors text-orange-400 hover:text-orange-600"
                              title="Editar Perfil de Repartidor"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          <div className="relative">
                            <button 
                              onClick={() => setSelectedUserForRole(selectedUserForRole === u.uid ? null : u.uid)}
                              disabled={loadingUser === u.uid}
                              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
                            >
                              {loadingUser === u.uid ? <Loader2 size={16} className="animate-spin" /> : <MoreVertical size={16} />}
                            </button>
                            
                            {selectedUserForRole === u.uid && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2">
                                <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">
                                  Cambiar Rol
                                </div>
                                {(['cliente', 'motorizado', 'admin'] as UserRole[]).map(role => (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(u.uid, role)}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg ${u.rol === role ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 text-gray-600'}`}
                                  >
                                    {role.toUpperCase()}
                                  </button>
                                ))}
                                <div className="border-t border-gray-50 mt-2 pt-2">
                                  <button
                                    onClick={() => {
                                      setEditingUser(u);
                                      setIsUserModalOpen(true);
                                      setSelectedUserForRole(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold rounded-lg hover:bg-gray-50 text-gray-600 flex items-center gap-2"
                                  >
                                    Editar Usuario
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteUser(u.uid);
                                      setSelectedUserForRole(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                                  >
                                    <X size={14} />
                                    Eliminar Usuario
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Móvil */}
            <div className="md:hidden divide-y divide-gray-100 bg-gray-50/50">
              {usuarios.map((u) => (
                <div key={u.uid} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-sm shrink-0">
                        <img 
                          src={u.fotoUrl || `https://picsum.photos/seed/${u.uid}/100/100`} 
                          alt="User" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{u.nombre}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {u.uid.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      u.rol === 'admin' ? 'bg-purple-100 text-purple-600' :
                      u.rol === 'motorizado' ? 'bg-blue-100 text-blue-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {u.rol}
                    </span>
                  </div>

                  {u.rol === 'motorizado' && (
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isMotorizadoOcupado(u.uid) ? 'bg-orange-500' : (u.disponible ? 'bg-green-500 animate-pulse' : 'bg-gray-300')}`} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">
                          {isMotorizadoOcupado(u.uid) ? 'Ocupado' : (u.disponible ? 'Online' : 'Offline')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{u.tipoVehiculo || 'S/V'}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {u.rol === 'motorizado' && (
                      <button 
                        onClick={() => { setEditingDriver(u); setIsDriverModalOpen(true); }}
                        className="flex-1 py-3 bg-white border border-gray-100 text-orange-500 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Edit2 size={14} />
                        <span className="text-[10px] font-black uppercase">Perfil</span>
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedUserForRole(selectedUserForRole === u.uid ? null : u.uid)}
                      className="flex-1 py-3 bg-gray-900 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                    >
                      <MoreVertical size={14} />
                      <span className="text-[10px] font-black uppercase">Acciones</span>
                    </button>
                  </div>

                  {selectedUserForRole === u.uid && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-white rounded-2xl border border-gray-100 p-2 space-y-1 shadow-inner"
                    >
                      <p className="px-3 py-2 text-[9px] font-black text-gray-400 uppercase border-b border-gray-50">Gestionar Usuario</p>
                      <div className="grid grid-cols-3 gap-1">
                        {(['cliente', 'motorizado', 'admin'] as UserRole[]).map(role => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(u.uid, role)}
                            className={`py-2 text-[9px] font-black rounded-lg uppercase ${u.rol === role ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1 pt-1">
                        <button
                          onClick={() => { setEditingUser(u); setIsUserModalOpen(true); setSelectedUserForRole(null); }}
                          className="flex-1 py-2.5 bg-gray-50 text-gray-600 text-[9px] font-black rounded-lg uppercase"
                        >
                          Editar Datos
                        </button>
                        <button
                          onClick={() => { handleDeleteUser(u.uid); setSelectedUserForRole(null); }}
                          className="flex-1 py-2.5 bg-red-50 text-red-600 text-[9px] font-black rounded-lg uppercase"
                        >
                          Eliminar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'registro' && (
          <motion.div
            key="registro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50 space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="text-orange-600" size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Registrar Nuevo Personal</h2>
                <p className="text-gray-400 font-medium">Crea credenciales para administradores o repartidores</p>
              </div>

              <form onSubmit={handleRegisterStaff} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Rol Asignado</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRegRol('motorizado')}
                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                          regRol === 'motorizado' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-transparent text-gray-400'
                        }`}
                      >
                        Repartidor
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRol('admin')}
                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                          regRol === 'admin' ? 'bg-purple-50 border-purple-500 text-purple-600' : 'bg-gray-50 border-transparent text-gray-400'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                      placeholder="personal@envioexpress.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Contraseña Temporal</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {regLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                  Crear Cuenta de Personal
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'aliados' && (
          <motion.div
            key="aliados"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <AliadosAdmin />
          </motion.div>
        )}

        {activeTab === 'mototaxi' && (
          <motion.div
            key="mototaxi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <MotoTaxiAdmin />
          </motion.div>
        )}
        {activeTab === 'general_tarifas' && (
          <motion.div
            key="general_tarifas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <GeneralTarifasAdmin />
          </motion.div>
        )}
        {activeTab === 'mantenimiento' && (
          <motion.div
            key="mantenimiento"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-6 pb-20"
          >
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Shield className="text-red-600" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Mantenimiento de Datos</h2>
                  <p className="text-gray-400 font-medium text-sm">Limpia el historial y mantén el sistema ágil</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                      <Package className="text-gray-400" size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Limpiar Pedidos</h3>
                    <p className="text-xs text-gray-500 mb-6">Elimina todos los registros de pedidos. Ideal para iniciar un nuevo día o semana.</p>
                  </div>
                  <button 
                    onClick={() => handleLimpiarHistorial('orders')}
                    className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                  >
                    Borrar Historial de Pedidos
                  </button>
                </div>

                <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Limpiar Mensajes</h3>
                    <p className="text-xs text-gray-500 mb-6">Elimina todas las conversaciones y mensajes de soporte del sistema.</p>
                  </div>
                  <button 
                    onClick={() => handleLimpiarHistorial('messages')}
                    className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                  >
                    Borrar Historial de Chat
                  </button>
                </div>

                <div className="p-10 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col justify-between md:col-span-2 mt-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-red-900 mb-2">Reinicio Maestro</h3>
                    <p className="text-sm text-red-600/70 mb-8 max-w-md">Elimina pedidos, mensajes y notificaciones. Los usuarios y comercios se conservan. Esta acción es irreversible.</p>
                    <button 
                      onClick={() => handleLimpiarHistorial('all')}
                      className="w-full py-5 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl shadow-red-200"
                    >
                      LIMPIAR TODO EL SISTEMA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DriverModal 
        isOpen={isDriverModalOpen}
        onClose={() => {
          setIsDriverModalOpen(false);
          setEditingDriver(null);
        }}
        driver={editingDriver}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
      />
    </div>
  );
}
