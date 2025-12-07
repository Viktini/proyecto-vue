// services/authService.js
import api from './api' // Importamos la instancia configurada de axios

const authService = {
  /**
   * Iniciar sesión con credenciales
   * @param {Object} credentials - {username, password}
   * @returns {Promise} Usuario autenticado
   */
  async login(credentials) {
    try {
      // Usamos la instancia 'api' que ya tiene withCredentials: true
      const response = await api.post('/api/auth/login', credentials);

      // El backend guarda el token en una cookie HTTP-only, no lo devuelve en el body
      // Pero devuelve el usuario, que podemos guardar en localStorage
      if (response.data.usuario) {
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el inicio de sesión';
      throw new Error(message);
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Usuario creado
   */
  async register(userData) {
    try {
      const response = await api.post('/api/auth/register', userData);

      if (response.data.usuario) {
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro';
      throw new Error(message);
    }
  },

  /**
 * Obtener el rol del usuario actual
 * @returns {string|null} Rol del usuario o null
 */
  getUserRole() {
    const user = this.getStoredUser();
    return user ? user.rol_usuario : null;
  },

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si el usuario tiene el rol
   */
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean} True si es administrador
   */
  isAdmin() {
    return this.hasRole('admin');
  },

  /**
   * Verificar si el usuario es cliente
   * @returns {boolean} True si es cliente
   */
  isCliente() {
    return this.hasRole('cliente');
  },

  /**
   * Verificar token actual (prueba de autenticación)
   * @returns {Promise} Resultado de verificación
   */
  async verifyToken() {
    try {
      const response = await api.post('/api/auth/verify');
      return response.data;
    } catch (error) {
      // Si falla, eliminar usuario del localStorage
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise} Resultado del logout
   */
  async logout() {
    try {
      const response = await api.post('/api/auth/logout');

      // Limpiar localStorage al hacer logout
      localStorage.removeItem('user');

      return response.data;
    } catch (error) {
      console.error('Error en logout:', error);
      // Aún así limpiar localStorage
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Obtener usuario actual desde el backend
   * @returns {Promise} Usuario actual o null
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/api/auth/me');

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      // Si falla, eliminar usuario del localStorage
      localStorage.removeItem('user');
      return null;
    }
  },

  /**
   * Obtener usuario almacenado en localStorage
   * @returns {Object|null} Usuario almacenado
   */
  getStoredUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario almacenado:', error);
      return null;
    }
  },

  /**
   * Verificar si el usuario está autenticado (basado en localStorage y token válido)
   * @returns {Promise<Object>} {isAuthenticated: boolean, user: Object|null}
   */
  async checkAuthStatus() {
    try {
      // Intentar obtener el usuario actual desde el backend
      const user = await this.getCurrentUser();

      // Si hay usuario, verificar token
      if (user) {
        await this.verifyToken();
        return { isAuthenticated: true, user };
      }

      return { isAuthenticated: false, user: null };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  },

  /**
   * Verificar rápidamente si hay un usuario almacenado
   * @returns {boolean} True si hay usuario en localStorage
   */
  isAuthenticated() {
    return !!this.getStoredUser();
  },

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si el usuario tiene el rol
   */
  hasRole(role) {
    const user = this.getStoredUser();
    return user && user.rol_usuario === role;
  },

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean} True si es administrador
   */
  isAdmin() {
    return this.hasRole('admin') || this.hasRole('administrador');
  },

  /**
   * Verificar si el usuario es cliente
   * @returns {boolean} True si es cliente
   */
  isCliente() {
    return this.hasRole('cliente') || this.hasRole('user');
  },

  /**
   * Obtener el ID del usuario actual
   * @returns {number|null} ID del usuario o null
   */
  getUserId() {
    const user = this.getStoredUser();
    return user ? user.id_usuario : null;
  },

  /**
   * Obtener el nombre del usuario actual
   * @returns {string|null} Nombre del usuario o null
   */
  getUserName() {
    const user = this.getStoredUser();
    return user ? user.nom_usuario : null;
  },

  /**
   * Limpiar todos los datos de autenticación
   */
  clearAuthData() {
    localStorage.removeItem('user');
    // También podrías limpiar otras cosas relacionadas con auth
  },

  /**
   * Refrescar datos del usuario (actualizar desde backend)
   * @returns {Promise} Datos actualizados del usuario
   */
  async refreshUserData() {
    try {
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }
};

export default authService;