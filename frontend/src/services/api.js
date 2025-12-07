import axios from 'axios';

// Puerto 5000 para el backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ¡IMPORTANTE! Esto permite enviar cookies automáticamente
  timeout: 15000, // 15 segundos para desarrollo
});

// Interceptor para logs en desarrollo
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🔄 Vue → Backend: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request Vue:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ Backend → Vue: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta Backend:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Manejo de errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o no válido
      localStorage.removeItem('user'); // Limpiar usuario del localStorage
      
      // Redirigir a login si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

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

// ✅ Funciones de autenticación con cookies
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    
    // El backend guarda el token en una cookie HTTP-only
    // El frontend solo recibe el usuario (sin token)
    if (response.data.usuario) {
      // Guardar información del usuario en localStorage (sin token)
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error en el login';
    throw new Error(`Backend: ${message}`);
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    
    if (response.data.usuario) {
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error en el registro';
    throw new Error(`Backend: ${message}`);
  }
};

export const logout = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    
    // Limpiar localStorage al hacer logout
    localStorage.removeItem('user');
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    // Aún así limpiar localStorage
    localStorage.removeItem('user');
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    const response = await api.post('/api/auth/verify');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    
    // Actualizar usuario en localStorage
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    // Si falla, eliminar usuario del localStorage
    localStorage.removeItem('user');
    return null;
  }
};

// ✅ Funciones para usuarios
export const getUsers = async () => {
  try {
    const response = await api.get('/api/usuarios');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error obteniendo usuarios';
    throw new Error(`Backend: ${message}`);
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/api/usuarios', userData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error creando usuario';
    throw new Error(`Backend: ${message}`);
  }
};

// ✅ Funciones para áreas
export const getAreas = async () => {
  try {
    const response = await api.get('/api/areas');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error obteniendo áreas';
    throw new Error(`Backend: ${message}`);
  }
};

// ✅ Funciones para tratamientos
export const getTratamientos = async () => {
  try {
    const response = await api.get('/api/tratamientos');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error obteniendo tratamientos';
    throw new Error(`Backend: ${message}`);
  }
};

// ✅ Funciones para categorías
export const getCategorias = async () => {
  try {
    const response = await api.get('/api/categorias');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'Error obteniendo categorías';
    throw new Error(`Backend: ${message}`);
  }
};

// ✅ Función para verificar el estado de la sesión
export const checkAuthStatus = async () => {
  try {
    // Intentar obtener el usuario actual
    const user = await getCurrentUser();
    
    // Si hay usuario, verificar token
    if (user) {
      await verifyToken();
      return { isAuthenticated: true, user };
    }
    
    return { isAuthenticated: false, user: null };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
};

// ✅ Función helper para obtener usuario desde localStorage
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// ✅ Función helper para verificar si hay usuario autenticado
export const isAuthenticated = () => {
  return !!getStoredUser();
};

// ✅ Función para agregar headers de autorización (opcional, si quieres compatibilidad)
export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;