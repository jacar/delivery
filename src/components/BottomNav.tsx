import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Clock, Users, Store, Bike, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: string;
}

export default function BottomNav({ activeTab, setActiveTab, role }: BottomNavProps) {
  const adminTabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'pedidos', icon: Clock, label: 'Pedidos' },
    { id: 'usuarios', icon: Users, label: 'Usuarios' },
    { id: 'aliados', icon: Store, label: 'Aliados' },
    { id: 'mantenimiento', icon: Settings, label: 'Admin' }
  ];

  const clientTabs = [
    { id: 'home', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'pedidos', icon: Clock, label: 'Mis Pedidos' },
    { id: 'mototaxi', icon: Bike, label: 'MotoTaxi' }
  ];

  const driverTabs = [
    { id: 'pedidos', icon: Clock, label: 'Pedidos' },
    { id: 'perfil', icon: Users, label: 'Perfil' }
  ];

  const tabs = role === 'admin' ? adminTabs : (role === 'motorizado' ? driverTabs : clientTabs);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-3 pb-8 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 relative group"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 -translate-y-1' : 'text-gray-400'
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${
                isActive ? 'text-orange-500 scale-100' : 'text-gray-400 scale-90'
              }`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-orange-500 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
