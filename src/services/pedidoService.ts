import { Pedido, PedidoEstado, PedidoTipo, Ubicacion, Usuario, Mensaje, UserRole, TarifaMotoTaxi } from '../types';
import { API_BASE_URL } from './apiConfig';

// Helper para peticiones API
async function apiFetch(endpoint: string, options: any = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(msg);
    }
    return await response.json();
  } catch (err: any) {
    console.error(`API Fetch Error [${endpoint}]:`, err);
    throw err;
  }
}

// PEDIDOS
export const createPedido = async (
  clienteId: string, 
  clienteNombre: string,
  clienteTelefono: string,
  tipo: PedidoTipo, 
  descripcion: string, 
  recogida?: Ubicacion, 
  entrega?: Ubicacion
) => {
  return await apiFetch('/orders', {
    method: 'POST',
    body: {
      id: Math.random().toString(36).substr(2, 9),
      cliente_id: clienteId,
      cliente_nombre: clienteNombre,
      cliente_telefono: clienteTelefono,
      tipo,
      descripcion,
      ubicacion_recogida: recogida,
      ubicacion_entrega: entrega,
      estado: 'disponible'
    }
  });
};

export const tomarPedido = async (pedidoId: string, motorizadoId: string, motorizadoNombre: string, motorizadoTelefono: string) => {
  return await apiFetch(`/orders/${pedidoId}/status`, {
    method: 'PUT',
    body: {
      estado: 'asignado',
      motorizado_id: motorizadoId,
      motorizado_nombre: motorizadoNombre,
      motorizado_telefono: motorizadoTelefono,
      aceptado_por_motorizado: true
    }
  });
};

export const asignarPedido = async (pedidoId: string, motorizadoId: string, motorizadoNombre: string, motorizadoTelefono: string) => {
  return await apiFetch(`/orders/${pedidoId}/status`, {
    method: 'PUT',
    body: {
      estado: 'asignado',
      motorizado_id: motorizadoId,
      motorizado_nombre: motorizadoNombre,
      motorizado_telefono: motorizadoTelefono,
      aceptado_por_motorizado: false
    }
  });
};

export const aceptarPedido = async (pedidoId: string, motorizadoId: string) => {
  return await apiFetch(`/orders/${pedidoId}/status`, {
    method: 'PUT',
    body: { aceptado_por_motorizado: true }
  });
};

export const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: PedidoEstado, motorizadoId?: string) => {
  return await apiFetch(`/orders/${pedidoId}/status`, {
    method: 'PUT',
    body: { estado: nuevoEstado, motorizado_id: motorizadoId }
  });
};

export const eliminarPedido = async (pedidoId: string) => {
  return await apiFetch(`/orders/${pedidoId}`, {
    method: 'DELETE'
  });
};

export const actualizarDisponibilidadMotorizado = async (uid: string, disponible: boolean) => {
  return await apiFetch(`/users/${uid}`, {
    method: 'PUT',
    body: { disponible }
  });
};

export const actualizarUbicacionRepartidor = async (pedidoId: string, lat: number, lng: number) => {
  return await apiFetch(`/orders/${pedidoId}/location`, {
    method: 'POST',
    body: { lat, lng }
  });
};

// POLLING PARA PEDIDOS (REEMPLAZO DE LISTENERS)
export const listenPedidosDisponibles = (callback: (pedidos: Pedido[]) => void) => {
  let lastData = '';
  let active = true;
  const poll = async () => {
    if (!active) return;
    try {
      const all = await apiFetch('/orders');
      const filtered = all.filter((p: any) => p.estado === 'disponible');
      const current = JSON.stringify(filtered);
      if (current !== lastData) {
        lastData = current;
        callback(filtered);
      }
    } catch (e) { console.error(e); }
    setTimeout(poll, 10000);
  };
  poll();
  return () => { active = false; };
};

export const listenMisPedidosCliente = (clienteId: string, callback: (pedidos: Pedido[]) => void) => {
  const fetchLocal = async () => {
    try {
      const all = await apiFetch('/orders');
      callback(all.filter((p: any) => p.cliente_id === clienteId));
    } catch (e) { console.error(e); }
  };
  fetchLocal();
  const interval = setInterval(fetchLocal, 6000);
  return () => clearInterval(interval);
};

export const listenTodosLosPedidos = (callback: (pedidos: Pedido[]) => void) => {
  let lastData = '';
  let active = true;
  const poll = async () => {
    if (!active) return;
    try {
      const data = await apiFetch('/orders');
      const current = JSON.stringify(data);
      if (current !== lastData) {
        lastData = current;
        callback(data);
      }
    } catch (e) { console.error(e); }
    setTimeout(poll, 12000);
  };
  poll();
  return () => { active = false; };
};

export const listenMisPedidosMotorizado = (motorizadoId: string, callback: (pedidos: Pedido[]) => void) => {
  const fetchLocal = async () => {
    try {
      const all = await apiFetch('/orders');
      callback(all.filter((p: any) => p.motorizado_id === motorizadoId));
    } catch (e) { console.error(e); }
  };
  fetchLocal();
  const interval = setInterval(fetchLocal, 6000);
  return () => clearInterval(interval);
};

