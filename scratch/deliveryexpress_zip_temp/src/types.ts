export type UserRole = 'admin' | 'motorizado' | 'cliente';

export interface Usuario {
  uid: string;
  nombre: string;
  rol: UserRole;
  fcmToken?: string;
  telefono?: string;
  // Campos para repartidores
  tipoVehiculo?: string;
  documentoId?: string;
  fotoUrl?: string;
}

export type PedidoEstado = 'disponible' | 'asignado' | 'en_camino' | 'entregado';
export type PedidoTipo = 'compra' | 'recolección';

export interface Ubicacion {
  lat: number;
  lng: number;
  direccion: string;
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
