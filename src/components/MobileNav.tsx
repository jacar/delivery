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
      className="md:hidden fixed bottom-4 left-6 right-6 z-50 bg-white/70 backdrop-blur-2xl rounded-[2rem] p-1.5 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.1)] border border-white/50 flex justify-around items-center"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="p-3 rounded-2xl text-gray-500 hover:text-orange-500 transition-colors flex flex-col items-center gap-0.5"
        >
          <item.icon size={18} />
          <span className="text-[8px] font-black uppercase tracking-tight opacity-60">{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
}
