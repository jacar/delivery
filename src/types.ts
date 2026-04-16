export type UserRole = 'admin' | 'motorizado' | 'cliente';

export interface Usuario {
  uid: string;
  nombre: string;
  email?: string;
  rol: UserRole;
  fcmToken?: string;
  telefono?: string;
  // Campos para repartidores
  tipoVehiculo?: string;
  placaVehiculo?: string;
  documentoId?: string;
  fotoUrl?: string;
  disponible?: boolean;
  ocupado?: boolean;
}

export type PedidoEstado = 'disponible' | 'asignado' | 'en_camino' | 'entregado';
export type PedidoTipo = 'compra' | 'recolección' | 'mototaxi';

export interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
}

export interface Mensaje {
  id: string;
  chatId: string; // usually the driver's uid
  remitenteId: string;
  remitenteNombre: string;
  texto: string;
  timestamp: any;
}

export interface Pedido {
  id: string;
  cliente_id: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  tipo: PedidoTipo;
  descripcion: string;
  ubicacion_recogida?: Ubicacion;
  ubicacion_entrega?: Ubicacion;
  estado: PedidoEstado;
  motorizado_id?: string;
  motorizado_nombre?: string;
  motorizado_telefono?: string;
  aceptado_por_motorizado?: boolean;
  ubicacion_actual?: { lat: number; lng: number };
  last_update?: any;
  timestamp: any; // Firestore Timestamp
}

export interface TarifaMotoTaxi {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  activo: boolean;
  timestamp?: any;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: string;
  imagenUrl?: string;
}

export interface Aliado {
  id: string;
  nombre: string;
  logoUrl: string;
  descripcion?: string;
  whatsapp?: string;
  imagenes?: string[];
  productos?: Producto[];
  timestamp: any;
}
