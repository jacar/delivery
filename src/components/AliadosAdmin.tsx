import React, { useState, useEffect } from 'react';
import { listenAliados, crearAliado, eliminarAliado, actualizarAliado, subirImagen } from '../services/aliadoService';
import { Store, ImagePlus, Trash2, Loader2, Plus, Phone, Package, Pencil, Edit2, UserPlus, Check, X, ShieldCheck, Power } from 'lucide-react';
import { listenUsuarios, actualizarRolUsuario, aprobarUsuario } from '../services/pedidoService';
import { useRef } from 'react';
import { toast } from 'sonner';
import { formatImageUrl, API_BASE_URL } from '../services/apiConfig';
import { Aliado, Usuario, Producto } from '../types';

export default function AliadosAdmin() {
  const [aliados, setAliados] = useState<Aliado[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Nuevo estado unificado para galería
  const [galeriaItems, setGaleriaItems] = useState<{ id: string, url: string, file?: File }[]>([]);
  
  const [productos, setProductos] = useState<(Producto & { newFile?: File })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProductoId, setEditingProductoId] = useState<string | null>(null);

  // Estados para el "Mini Form" de un producto
  const [pNombre, setPNombre] = useState('');
  const [pPrecio, setPPrecio] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pImagen, setPImagen] = useState<string | null>(null);
  const [pImageFile, setPImageFile] = useState<File | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = listenAliados((data) => {
      setAliados(data);
      setLoading(false);
    });
    const unsubUsers = listenUsuarios((data) => {
      setUsuarios(data);
    });
    return () => {
      unsub();
      unsubUsers();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            file
          };
          setGaleriaItems(prev => [...prev, newItem]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (itemId: string) => {
    setGaleriaItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addOrUpdateProducto = () => {
    if (!pNombre || !pPrecio) {
      toast.error('Nombre y Precio son obligatorios');
      return;
    }

    if (editingProductoId) {
      // Actualizar existente
      setProductos(productos.map(p => {
        if (p.id === editingProductoId) {
          return {
            ...p,
            nombre: pNombre,
            precio: pPrecio,
            descripcion: pDesc,
            imagenUrl: pImagen || p.imagenUrl,
            newFile: pImageFile || p.newFile
          };
        }
        return p;
      }));
      setEditingProductoId(null);
    } else {
      // Crear nuevo
      const nuevo: Producto & { newFile?: File } = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: pNombre,
        precio: pPrecio,
        descripcion: pDesc,
        imagenUrl: pImagen || '',
        newFile: pImageFile || undefined
      };
      setProductos([...productos, nuevo]);
    }

    // Reset mini form
    setPNombre('');
    setPPrecio('');
    setPDesc('');
    setPImagen(null);
    setPImageFile(null);
  };

  const editProducto = (p: Producto & { newFile?: File }) => {
    setEditingProductoId(p.id);
    setPNombre(p.nombre);
    setPPrecio(p.precio);
    setPDesc(p.descripcion || '');
    setPImagen(p.imagenUrl || null);
    setPImageFile(p.newFile || null);
  };

  const removeProducto = (id: string) => {
    setProductos(productos.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || (!logoBase64 && !logoFile)) {
      toast.error('El nombre y el logo son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalLogoUrl = logoBase64 || '';
      
      // 1. Subir Logo si hay un archivo nuevo
      if (logoFile) {
        const path = `aliados/logos/${Date.now()}_${logoFile.name}`;
        finalLogoUrl = await subirImagen(path, logoFile);
      }

      // 2. Procesar Galería (URLs existentes vs Archivos nuevos)
      const finalGalleryUrls = await Promise.all(galeriaItems.map(async (item) => {
        if (item.file) {
          const path = `aliados/galeria/${Date.now()}_${item.file.name}`;
          return await subirImagen(path, item.file);
        }
        return item.url; // Es una URL existente
      }));

      // 3. Procesar productos
      const finalProductos = await Promise.all(productos.map(async (p) => {
        if (p.newFile) {
          const path = `aliados/productos/${Date.now()}_${p.newFile.name}`;
          const url = await subirImagen(path, p.newFile);
          const { newFile, ...rest } = p;
          return { ...rest, imagenUrl: url };
        }
        const { newFile, ...rest } = p;
        return rest;
      }));

      let nuevoAliadoOwnerEmail = ownerEmail;

      if (ownerEmail) {
        // Encontrar usuario y actualizar su rol
        const userToPromote = usuarios.find(u => u.email?.toLowerCase() === ownerEmail.toLowerCase());
        if (userToPromote) {
          try {
            await actualizarRolUsuario(userToPromote.uid, 'aliado');
            toast.success(`Usuario ${ownerEmail} asignado como aliado`);
          } catch(e) {
            toast.error(`Error al promover al usuario a aliado`);
          }
        } else {
          toast.warning(`Correo ${ownerEmail} no encontrado en usuarios registrados, pero se guardará.`);
        }
      }

      if (editingId) {
        await actualizarAliado(editingId, {
          nombre,
          descripcion,
          whatsapp,
          logoUrl: finalLogoUrl,
          imagenes: finalGalleryUrls,
          productos: finalProductos,
          ownerEmail: nuevoAliadoOwnerEmail
        });
        toast.success('Aliado actualizado correctamente');
      } else {
        const newId = `aliado_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        await crearAliado({
          id: newId,
          nombre,
          logoUrl: finalLogoUrl,
          descripcion,
          whatsapp,
          imagenes: finalGalleryUrls,
          productos: finalProductos,
          ownerEmail: nuevoAliadoOwnerEmail
        });
        toast.success('Aliado creado correctamente');
      }
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast.error('Error al guardar los cambios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setWhatsapp('');
    setOwnerEmail('');
    setLogoBase64(null);
    setLogoFile(null);
    setGaleriaItems([]);
    setProductos([]);
    setEditingId(null);
    setEditingProductoId(null);
    setPImageFile(null);
    setPNombre('');
    setPPrecio('');
    setPDesc('');
    setPImagen(null);
  };

  const handleEdit = (aliado: Aliado) => {
    setEditingId(aliado.id);
    setNombre(aliado.nombre);
    setDescripcion(aliado.descripcion || '');
    setWhatsapp(aliado.whatsapp || '');
    setOwnerEmail(aliado.ownerEmail || '');
    setLogoBase64(aliado.logoUrl);
    setGaleriaItems((aliado.imagenes || []).map(url => ({ 
      id: Math.random().toString(36).substr(2, 9), 
      url 
    })));
    setProductos(aliado.productos || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditMenu = (aliado: Aliado) => {
    handleEdit(aliado);
    setTimeout(() => {
      menuRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (aliado: Aliado) => {
    if (confirm(`¿Estás seguro de eliminar a ${aliado.nombre}?`)) {
      try {
        await eliminarAliado(aliado.id);
        toast.success('Aliado eliminado');
      } catch (error) {
        console.error(error);
        toast.error('Error al eliminar el aliado');
      }
    }
  };

  const handleAprobarAliado = async (userId: string, email: string) => {
    try {
      // 1. Aprobar en tabla usuarios
      await aprobarUsuario(userId, true);
      
      // 2. Aprobar en tabla aliados
      const emailLower = email?.toLowerCase();
      const aliadoToApprove = aliados.find(a => a.ownerEmail?.toLowerCase() === emailLower);
      
      if (aliadoToApprove) {
        await actualizarAliado(aliadoToApprove.id, { aprobado: true });
      } else {
        // Si no existe el registro de aliado aún, lo creamos aprobado
        const newId = `aliado-${userId || Math.random().toString(36).substr(2, 9)}`;
        const user = usuarios.find(u => u.uid === userId);
        
        await crearAliado({
          id: newId,
          nombre: `Negocio de ${user?.nombre || email.split('@')[0]}`,
          logoUrl: user?.fotoUrl || '',
          descripcion: 'Nuevo comercio aliado',
          whatsapp: user?.telefono || '',
          ownerEmail: email,
          aprobado: true,
          imagenes: [],
          productos: []
        });
      }
      
      toast.success('Aliado aprobado exitosamente en todas las tablas');
    } catch (e) {
      console.error(e);
      toast.error('Error al aprobar aliado');
    }
  };

  const handleToggleAprobacion = async (aliado: Aliado) => {
    const action = aliado.aprobado ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} a ${aliado.nombre}?`)) return;

    try {
      const nuevoEstado = !aliado.aprobado;
      
      // 1. Actualizar en tabla aliados
      await actualizarAliado(aliado.id, { aprobado: nuevoEstado });
      
      // 2. Sincronizar con tabla usuarios si existe ownerEmail
      if (aliado.ownerEmail) {
        const user = usuarios.find(u => u.email?.toLowerCase() === aliado.ownerEmail?.toLowerCase());
        if (user) {
          await aprobarUsuario(user.uid, nuevoEstado);
        }
      }
      
      toast.success(nuevoEstado ? 'Aliado Activado' : 'Aliado Desactivado');
    } catch (e) {
      console.error(e);
      toast.error('Error al cambiar el estado del aliado');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECCIÓN DE SOLICITUDES PENDIENTES - AHORA AL PRINCIPIO */}
      {usuarios.filter(u => u.rol === 'aliado' && !u.aprobado).length > 0 && (
        <div className="bg-orange-500/5 border-2 border-orange-100 rounded-[2.5rem] p-8 shadow-xl shadow-orange-100/20">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-orange-500 p-4 rounded-3xl text-white shadow-lg shadow-orange-200">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Nuevas Solicitudes de Aliados</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Haz clic en el check para activar el comercio de inmediato</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usuarios.filter(u => u.rol === 'aliado' && !u.aprobado).map((u) => (
              <div key={u.uid} className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100 flex items-center justify-between group transition-all hover:shadow-xl hover:border-orange-300">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden shadow-inner">
                    {u.fotoUrl ? <img src={u.fotoUrl} className="w-full h-full object-cover" /> : <Store className="text-gray-300" size={24} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-base font-black text-gray-900 truncate uppercase tracking-tight">{u.nombre}</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate tracking-widest">{u.email}</p>
                  </div>
                </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAprobarAliado(u.uid, u.email || '')}
                      className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 hover:scale-110 transition-all shadow-lg shadow-orange-200 shrink-0"
                      title="Aprobar y Activar Aliado"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={async () => {
                        if(confirm(`¿Rechazar y eliminar permanentemente la solicitud de ${u.nombre}?`)) {
                          try {
                            // 1. Eliminar de tabla aliados si existe (Silencioso si falla)
                            try {
                              const a = aliados.find(al => al.ownerEmail === u.email);
                              if(a) await eliminarAliado(a.id);
                            } catch(e) { console.warn("Error eliminando aliado vinculado:", e); }
                            
                            // 2. Eliminar de tabla usuarios
                            const res = await fetch(`${API_BASE_URL}/users/${u.uid}`, { 
                              method: 'DELETE',
                              headers: { 'Accept': 'application/json' }
                            });
                            
                            if (!res.ok) {
                              const errData = await res.json();
                              throw new Error(errData.error || 'Error del servidor al eliminar usuario');
                            }
                            
                            toast.success('Solicitud eliminada por completo');
                            window.location.reload(); 
                          } catch(e: any) {
                            console.error("Error detallado al eliminar solicitud:", e);
                            toast.error(`Error: ${e.message || 'No se pudo eliminar'}`);
                          }
                        }
                      }}
                      className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm shrink-0"
                      title="Rechazar y Borrar Todo"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de registro/edición */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-gray-50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 uppercase tracking-tighter">
            <Store className="text-orange-500" size={28} /> 
            {editingId ? 'Editar Comercio' : 'Nuevo Socio Aliado'}
          </h3>
          {editingId && (
            <button 
              onClick={resetForm}
              className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
            >
              Cancelar Edición
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lado Izquierdo: Textos */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-inner"
                  placeholder="Ej: Pizzería MG"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">WhatsApp de Contacto</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-inner"
                      placeholder="Ej: +58 412..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Descripción / Categoría</label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-inner"
                    placeholder="Ej: Comida Italiana"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1 flex items-center gap-1"><UserPlus size={12} /> Asignar Dueño (Email)</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 border-none rounded-3xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-inner"
                  placeholder="Ej: dueño@negocio.com"
                />
                <p className="text-[9px] text-gray-400 mt-1 ml-1">El usuario con este correo obtendrá el rol de 'aliado' automáticamente.</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Logo Principal</label>
                  <div 
                    onClick={() => document.getElementById('logo-input')?.click()}
                    className="relative h-32 w-32 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 hover:border-orange-500 transition-all flex items-center justify-center cursor-pointer overflow-hidden group shadow-inner"
                  >
                    {logoBase64 ? (
                      <img src={formatImageUrl(logoBase64)} className="w-full h-full object-cover" />
                    ) : (
                      <ImagePlus size={24} className="text-gray-300 group-hover:text-orange-500" />
                    )}
                    <input id="logo-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Galería (Fotos Local)</label>
                  <div className="flex flex-wrap gap-3">
                    {galeriaItems.map((item) => (
                      <div key={item.id} className="relative w-16 h-16 rounded-2xl overflow-hidden group">
                        <img src={formatImageUrl(item.url)} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeGalleryImage(item.id)}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={() => document.getElementById('gallery-input')?.click()}
                      className="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-500 transition-all flex items-center justify-center cursor-pointer group shadow-inner"
                    >
                      <Plus size={20} className="text-gray-300 group-hover:text-orange-500" />
                      <input id="gallery-input" type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-100" ref={menuRef}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Menú de Productos</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Añade platos o promociones individuales</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                <Package size={14} className="text-orange-500" />
                <span className="text-xs font-black text-gray-900">{productos.length}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {productos.map((prod) => (
                <div 
                  key={prod.id} 
                  className={`flex items-center gap-4 p-4 rounded-3xl border transition-all group relative ${
                    editingProductoId === prod.id ? 'bg-orange-50 border-orange-200 shadow-lg' : 'bg-gray-50 border-gray-100 hover:bg-white'
                  }`}
                >
                  <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden shadow-sm shrink-0 border border-gray-50">
                    {prod.imagenUrl ? <img src={formatImageUrl(prod.imagenUrl)} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-gray-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{prod.nombre}</p>
                    <p className="text-xs font-bold text-orange-500">$ {Number(prod.precio).toFixed(2)}</p>
                  </div>
                  <div className={`flex gap-2 transition-opacity ${editingProductoId === prod.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button 
                      type="button"
                      onClick={() => editProducto(prod)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        editingProductoId === prod.id ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-500 hover:bg-orange-500 hover:text-white'
                      }`}
                      title="Editar Producto"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => removeProducto(prod.id)}
                      className="w-10 h-10 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      title="Eliminar Producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {productos.length < 100 && (
              <div className={`p-6 md:p-8 rounded-[3rem] border transition-all space-y-6 ${
                editingProductoId ? 'bg-orange-50/50 border-orange-200 shadow-inner' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Nombre Producto</label>
                    <input 
                      type="text" value={pNombre} onChange={(e) => setPNombre(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm" 
                      placeholder="Ej: Pizza Familiar"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Precio o Variantes</label>
                    <input 
                      type="text" value={pPrecio} onChange={(e) => setPPrecio(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm" 
                      placeholder="Ej: 12.99 o S: 5, L: 10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">Descripción / Promo</label>
                    <textarea 
                      rows={1} value={pDesc} onChange={(e) => setPDesc(e.target.value)}
                      className="w-full px-6 py-4 bg-white border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-orange-500/10 outline-none resize-none transition-all shadow-sm" 
                      placeholder="Breve detalle del producto..."
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => document.getElementById('prod-img-input')?.click()}
                      className="w-20 h-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 hover:border-orange-500 transition-all flex items-center justify-center cursor-pointer group overflow-hidden shadow-sm"
                    >
                      {pImagen ? <img src={formatImageUrl(pImagen)} className="w-full h-full object-cover" /> : <ImagePlus size={20} className="text-gray-200 group-hover:text-orange-500" />}
                      <input id="prod-img-input" type="file" accept="image/*" onChange={handleProductImageChange} className="hidden" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Imagen del Producto</p>
                      <button 
                        type="button"
                        onClick={() => document.getElementById('prod-img-input')?.click()}
                        className="text-xs font-bold text-orange-500 hover:underline"
                      >
                        {pImagen ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {editingProductoId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingProductoId(null);
                          setPNombre(''); setPPrecio(''); setPDesc(''); setPImagen(null); setPImageFile(null);
                        }}
                        className="px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={addOrUpdateProducto}
                      className="bg-gray-900 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center gap-3 shadow-xl shadow-gray-200"
                    >
                      {editingProductoId ? <><Pencil size={14} /> Actualizar Producto</> : <><Plus size={14} /> Añadir al Menú</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-10"
          >
            {isSubmitting ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <> {editingId ? 'Guardar Cambios' : 'Registrar SOCIO'} <Plus size={20} /> </>
            )}
          </button>
        </form>
      </div>

      {/* Lista de aliados */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Directorio de Aliados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aliados.map((aliado) => (
          <div key={aliado.id} className="bg-white p-6 rounded-[3rem] border border-gray-50 shadow-xl shadow-gray-500/5 group">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] overflow-hidden shadow-inner shrink-0 leading-[0]">
                <img src={formatImageUrl(aliado.logoUrl)} alt={aliado.nombre} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-gray-900 uppercase tracking-tighter truncate">{aliado.nombre}</h4>
                  {!aliado.aprobado && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-[8px] font-black uppercase">Pendiente</span>
                  )}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 line-clamp-1 whitespace-pre-wrap">{aliado.descripcion || 'Sin categoría'}</p>
                {aliado.whatsapp && (
                  <p className="text-[9px] font-bold text-green-600 mt-1 flex items-center gap-1">
                    <Phone size={10} /> {aliado.whatsapp}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleToggleAprobacion(aliado)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    aliado.aprobado 
                      ? 'bg-green-50 text-green-500 hover:bg-green-500 hover:text-white' 
                      : 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white'
                  }`}
                  title={aliado.aprobado ? "Desactivar Aliado" : "Activar Aliado"}
                >
                  <Power size={18} />
                </button>
                <button 
                  onClick={() => handleEdit(aliado)}
                  className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
                  title="Editar Información"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleEditMenu(aliado)}
                  className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                  title="Editar Menú"
                >
                  <Package size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(aliado)}
                  className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
