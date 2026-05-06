import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Aliado, Producto } from '../types';
import { listenAliados, actualizarAliado, subirImagen, crearAliado } from '../services/aliadoService';
import { Store, ImagePlus, Loader2, Plus, Package, Pencil, Trash2, Phone, LayoutDashboard, Utensils, Camera, Save, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatImageUrl } from '../services/apiConfig';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'dashboard' | 'perfil' | 'menu' | 'galeria';

export default function AliadoView() {
  const { userData } = useAuth();
  const [aliado, setAliado] = useState<Aliado | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isCreating, setIsCreating] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [creationAttempted, setCreationAttempted] = useState(false);

  // Profile States
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editLogo, setEditLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Product States
  const [pNombre, setPNombre] = useState('');
  const [pPrecio, setPPrecio] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImagen, setPImagen] = useState<string | null>(null);
  const [pImageFile, setPImageFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductoId, setEditingProductoId] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.email) return;

    const unsub = listenAliados((allAliados) => {
      const myAliado = allAliados.find(a => a.ownerEmail?.toLowerCase() === userData.email?.toLowerCase());
      
      setHasLoadedOnce(true);

      if (myAliado) {
        setAliado(myAliado);
        setEditNombre(myAliado.nombre);
        setEditDesc(myAliado.descripcion || '');
        setEditWhatsapp(myAliado.whatsapp || '');
        setEditLogo(myAliado.logoUrl);
        setLoading(false);
        setIsCreating(false);
      } else if (!isCreating && !creationAttempted && hasLoadedOnce) {
        // Solo auto-creamos si ya cargamos una vez, no hemos intentado antes y estamos SEGUROS de que no existe
        setIsCreating(true);
        setCreationAttempted(true);
        const autoCreate = async () => {
          try {
            console.log("Auto-creando panel para:", userData.email);
            const newId = 'aliado-' + Math.random().toString(36).substr(2, 9);
            await crearAliado({
              id: newId,
              nombre: `Negocio de ${userData.nombre}`,
              logoUrl: userData.fotoUrl || '',
              descripcion: 'Nuevo comercio aliado',
              whatsapp: '',
              ownerEmail: userData.email,
              imagenes: [],
              productos: []
            });
            toast.success("¡Panel creado correctamente!");
          } catch (error: any) {
            console.error("Error auto-creando aliado:", error);
            // Si es 403, probablemente el admin deba crearlo
            if (error.message.includes('403')) {
              toast.error("Tu panel aún no ha sido habilitado por el administrador.");
            } else {
              toast.error("Error al crear tu panel: " + error.message);
            }
          } finally {
            setIsCreating(false);
            setLoading(false);
          }
        };
        autoCreate();
      } else {
        // Si no hay aliado pero aún no confirmamos la ausencia (hasLoadedOnce es false)
        // o ya estamos creando, o ya intentamos y falló, solo esperamos.
        if (loading && hasLoadedOnce && !isCreating) setLoading(false);
      }
    });

    return () => unsub();
  }, [userData?.email, hasLoadedOnce, creationAttempted]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPImagen(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    if (!aliado) return;
    setIsSubmitting(true);
    try {
      let finalLogoUrl = editLogo || '';
      if (logoFile) {
        const path = `aliados/logos/${Date.now()}_${logoFile.name}`;
        finalLogoUrl = await subirImagen(path, logoFile);
      }

      await actualizarAliado(aliado.id, {
        nombre: editNombre,
        descripcion: editDesc,
        whatsapp: editWhatsapp,
        logoUrl: finalLogoUrl,
        ownerEmail: userData?.email // Mantener el vínculo
      });
      toast.success('Perfil actualizado correctamente');
    } catch (e) {
      toast.error('Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOrUpdateProducto = async () => {
    if (!aliado || !pNombre || !pPrecio) return;
    setIsSubmitting(true);
    try {
      let finalImageUrl = pImagen || '';
      if (pImageFile) {
        const path = `aliados/productos/${Date.now()}_${pImageFile.name}`;
        finalImageUrl = await subirImagen(path, pImageFile);
      }

      let nuevosProductos = [...(aliado.productos || [])];
      if (editingProductoId) {
        nuevosProductos = nuevosProductos.map(p => p.id === editingProductoId ? {
          ...p, nombre: pNombre, precio: pPrecio, descripcion: pDesc, imagenUrl: finalImageUrl
        } : p);
      } else {
        nuevosProductos.push({
          id: Math.random().toString(36).substr(2, 9),
          nombre: pNombre, precio: pPrecio, descripcion: pDesc, imagenUrl: finalImageUrl
        });
      }

      await actualizarAliado(aliado.id, { productos: nuevosProductos });
      toast.success(editingProductoId ? 'Producto actualizado' : 'Producto añadido');
      resetProductForm();
    } catch (e) {
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setPNombre(''); setPPrecio(''); setPDesc(''); setPImagen(null); setPImageFile(null); setEditingProductoId(null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <div className="text-center">
        <p className="text-gray-500 font-bold">Cargando tu panel...</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-xs font-black text-orange-500 uppercase tracking-widest hover:underline"
        >
          ¿Tarda demasiado? Haz clic aquí
        </button>
      </div>
    </div>
  );

  if (!aliado) return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
      <Store size={48} className="text-gray-300 mb-6" />
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Configurando tu espacio...</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
        Estamos preparando tus herramientas de gestión. Esto suele tardar solo unos segundos.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl"
      >
        Refrescar Panel
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* BANNER DE ESTADO DE APROBACIÓN */}
      {!aliado.aprobado && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-5 shadow-sm">
          <div className="bg-amber-500/10 p-3 rounded-2xl text-amber-600 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-black text-amber-900 uppercase tracking-tighter mb-1">Tu Negocio está en Revisión</h4>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Tu comercio ha sido registrado exitosamente. **Ya puedes subir tus productos y configurar tu menú**, pero estos no serán visibles para los clientes en la aplicación principal hasta que un administrador apruebe tu registro.
            </p>
          </div>
          <div className="hidden sm:block">
             <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest">Pendiente</span>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl overflow-hidden shadow-inner shrink-0 border border-gray-100">
            <img src={formatImageUrl(aliado.logoUrl)} alt={aliado.nombre} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter truncate">{aliado.nombre}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">Panel de Socio</span>
              {aliado.whatsapp && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest"><Phone size={10} /> {aliado.whatsapp}</span>}
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full md:w-auto">
          {(['dashboard', 'perfil', 'menu', 'galeria'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'dashboard' && <LayoutDashboard size={14} />}
              {tab === 'perfil' && <Store size={14} />}
              {tab === 'menu' && <Utensils size={14} />}
              {tab === 'galeria' && <Camera size={14} />}
              <span className="hidden sm:inline">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="dashboard" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-50 space-y-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500"><Utensils size={24} /></div>
              <div>
                <h4 className="text-3xl font-black text-gray-900">{(aliado.productos || []).length}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Productos en Menú</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-50 space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-500"><Camera size={24} /></div>
              <div>
                <h4 className="text-3xl font-black text-gray-900">{(aliado.imagenes || []).length}</h4>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fotos en Galería</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-50 flex flex-col justify-center items-center text-center">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Visibilidad</p>
               {aliado.aprobado ? (
                 <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase">Activo en la App</span>
               ) : (
                 <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-xs font-black uppercase">En Revisión</span>
               )}
            </div>
          </motion.div>
        )}

        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="perfil" className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 max-w-2xl mx-auto w-full">
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gray-50 rounded-[3rem] overflow-hidden border-4 border-white shadow-xl">
                    <img src={formatImageUrl(editLogo || '')} className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => document.getElementById('logo-upload')?.click()} className="absolute -bottom-2 -right-2 p-3 bg-gray-900 text-white rounded-2xl shadow-lg hover:bg-orange-500 transition-all">
                    <Camera size={20} />
                  </button>
                  <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo del Comercio</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nombre Comercial</label>
                  <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Nombre de tu negocio" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">WhatsApp de Pedidos</label>
                  <input type="text" value={editWhatsapp} onChange={e => setEditWhatsapp(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej: 573001234567" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Descripción Breve</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none h-32 resize-none" placeholder="Cuéntanos sobre tu negocio..." />
                </div>
              </div>

              <button onClick={saveProfile} disabled={isSubmitting} className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-100 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Guardar Cambios</>}
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="menu" className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8">{editingProductoId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nombre del Plato</label>
                  <input type="text" value={pNombre} onChange={e => setPNombre(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej: Hamburguesa Especial" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Precio o Variantes</label>
                  <input type="text" value={pPrecio} onChange={e => setPPrecio(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ej: 15.00 o S: 5, L: 10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Descripción</label>
                  <input type="text" value={pDesc} onChange={e => setPDesc(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Ingredientes o promo..." />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div onClick={() => document.getElementById('p-img')?.click()} className="w-20 h-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 hover:border-orange-500 transition-all cursor-pointer overflow-hidden flex items-center justify-center group shadow-inner">
                    {pImagen ? <img src={formatImageUrl(pImagen)} className="w-full h-full object-cover" /> : <ImagePlus size={20} className="text-gray-300" />}
                    <input id="p-img" type="file" accept="image/*" onChange={handleProductImageChange} className="hidden" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto del Producto</p>
                    <button onClick={() => document.getElementById('p-img')?.click()} className="text-xs font-bold text-orange-500 hover:underline">Subir Imagen</button>
                  </div>
                </div>

                <div className="flex gap-3">
                  {editingProductoId && (
                    <button onClick={resetProductForm} className="px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500">Cancelar</button>
                  )}
                  <button onClick={addOrUpdateProducto} disabled={isSubmitting} className="bg-gray-900 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center gap-3 shadow-lg shadow-gray-200 disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : editingProductoId ? <><Pencil size={14} /> Actualizar</> : <><Plus size={14} /> Añadir al Menú</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-8">Mis Productos Actuales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {(aliado.productos || []).map(prod => (
                  <div key={prod.id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-orange-100/20 transition-all">
                    <div className="flex items-center gap-6 overflow-hidden">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-inner">
                        {prod.imagenUrl ? (
                          <img src={formatImageUrl(prod.imagenUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-base font-black text-gray-900 truncate uppercase tracking-tight">{prod.nombre}</p>
                        <p className="text-sm font-black text-orange-500 mt-1">{prod.precio.includes('$') ? prod.precio : `$ ${prod.precio}`}</p>
                        {prod.descripcion && (
                          <p className="text-[10px] font-medium text-gray-400 line-clamp-1 mt-1">{prod.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProductoId(prod.id); setPNombre(prod.nombre); setPPrecio(prod.precio); setPDesc(prod.descripcion || ''); setPImagen(prod.imagenUrl || null); }}
                        className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={async () => { if(confirm('¿Eliminar?')) { const up = aliado.productos?.filter(p => p.id !== prod.id); await actualizarAliado(aliado.id, { productos: up }); toast.success('Eliminado'); } }}
                        className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
