import { Producto, Aliado } from '../types';
import { API_BASE_URL } from './apiConfig';

let refreshTrigger: () => void = () => {};

export const listenAliados = (callback: (aliados: Aliado[]) => void) => {
  const fetchLocal = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/allies`);
      if (!response.ok) {
        const text = await response.text();
        console.error(`Error ${response.status} fetching allies:`, text);
        throw new Error('Error fetching allies');
      }
      const dataText = await response.text();
      try {
        const data = JSON.parse(dataText);
        const mappedData = data.map((item: any) => {
          let parsedImagenes = [];
          let parsedProductos = [];

          try {
            if (item.imagenes) parsedImagenes = typeof item.imagenes === 'string' ? JSON.parse(item.imagenes) : item.imagenes;
          } catch(e) {}

          try {
            if (item.productos) parsedProductos = typeof item.productos === 'string' ? JSON.parse(item.productos) : item.productos;
          } catch(e) {}

          return {
            ...item,
            imagenes: parsedImagenes,
            productos: parsedProductos
          };
        });
        callback(mappedData);
      } catch (e) {
        console.error("Error al parsear JSON de aliados:", e, "Contenido recibido:", dataText);
        callback([]);
      }
    } catch (e) {
      console.error("Error al escuchar aliados (Red/API):", e);
      callback([]);
    }
  };

  refreshTrigger = fetchLocal;
  fetchLocal();
  const interval = setInterval(fetchLocal, 60000); // Reducido a 60s
  return () => clearInterval(interval);
};

export const triggerRefreshAliados = () => {
  refreshTrigger();
};

export const crearAliado = async (
  id: string,
  nombre: string, 
  logoUrl: string, 
  descripcion: string = '', 
  whatsapp: string = '',
  imagenes: string[] = [],
  productos: Producto[] = []
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/allies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      nombre,
      logoUrl,
      descripcion,
      whatsapp,
      imagenes: JSON.stringify(imagenes),
      productos: JSON.stringify(productos)
    })
  });
  
  if (response.ok) {
    triggerRefreshAliados();
  }
};

export const actualizarAliado = async (id: string, data: Partial<Aliado>) => {
  const transformedData: any = { ...data };
  if (data.imagenes) {
    transformedData.imagenes = JSON.stringify(data.imagenes);
  }
  if (data.productos) {
    transformedData.productos = JSON.stringify(data.productos);
  }

  const response = await fetch(`${API_BASE_URL}/allies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transformedData)
  });

  if (response.ok) {
    triggerRefreshAliados();
  }
};

export const eliminarAliado = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/allies/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    triggerRefreshAliados();
  }
};

export const subirImagen = async (path: string, file: File | Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Error al subir imagen');
    const data = await response.json();
    return data.url;
  } catch (e: any) {
    console.error("Error subiendo imagen a Laravel:", e);
    return "https://via.placeholder.com/150"; 
  }
};

