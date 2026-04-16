import { Producto, Aliado } from '../types';
import { API_BASE_URL } from './apiConfig';

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

  fetchLocal();
  const interval = setInterval(fetchLocal, 120000); // Cada 120s para optimizar recursos
  return () => clearInterval(interval);
};

export const crearAliado = async (
  nombre: string, 
  logoUrl: string, 
  descripcion: string = '', 
  whatsapp: string = '',
  imagenes: string[] = [],
  productos: Producto[] = []
): Promise<void> => {
  await fetch(`${API_BASE_URL}/allies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: Math.random().toString(36).substr(2, 9),
      nombre,
      logoUrl,
      descripcion,
      whatsapp,
      imagenes: JSON.stringify(imagenes),
      productos: JSON.stringify(productos)
    })
  });
};

export const actualizarAliado = async (id: string, data: Partial<Aliado>) => {
  const transformedData: any = { ...data };
  if (data.imagenes) {
    transformedData.imagenes = JSON.stringify(data.imagenes);
  }
  if (data.productos) {
    transformedData.productos = JSON.stringify(data.productos);
  }

  await fetch(`${API_BASE_URL}/allies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transformedData)
  });
};

export const eliminarAliado = async (id: string) => {
  await fetch(`${API_BASE_URL}/allies/${id}`, {
    method: 'DELETE'
  });
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
