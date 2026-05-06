import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, ChevronLeft, ShieldCheck, Search, Package } from 'lucide-react';
import { Usuario, Mensaje, Pedido } from '../types';
import { listenMensajes, enviarMensaje, listenUsuarios, listenMisPedidosCliente, listenMisPedidosMotorizado } from '../services/pedidoService';
import { playChatSound } from '../services/soundService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWidgetProps {
  currentUser: Usuario;
  hasUnread?: boolean;
  unreadSourceIds?: string[];
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  currentUser, 
  hasUnread, 
  unreadSourceIds = [],
  isOpen,
  onToggle
}) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conductores, setConductores] = useState<Usuario[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatName, setSelectedChatName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMsgIdsRef = useRef<string[]>([]);

  const isAdmin = currentUser.rol === 'admin';
  const isMotorizado = currentUser.rol === 'motorizado';
  const isCliente = currentUser.rol === 'cliente';

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        const unsubUsers = listenUsuarios((usuarios) => {
          setConductores(usuarios.filter(u => u.rol === 'motorizado'));
          setClientes(usuarios.filter(u => u.rol === 'cliente'));
        });
        const unsubPedidos = listenMisPedidosMotorizado('all', (allPedidos) => {
           setPedidos(allPedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado'));
        });
        return () => { unsubUsers(); unsubPedidos(); };
      } else if (isMotorizado) {
        const unsubscribe = listenMisPedidosMotorizado(currentUser.uid, (allPedidos) => {
          setPedidos(allPedidos.filter(p => p.estado === 'asignado' || p.estado === 'en_camino'));
        });
        return () => unsubscribe();
      } else if (isCliente) {
        const unsubscribe = listenMisPedidosCliente(currentUser.uid, (allPedidos) => {
          setPedidos(allPedidos.filter(p => p.estado === 'asignado' || p.estado === 'en_camino'));
        });
        return () => unsubscribe();
      }
    }
  }, [isAdmin, isMotorizado, isCliente, isOpen, currentUser.uid]);

  useEffect(() => {
    if (selectedChatId && isOpen) {
      const unsubscribe = listenMensajes(selectedChatId, (msgs) => {
        const currentIds = msgs.map(m => m.id.toString());
        const newMsgs = msgs.filter(m => !prevMsgIdsRef.current.includes(m.id.toString()));
        
        // Si hay mensajes nuevos y no son míos, sonar la campana
        if (newMsgs.length > 0 && prevMsgIdsRef.current.length > 0) {
          const hasIncoming = newMsgs.some(m => {
            const rid = m.remitenteId || (m as any).remitente_id;
            return rid !== currentUser.uid;
          });
          if (hasIncoming) {
            playChatSound();
          }
        }
        
        prevMsgIdsRef.current = currentIds;
        setMensajes(msgs);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      return () => unsubscribe();
    }
  }, [selectedChatId, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !selectedChatId) return;

    await enviarMensaje(selectedChatId, currentUser.uid, currentUser.nombre, nuevoMensaje.trim());
    setNuevoMensaje('');
  };

  return (
    <>
      {/* Floating Button (Only desktop) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggle(true)}
        className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-full shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] flex items-center justify-center z-[60] hover:scale-110 active:scale-95 transition-all duration-300 group"
      >
        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-4 border-white flex items-center justify-center animate-bounce shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-[130px] md:bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-96 h-[500px] max-h-[calc(100vh-250px)] bg-white rounded-2xl shadow-2xl flex flex-col z-[70] overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 flex items-center justify-between shadow-xl z-10">
              <div className="flex items-center gap-4">
                {selectedChatId && (
                  <button onClick={() => setSelectedChatId(null)} className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight">
                    {selectedChatId ? selectedChatName : 'Mensajería'}
                  </h3>
                  <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest opacity-80">
                    {selectedChatId ? '• En línea ahora' : 'Canal oficial'}
                  </p>
                </div>
              </div>
              <button onClick={() => onToggle(false)} className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50 overflow-y-auto flex flex-col">
              {!selectedChatId ? (
                <div className="p-2">
                  {isAdmin && (
                    <div className="px-2 pb-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Buscar usuario o pedido..."
                          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs outline-none focus:border-orange-500 transition-colors"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {isAdmin && (
                    <>
                      {/* Pedidos Activos */}
                      {pedidos.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pedidos en Curso</div>
                          {pedidos.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase())).map(pedido => (
                            <button
                              key={pedido.id}
                              onClick={() => {
                                setSelectedChatId(pedido.id);
                                setSelectedChatName(`Pedido #${pedido.id.substring(0, 6)}`);
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100 mb-1"
                            >
                              <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                                <Package size={20} />
                              </div>
                              <div className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-900 text-sm">Pedido #{pedido.id.substring(0, 6)}</p>
                                  {unreadSourceIds.some(id => pedido.id.includes(id)) && (
                                    <span className="px-1.5 py-0.5 bg-red-500 text-[8px] text-white font-black uppercase rounded-full animate-pulse">Nuevo</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">{pedido.cliente_nombre} • {pedido.estado}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}

                      <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Repartidores</div>
                      {conductores.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(conductor => (
                        <button
                          key={conductor.uid}
                          onClick={() => {
                            setSelectedChatId(conductor.uid);
                            setSelectedChatName(`Rep: ${conductor.nombre}`);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100 mb-1"
                        >
                          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                            {conductor.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-sm">{conductor.nombre}</p>
                              {unreadSourceIds.some(id => conductor.nombre.includes(id) || conductor.uid.includes(id)) && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-[8px] text-white font-black uppercase rounded-full animate-pulse">Nuevo</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{conductor.placaVehiculo || 'Repartidor'}</p>
                          </div>
                        </button>
                      ))}

                      <div className="px-3 py-2 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clientes</div>
                      {clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(cliente => (
                        <button
                          key={cliente.uid}
                          onClick={() => {
                            setSelectedChatId(cliente.uid);
                            setSelectedChatName(`Cli: ${cliente.nombre}`);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100 mb-1"
                        >
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {cliente.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-sm">{cliente.nombre}</p>
                              {unreadSourceIds.some(id => cliente.nombre.includes(id) || cliente.uid.includes(id)) && (
                                <span className="px-1.5 py-0.5 bg-red-500 text-[8px] text-white font-black uppercase rounded-full animate-pulse">Nuevo</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{cliente.email || 'Cliente'}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  
                  {(isMotorizado || isCliente) && (
                    <button
                      onClick={() => {
                        setSelectedChatId(currentUser.uid); // Usar propio UID para canal de soporte con Admin
                        setSelectedChatName('Soporte Admin');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100 mb-2 shadow-sm bg-orange-50/50"
                    >
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">Soporte Admin</p>
                          {hasUnread && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-[8px] text-white font-black uppercase rounded-full animate-pulse">Nuevo</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Ayuda y soporte técnico</p>
                      </div>
                    </button>
                  )}

                  {!isAdmin && pedidos.map(pedido => (
                    <button
                      key={pedido.id}
                      onClick={() => {
                        setSelectedChatId(pedido.id);
                        setSelectedChatName(isCliente ? `Repartidor: ${pedido.motorizado_nombre || 'Asignado'}` : `Cliente: ${pedido.cliente_nombre}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                        P
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm">
                            {isCliente ? `Rep: ${pedido.motorizado_nombre || 'Asignado'}` : `Cli: ${pedido.cliente_nombre}`}
                          </p>
                          {unreadSourceIds.some(id => pedido.id.includes(id)) && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-[8px] text-white font-black uppercase rounded-full animate-pulse">Nuevo</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Pedido #{pedido.id.slice(-6)}</p>
                      </div>
                    </button>
                  ))}

                  {isAdmin && conductores.length === 0 && (
                    <p className="text-center text-gray-500 text-sm mt-8">No hay conductores registrados.</p>
                  )}
                  {!isAdmin && pedidos.length === 0 && !isMotorizado && (
                    <p className="text-center text-gray-500 text-sm mt-8">No tienes pedidos activos.</p>
                  )}
                </div>
              ) : (
                <div className="flex-1 p-4 space-y-4">
                  {mensajes.map((msg) => {
                    const remitenteId = msg.remitenteId || (msg as any).remitente_id;
                    const remitenteNombre = msg.remitenteNombre || (msg as any).remitente_nombre;
                    const isMe = remitenteId === currentUser.uid;
                    const timestamp = msg.timestamp || (msg as any).created_at;

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-[1.5rem] px-4 py-2.5 shadow-sm ${
                          isMe 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-none shadow-orange-100' 
                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                        }`}>
                          {!isMe && <p className="text-[10px] font-black mb-1 text-orange-600 uppercase tracking-widest">{remitenteNombre}</p>}
                          <p className="text-[13px] font-medium leading-relaxed">{msg.texto}</p>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 mt-1.5 px-1 uppercase tracking-tight">
                          {(() => {
                            try {
                              if (!timestamp) return '';
                              const d = new Date(timestamp);
                              return isNaN(d.getTime()) ? '' : format(d, 'HH:mm', { locale: es });
                            } catch (e) { return ''; }
                          })()}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            {selectedChatId && (
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.02)]">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-90"
                >
                  <Send size={18} className="ml-1" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
