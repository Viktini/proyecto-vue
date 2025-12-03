// src/services/api.js
import axios from 'axios'

// Backend NestJS corre en puerto 5000
const API_URL = 'http://localhost:5000/api/v1'

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para debug
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 Enviando ${config.method.toUpperCase()} a:`, config.baseURL + config.url)
    console.log('📦 Datos:', config.data)
    return config
  },
  (error) => {
    console.error('❌ Error en request:', error)
    return Promise.reject(error)
  }
)

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta recibida:', response.data)
    return response.data
  },
  (error) => {
    console.error('❌ Error en respuesta:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.baseURL + error.config?.url
    })
    
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Error de conexión',
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

// Servicios específicos - USANDO LAS RUTAS CORRECTAS /auth/
export const authAPI = {
  login: (data) => {
    console.log('🔐 Intentando login en /auth/login...')
    // AJUSTA ESTOS CAMPOS SEGÚN LO QUE ESPERE TU BACKEND
    // Probablemente espera 'username' y 'password', no 'nom_usuario'
    const loginData = {
      username: data.nom_usuario, // o podría ser 'email'
      password: data.contrasenna_usuario
    }
    return api.post('/auth/login', loginData)
  },
  register: (data) => {
    console.log('📝 Intentando registro en /auth/register...')
    // Ajusta los campos según tu backend
    const registerData = {
      username: data.username,
      password: data.password,
      email: data.email || `${data.username}@example.com`, // Si requiere email
      // Añade otros campos que requiera tu backend
    }
    return api.post('/auth/register', registerData)
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('👋 Logout exitoso')
  },
  isAuthenticated: () => !!localStorage.getItem('token'),
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },
  // Nuevo: Endpoint de health
  healthCheck: () => api.get('/auth/health')
}

// API de prueba
export const testAPI = {
  testConnection: (data) => api.post('/test-connection', data),
  getAuthHealth: () => api.get('/auth/health')
}

export default api