// src/config/api.js
export const API_CONFIG = {
    // URL base de la API
    BASE_URL: process.env.VUE_APP_API_URL || 'http://localhost:5000/api',
    
    // Endpoints principales
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/usuarios/login',
        REGISTER: '/usuarios/register',
        LOGOUT: '/usuarios/logout',
        PROFILE: '/usuarios/perfil'
      },
      TRATAMIENTOS: '/tratamientos',
      PAQUETES: '/paquetes',
      CITAS: '/citas',
      USUARIOS: '/usuarios',
      ADMIN: '/admin'
    },
    
    // Configuración de timeout
    TIMEOUT: 10000, // 10 segundos
    
    // Configuración de reintentos
    RETRY: {
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000
    },
    
    // Configuración de cache
    CACHE: {
      ENABLED: true,
      DEFAULT_TTL: 300000 // 5 minutos en milisegundos
    }
  };
  
  // Función para obtener la URL completa de un endpoint
  export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  };
  
  // Función para construir parámetros de consulta
  export const buildQueryParams = (params) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return queryParams.toString();
  };