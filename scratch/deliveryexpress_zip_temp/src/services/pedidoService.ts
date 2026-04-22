import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  setDoc
} from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { Pedido, PedidoEstado, PedidoTipo, Ubicacion, Usuario, UserRole } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const createPedido = async (
  clienteId: string, 
  clienteNombre: string,
  clienteTelefono: string,
  tipo: PedidoTipo, 
  descripcion: string, 
  recogida?: Ubicacion, 
  entrega?: Ubicacion
) => {
  const path = 'pedidos';
  try {
    await addDoc(collection(db, path), {
      cliente_id: clienteId,
      cliente_nombre: clienteNombre,
      cliente_telefono: clienteTelefono,
      tipo,
      descripcion,
      ubicacion_recogida: recogida || null,
      ubicacion_entrega: entrega || null,
      estado: 'disponible',
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const tomarPedido = async (pedidoId: string, motorizadoId: string, motorizadoNombre: string, motorizadoTelefono: string) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  try {
    await runTransaction(db, async (transaction) => {
      const pedidoDoc = await transaction.get(pedidoRef);
      if (!pedidoDoc.exists()) {
        throw new Error("El pedido no existe.");
      }

      const data = pedidoDoc.data() as Pedido;
      if (data.estado !== 'disponible') {
        throw new Error("El pedido ya no está disponible.");
      }

      transaction.update(pedidoRef, {
        estado: 'asignado',
        motorizado_id: motorizadoId,
        motorizado_nombre: motorizadoNombre,
        motorizado_telefono: motorizadoTelefono,
        aceptado_por_motorizado: true, // If they take it themselves, it's accepted
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pedidos/${pedidoId}`);
  }
};

export const asignarPedido = async (pedidoId: string, motorizadoId: string, motorizadoNombre: string, motorizadoTelefono: string) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  try {
    await updateDoc(pedidoRef, {
      estado: 'asignado',
      motorizado_id: motorizadoId,
      motorizado_nombre: motorizadoNombre,
      motorizado_telefono: motorizadoTelefono,
      aceptado_por_motorizado: false, // Admin assigned, driver must accept
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pedidos/${pedidoId}`);
  }
};

export const aceptarPedido = async (pedidoId: string) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  try {
    await updateDoc(pedidoRef, {
      aceptado_por_motorizado: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pedidos/${pedidoId}`);
  }
};

export const actualizarEstadoPedido = async (pedidoId: string, nuevoEstado: PedidoEstado) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  try {
    await updateDoc(pedidoRef, { estado: nuevoEstado });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pedidos/${pedidoId}`);
  }
};

export const actualizarUbicacionRepartidor = async (pedidoId: string, lat: number, lng: number) => {
  const pedidoRef = doc(db, 'pedidos', pedidoId);
  try {
    await updateDoc(pedidoRef, {
      ubicacion_actual: { lat, lng },
      last_update: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pedidos/${pedidoId}`);
  }
};

export const listenPedidosDisponibles = (callback: (pedidos: Pedido[]) => void) => {
  const q = query(
    collection(db, 'pedidos'), 
    where('estado', '==', 'disponible'),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
    callback(pedidos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'pedidos');
  });
};

export const listenMisPedidosCliente = (clienteId: string, callback: (pedidos: Pedido[]) => void) => {
  const q = query(
    collection(db, 'pedidos'), 
    where('cliente_id', '==', clienteId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
    callback(pedidos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'pedidos');
  });
};

export const listenMisPedidosMotorizado = (motorizadoId: string, callback: (pedidos: Pedido[]) => void) => {
  const q = query(
    collection(db, 'pedidos'), 
    where('motorizado_id', '==', motorizadoId),
    orderBy('timestamp', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
    callback(pedidos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'pedidos');
  });
};

export const listenTodosLosPedidos = (callback: (pedidos: Pedido[]) => void) => {
  const q = query(collection(db, 'pedidos'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pedido));
    callback(pedidos);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'pedidos');
  });
};

export const listenUsuarios = (callback: (usuarios: Usuario[]) => void) => {
  const q = query(collection(db, 'usuarios'), orderBy('nombre', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const usuarios = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Usuario));
    callback(usuarios);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'usuarios');
  });
};

export const actualizarRolUsuario = async (userId: string, nuevoRol: UserRole) => {
  const userRef = doc(db, 'usuarios', userId);
  try {
    await updateDoc(userRef, { rol: nuevoRol });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `usuarios/${userId}`);
  }
};

export const actualizarDatosUsuario = async (userId: string, datos: Partial<Usuario>) => {
  const userRef = doc(db, 'usuarios', userId);
  try {
    await updateDoc(userRef, datos);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `usuarios/${userId}`);
  }
};

export const crearUsuarioPersonal = async (email: string, password: string, nombre: string, rol: UserRole) => {
  const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = userCredential.user.uid;
    
    const userRef = doc(db, 'usuarios', uid);
    try {
      await setDoc(userRef, {
        uid,
        nombre,
        rol,
        email
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `usuarios/${uid}`);
    }
    
    return uid;
  } catch (error) {
    console.error("Error creando usuario personal:", error);
    throw error;
  } finally {
    await deleteApp(secondaryApp);
  }
};
