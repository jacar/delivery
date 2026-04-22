import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Usuario, Mensaje, Pedido } from '../types';
import { listenMensajes, enviarMensaje, listenUsuarios, listenMisPedidosCliente, listenMisPedidosMotorizado } from '../services/pedidoService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatWidgetProps {
  currentUser: Usuario;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [conductores, setConductores] = useState<Usuario[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.rol === 'admin';
  const isMotorizado = currentUser.rol === 'motorizado';
  const isCliente = currentUser.rol === 'cliente';

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        const unsubscribe = listenUsuarios((usuarios) => {
          setConductores(usuarios.filter(u => u.rol === 'motorizado'));
        });
        return () => unsubscribe();
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
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-orange-600 transition-colors"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-orange-500 text-white p-4 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-3">
                {selectedChatId && (
                  <button onClick={() => setSelectedChatId(null)} className="hover:bg-orange-600 p-1 rounded-lg transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                )}
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {selectedChatId ? selectedChatName : 'Chats'}
                  </h3>
                  <p className="text-[10px] text-orange-100">
                    {selectedChatId ? 'En línea' : 'Selecciona un chat'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-orange-600 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50 overflow-y-auto flex flex-col">
              {!selectedChatId ? (
                <div className="p-2">
                  {isAdmin && conductores.map(conductor => (
                    <button
                      key={conductor.uid}
                      onClick={() => {
                        setSelectedChatId(conductor.uid);
                        setSelectedChatName(conductor.nombre);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                        {conductor.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 text-sm">{conductor.nombre}</p>
                        <p className="text-xs text-gray-500">{conductor.placaVehiculo || 'Sin placa'}</p>
                      </div>
                    </button>
                  ))}
                  
                  {isMotorizado && (
                    <button
                      onClick={() => {
                        setSelectedChatId('admin'); // ID reservado para soporte
                        setSelectedChatName('Soporte Admin');
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-gray-900 text-sm">Soporte Admin</p>
                        <p className="text-xs text-gray-500">Chat con administración</p>
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
                        <p className="font-bold text-gray-900 text-sm">
                          {isCliente ? `Repartidor: ${pedido.motorizado_nombre || 'Asignado'}` : `Cliente: ${pedido.cliente_nombre}`}
                        </p>
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
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMe ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'}`}>
                          {!isMe && <p className="text-[10px] font-bold mb-1 opacity-50">{remitenteNombre}</p>}
                          <p className="text-sm">{msg.texto}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">
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
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-gray-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  <Send size={16} className="ml-1" />
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
