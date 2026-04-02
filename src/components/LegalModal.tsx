import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Info, RefreshCcw, Users } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'about' | 'terms' | 'privacy' | 'returns';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'about' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'about', label: 'Sobre Nosotros', icon: Users },
    { id: 'terms', label: 'Términos de Uso', icon: FileText },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'returns', label: 'Devoluciones', icon: RefreshCcw },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Info className="text-orange-600" size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Centro de Información</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-64 bg-gray-50 p-4 border-r border-gray-100 overflow-y-auto">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-orange-600 shadow-sm border border-orange-100'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="prose prose-orange max-w-none"
                  >
                    {activeTab === 'about' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-black text-gray-900">¿Quiénes Somos?</h3>
                        <p className="text-gray-600 leading-relaxed">
                          En <strong>DeliveryExpress</strong>, somos más que una simple aplicación de mensajería. Somos el puente que conecta tus necesidades con soluciones rápidas y confiables. Nacimos con la misión de revolucionar la logística local, haciendo que enviar y recibir paquetes sea tan sencillo como pulsar un botón.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                            <h4 className="font-black text-orange-900 mb-2">Nuestra Misión</h4>
                            <p className="text-sm text-orange-800/80">Facilitar la vida de las personas a través de una red de logística eficiente, segura y humana.</p>
                          </div>
                          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                            <h4 className="font-black text-blue-900 mb-2">Nuestra Visión</h4>
                            <p className="text-sm text-blue-800/80">Ser la plataforma de delivery líder en la región, reconocida por nuestra innovación y compromiso con la comunidad.</p>
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mt-8">Nuestros Valores</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0">
                          <li className="flex items-center gap-3 text-gray-600 font-medium">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Rapidez sin comprometer la seguridad.
                          </li>
                          <li className="flex items-center gap-3 text-gray-600 font-medium">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Transparencia total en cada envío.
                          </li>
                          <li className="flex items-center gap-3 text-gray-600 font-medium">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Empatía con nuestros clientes y repartidores.
                          </li>
                          <li className="flex items-center gap-3 text-gray-600 font-medium">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Innovación constante en tecnología.
                          </li>
                        </ul>
                      </div>
                    )}

                    {activeTab === 'terms' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-black text-gray-900">Términos y Condiciones de Uso</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Última actualización: 24 de Marzo, 2026</p>
                        
                        <div className="space-y-4">
                          <section>
                            <h4 className="font-black text-gray-800">1. Aceptación de los Términos</h4>
                            <p className="text-gray-600 text-sm">Al acceder y utilizar DeliveryExpress, aceptas cumplir con estos términos. Si no estás de acuerdo, por favor abstente de usar la plataforma.</p>
                          </section>
                          
                          <section>
                            <h4 className="font-black text-gray-800">2. Uso de la Plataforma</h4>
                            <p className="text-gray-600 text-sm">La plataforma es para uso personal y comercial lícito. Queda estrictamente prohibido el envío de sustancias ilegales, armas, materiales peligrosos o cualquier objeto que infrinja las leyes locales.</p>
                          </section>

                          <section>
                            <h4 className="font-black text-gray-800">3. Responsabilidad del Usuario</h4>
                            <p className="text-gray-600 text-sm">Eres responsable de proporcionar información precisa sobre las ubicaciones de recogida y entrega. DeliveryExpress no se hace responsable de retrasos causados por información incorrecta.</p>
                          </section>

                          <section>
                            <h4 className="font-black text-gray-800">4. Pagos y Tarifas</h4>
                            <p className="text-gray-600 text-sm">Las tarifas se calculan en base a la distancia y el tipo de servicio. Al confirmar un pedido, aceptas el cargo correspondiente.</p>
                          </section>
                        </div>
                      </div>
                    )}

                    {activeTab === 'privacy' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-black text-gray-900">Política de Tratamiento de Datos</h3>
                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 mb-6">
                          <p className="text-sm text-blue-800 font-medium">Tu privacidad es nuestra prioridad. Cumplimos con las normativas vigentes de protección de datos personales.</p>
                        </div>

                        <div className="space-y-4">
                          <section>
                            <h4 className="font-black text-gray-800">¿Qué datos recolectamos?</h4>
                            <p className="text-gray-600 text-sm">Nombre, correo electrónico, número de teléfono y datos de ubicación GPS (solo durante el uso activo de la aplicación para fines de logística).</p>
                          </section>

                          <section>
                            <h4 className="font-black text-gray-800">Finalidad del Tratamiento</h4>
                            <p className="text-gray-600 text-sm">Usamos tus datos exclusivamente para gestionar tus pedidos, mejorar el servicio de entrega y comunicarnos contigo sobre el estado de tus envíos.</p>
                          </section>

                          <section>
                            <h4 className="font-black text-gray-800">Tus Derechos</h4>
                            <p className="text-gray-600 text-sm">Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos en cualquier momento a través de la configuración de tu perfil o contactando a nuestro soporte.</p>
                          </section>
                        </div>
                      </div>
                    )}

                    {activeTab === 'returns' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-black text-gray-900">Políticas de Devoluciones y Reembolsos</h3>
                        
                        <div className="space-y-4">
                          <section>
                            <h4 className="font-black text-gray-800">Cancelaciones</h4>
                            <p className="text-gray-600 text-sm">Puedes cancelar un pedido sin costo antes de que sea aceptado por un repartidor. Una vez aceptado, se podrá aplicar una tarifa de cancelación mínima.</p>
                          </section>

                          <section>
                            <h4 className="font-black text-gray-800">Reembolsos</h4>
                            <p className="text-gray-600 text-sm">Se procesarán reembolsos totales en caso de que el pedido no pueda ser entregado por causas imputables a DeliveryExpress o al repartidor asignado.</p>
                          </section>

                          <section>
                            <h4 className="font-black text-gray-800">Daños o Pérdidas</h4>
                            <p className="text-gray-600 text-sm">En el improbable caso de daño o pérdida del paquete durante el tránsito, nuestro seguro cubrirá el valor declarado del mismo tras una breve investigación.</p>
                          </section>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">DeliveryExpress © 2026 • Todos los derechos reservados</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
