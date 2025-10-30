import axios from "axios";

const API_URL = "http://localhost:8080/api/v1"; // Ajusta según tu backend

// Instancia base de Axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Login ---
export const loginUser = async (credentials: { username: string; password: string }) => {
  const response = await api.post("/login", credentials);
  return response.data; // debe devolver { token: "..." }
};

// --- Obtener items (GET /items) ---
export const getItems = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await api.get("/items", { headers });
  // Normaliza respuesta
  const data = response.data?.data || response.data;
  return Array.isArray(data) ? data : [];
};

// --- Crear item (POST /items) ---
export const createItem = async (item: { name: string; price: number; quantity: number }, token: string) => {
  const response = await api.post("/items", item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// --- Actualizar item (PUT /items/:id) ---
export const updateItem = async (
  id: number,
  item: { name: string; price: number; quantity: number },
  token: string
) => {
  const response = await api.put(`/items/${id}`, item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// --- Eliminar item (DELETE /items/:id) ---
export const deleteItem = async (id: number, token: string) => {
  const response = await api.delete(`/items/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
