import { API_BASE_URL } from './apiConfig';

export interface Notification {
  id: string | number;
  user_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'pedido' | 'mensaje' | 'sistema';
  leido: boolean;
  created_at: string;
}

async function apiFetch(endpoint: string, options: any = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return await response.json();
}

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  return await apiFetch(`/notifications?userId=${userId}`);
};

export const markAsRead = async (id: string | number): Promise<void> => {
  await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
};

export const clearNotifications = async (userId: string): Promise<void> => {
  await apiFetch(`/notifications?userId=${userId}`, { method: 'DELETE' });
};
