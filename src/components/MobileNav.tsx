import React from 'react';
import { LayoutDashboard, Package, User, Bell, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavProps {
  rol: string;
  onNavigate: (tab: string) => void;
}

export default function MobileNav({ rol, onNavigate }: MobileNavProps) {
  const navItems = [
    ...(rol === 'cliente' ? [{ id: 'home', icon: LayoutDashboard, label: 'Inicio' }] : []),
    { id: 'pedidos', icon: Package, label: rol === 'admin' ? 'Gestión' : (rol === 'motorizado' ? 'Pool' : 'Mis Pedidos') },
    ...(rol === 'admin' ? [{ id: 'usuarios', icon: User, label: 'Usuarios' }] : []),
    { id: 'notificaciones', icon: Bell, label: 'Alertas' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="md:hidden fixed bottom-6 left-4 right-4 z-50 bg-gray-900/95 backdrop-blur-lg rounded-[2rem] p-2 shadow-2xl border border-white/10 flex justify-around items-center"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="p-4 rounded-2xl text-gray-400 hover:text-orange-500 transition-colors flex flex-col items-center gap-1"
        >
          <item.icon size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
}
