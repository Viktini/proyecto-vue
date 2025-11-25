import axios from 'axios';

// Puerto 5001 para el backend
const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos para desarrollo
});

// Interceptor para logs en desarrollo
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 Vue → Backend: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Error en request Vue:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Backend → Vue: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta Backend:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

// ✅ Función para probar conexión con backend
export const testBackendConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'No se pudo conectar al backend';
    throw new Error(`Backend: ${message}`);
  }
};

// ✅ Función para enviar mensaje de prueba
export const sendTestMessage = async (message) => {
  try {
    const response = await api.post('/test-connection', {
      message: message,
      frontendTimestamp: new Date().toISOString(),
      frontend: 'Vue.js 3',
      framework: 'Composition API'
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error enviando mensaje';
    throw new Error(`Backend: ${message}`);
  }
};

// ✅ Funciones para usuarios
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error obteniendo usuarios';
    throw new Error(`Backend: ${message}`);
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error creando usuario';
    throw new Error(`Backend: ${message}`);
  }
};

export default api;