// USUARIOS (REEMPLAZO DE FIRESTORE)
export const getUsuarioByUid = async (uid: string): Promise<Usuario | null> => {
  try {
    const data = await apiFetch(`/users/${uid}`);
    return data;
  } catch (e) {
    return null;
  }
};

export const getUsuario = getUsuarioByUid;

export const actualizarDatosUsuario = async (userId: string, datos: Partial<Usuario>) => {
  return await apiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: datos
  });
};

export const syncUsuario = async (usuario: Usuario) => {
  try {
    return await apiFetch('/users/sync', {
      method: 'POST',
      body: usuario
    });
  } catch (e) {
    console.error("Error sincronizando usuario:", e);
  }
};

export const listenUsuarios = (callback: (usuarios: Usuario[]) => void) => {
  let lastData = '';
  const fetchLocal = async () => {
    try {
      const data = await apiFetch('/users'); 
      const current = JSON.stringify(data);
      if (current !== lastData) {
        lastData = current;
        callback(data);
      }
    } catch (e) { console.error(e); }
  };
  fetchLocal();
  const interval = setInterval(fetchLocal, 15000); // 15s for users list
  return () => clearInterval(interval);
};

export const actualizarRolUsuario = async (userId: string, nuevoRol: UserRole) => {
  return await apiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: { rol: nuevoRol }
  });
};

export const aprobarUsuario = async (userId: string, aprobado: boolean = true) => {
  return await apiFetch(`/users/${userId}`, {
    method: 'PUT',
    body: { aprobado }
  });
};

export const deleteUsuario = async (userId: string) => {
  return await apiFetch(`/users/${userId}`, {
    method: 'DELETE'
  });
};

export const crearUsuarioPersonal = async (email: string, password: string, nombre: string, rol: UserRole) => {
  return await apiFetch('/register', {
    method: 'POST',
    body: { email, password, nombre, rol }
  });
};

// CHAT (REEMPLAZO DE FIRESTORE)
export const enviarMensaje = async (chatId: string, remitenteId: string, remitenteNombre: string, texto: string) => {
  return await apiFetch('/messages', {
    method: 'POST',
    body: { chatId, remitenteId, remitenteNombre, texto }
  });
};

export const listenMensajes = (chatId: string, callback: (mensajes: Mensaje[]) => void) => {
  const fetchLocal = async () => {
    try {
      const data = await apiFetch(`/messages?chatId=${chatId}`);
      callback(data);
    } catch (e) { console.error(e); }
  };
  fetchLocal();
  const interval = setInterval(fetchLocal, 3000); // 3s instead of 5s
  return () => clearInterval(interval);
};

// ---------------------------------------------------
// TARIFAS MOTO TAXI — API MySQL cPanel
// ---------------------------------------------------

export const getTarifasMotoTaxi = async (): Promise<TarifaMotoTaxi[]> => {
  try {
    const data = await apiFetch('/mototaxi-tarifas');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Error cargando tarifas moto taxi:', e);
    return [];
  }
};

export const crearTarifaMotoTaxi = async (datos: Omit<TarifaMotoTaxi, 'id' | 'timestamp'>): Promise<TarifaMotoTaxi> => {
  return await apiFetch('/mototaxi-tarifas', {
    method: 'POST',
    body: datos
  });
};

export const actualizarTarifaMotoTaxi = async (id: string, datos: Partial<TarifaMotoTaxi>): Promise<void> => {
  await apiFetch(`/mototaxi-tarifas/${id}`, {
    method: 'PUT',
    body: datos
  });
};

export const eliminarTarifaMotoTaxi = async (id: string): Promise<void> => {
  await apiFetch(`/mototaxi-tarifas/${id}`, {
    method: 'DELETE'
  });
};


// ---------------------------------------------------
// PRECIOS GENERALES (COMPRA/RECOLECCIÓN)
// ---------------------------------------------------

export const getTarifasGenerales = async () => {
  try {
    const all = await getTarifasMotoTaxi();
    return {
      compra: all.find(t => t.nombre === '___BASE_COMPRA___'),
      recoleccion: all.find(t => t.nombre === '___BASE_RECOLECCION___')
    };
  } catch (e) {
    return { compra: undefined, recoleccion: undefined };
  }
};

export const guardarTarifaGeneral = async (tipo: 'compra' | 'recoleccion', precio: number) => {
  const all = await getTarifasMotoTaxi();
  const nombre = tipo === 'compra' ? '___BASE_COMPRA___' : '___BASE_RECOLECCION___';
  const existente = all.find(t => t.nombre === nombre);

  if (existente) {
    return await actualizarTarifaMotoTaxi(existente.id, { precio });
  } else {
    return await crearTarifaMotoTaxi({
      nombre,
      precio,
      descripcion: `Precio base por defecto para ${tipo}`,
      activo: true
    });
  }
};
export const limpiarHistorial = async (type: 'orders' | 'messages' | 'notifications' | 'all' = 'all') => {
  return await apiFetch('/admin/clear-history', {
    method: 'POST',
    body: { type }
  });
};
