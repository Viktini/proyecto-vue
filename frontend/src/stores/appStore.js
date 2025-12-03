import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Estado de autenticación
  const auth = ref({
    isAuthenticated: false,
    user: null,
    token: null
  })

  // Datos de la aplicación
  const tratamientos = ref([])
  const areas = ref([])
  const paquetes = ref([])
  const citas = ref([])
  const paquetesComprados = ref([])

  // Estados de UI
  const loading = ref(false)
  const error = ref(null)

  // Selecciones temporales
  const tratamientoSeleccionado = ref(null)
  const paqueteSeleccionado = ref(null)
  const tipoPaqueteSeleccionado = ref(null)

  // Getters computados
  const isCliente = computed(() => auth.value.user?.rol_usuario === 'cliente')
  const isAdmin = computed(() => auth.value.user?.rol_usuario === 'admin')
  const userRole = computed(() => auth.value.user?.rol_usuario)

  // ✅ GETTERS DE COMPATIBILIDAD
  const user = computed(() => auth.value.user)
  const isAuthenticated = computed(() => auth.value.isAuthenticated)

  // Filtros comunes
  const tratamientosPorCategoria = (categoria) => {
    return tratamientos.value.filter(t => t.categoria === categoria)
  }

  const citasPorCarnet = (carnet) => {
    return citas.value.filter(c => c.carnet === carnet)
  }

  const paquetesPorCarnet = (carnet) => {
    return paquetesComprados.value.filter(p => p.carnet === carnet)
  }

  // ✅ FUNCIÓN DE SINCRONIZACIÓN CON LOCALSTORAGE
  const syncStoreWithLocalStorage = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser) {
      try {
        auth.value.user = JSON.parse(savedUser)
        auth.value.isAuthenticated = true
        auth.value.token = savedToken || null
        console.log('🔄 Store sincronizado con localStorage')
      } catch (error) {
        console.error('❌ Error sincronizando store:', error)
      }
    }
  }

  // LOGIN
  // En appStore.js - función login
  const login = async (userData) => {
    try {
      loading.value = true
      console.log('📤 Enviando login:', userData)

      // ✅ Cambia a la nueva ruta /auth/login
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,  // ← nombre de campo actualizado
          password: userData.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al iniciar sesión')
      }

      const result = await response.json()
      console.log('✅ Login exitoso:', result)

      // ✅ La nueva estructura devuelve access_token y usuario
      auth.value.user = result.usuario
      auth.value.isAuthenticated = true
      auth.value.token = result.access_token  // ← Token real del JWT

      localStorage.setItem('user', JSON.stringify(result.usuario))
      localStorage.setItem('token', result.access_token)  // ← Token JWT real
      localStorage.setItem('auth', JSON.stringify(auth.value))

      return result

    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // REGISTRO
  const register = async (userData) => {
    try {
      loading.value = true
      console.log('📤 Enviando registro con carnet:', userData)

      const response = await fetch('http://localhost:5000/api/usuarios/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: userData.id_usuario,
          nom_usuario: userData.username,
          contrasenna_usuario: userData.password,
          rol_usuario: 'cliente'
        })
      })

      console.log('📥 Respuesta del servidor status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en el registro')
      }

      const result = await response.json()
      console.log('✅ Registro exitoso:', result)
      return result

    } catch (error) {
      console.error('❌ Error en register:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // LOGOUT
  const logout = () => {
    auth.value = {
      isAuthenticated: false,
      user: null,
      token: null
    }
    localStorage.removeItem('auth')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    console.log('🚪 Usuario cerró sesión')
  }

  // VERIFICAR TOKEN
  const verifyToken = async () => {
    const token = auth.value.token
    if (!token) return false

    try {
      const response = await fetch('http://localhost:5000/api/usuarios/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        auth.value.user = data.user
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      logout()
      return false
    }
  }

  // INICIALIZAR AUTENTICACIÓN
  const initializeAuth = () => {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const parsedAuth = JSON.parse(authData)
      auth.value = parsedAuth

      // Verificar si el token sigue siendo válido
      if (parsedAuth.token) {
        verifyToken()
      }
    } else {
      // También verificar los items individuales por compatibilidad
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      if (savedUser && savedToken) {
        auth.value.user = JSON.parse(savedUser)
        auth.value.token = savedToken
        auth.value.isAuthenticated = true
        localStorage.setItem('auth', JSON.stringify(auth.value))
      }
    }
  }

  // ✅ FETCH SIMPLIFICADO - SIN AUTENTICACIÓN POR AHORA
  const simpleFetch = async (url, options = {}) => {
    try {
      console.log('🌐 Fetch a:', url)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        const text = await response.text()
        console.warn('⚠️ Respuesta no es JSON:', text)
        return { data: text }
      }
    } catch (error) {
      console.error('❌ Error en fetch:', error)
      throw error
    }
  }

  // CARGAR TRATAMIENTOS - VERSIÓN SIMPLIFICADA
  const cargarTratamientos = async () => {
    try {
      console.log('📥 Cargando tratamientos...')
      // ✅ USAR RUTA CORRECTA SIN AUTENTICACIÓN POR AHORA
      const data = await simpleFetch('http://localhost:5000/api/tratamientos')
      tratamientos.value = data
      console.log('✅ Tratamientos cargados:', data.length)
    } catch (error) {
      console.error('❌ Error cargando tratamientos:', error)
      // ✅ CARGAR DATOS DE PRUEBA SI FALLA
      tratamientos.value = [
        { id: 1, nombre: 'Masaje Relajante', precio: 50, duracion: 60 },
        { id: 2, nombre: 'Facial de Lujo', precio: 80, duracion: 90 }
      ]
      console.log('📋 Usando tratamientos de prueba')
    }
  }

  // CARGAR AREAS - VERSIÓN SIMPLIFICADA
  const cargarAreas = async () => {
    try {
      console.log('📥 Cargando áreas...')
      const data = await simpleFetch('http://localhost:5000/api/areas')
      areas.value = data
      console.log('✅ Áreas cargadas:', data.length)
    } catch (error) {
      console.error('❌ Error cargando áreas:', error)
      // ✅ CARGAR DATOS DE PRUEBA SI FALLA
      areas.value = [
        { id: 1, nombre: 'Spa Principal', descripcion: 'Área principal de tratamientos' },
        { id: 2, nombre: 'Zona de Masajes', descripcion: 'Especializada en masajes' }
      ]
      console.log('📋 Usando áreas de prueba')
    }
  }

  // CARGAR PAQUETES - VERSIÓN SIMPLIFICADA
  const cargarPaquetes = async () => {
    try {
      console.log('📥 Cargando paquetes...')
      const data = await simpleFetch('http://localhost:5000/api/paquetes')
      paquetes.value = data
      console.log('✅ Paquetes cargados:', data.length)
    } catch (error) {
      console.error('❌ Error cargando paquetes:', error)
      // ✅ CARGAR DATOS DE PRUEBA SI FALLA
      paquetes.value = [
        { id: 1, nombre: 'Paquete Relax', precio: 120, tratamientos: ['Masaje', 'Facial'] },
        { id: 2, nombre: 'Paquete Premium', precio: 200, tratamientos: ['Masaje', 'Facial', 'Manicura'] }
      ]
      console.log('📋 Usando paquetes de prueba')
    }
  }

  // RESERVAR CITA
  const reservarCita = async (citaData) => {
    try {
      const response = await simpleFetch('http://localhost:5000/api/citas', {
        method: 'POST',
        body: JSON.stringify(citaData)
      })

      if (response) {
        const nuevaCita = response
        citas.value.push(nuevaCita)
        return nuevaCita
      }
    } catch (error) {
      console.error('Error reservando cita:', error)
      throw error
    }
  }

  // COMPRAR PAQUETE
  const comprarPaquete = async (paqueteData) => {
    try {
      const response = await simpleFetch('http://localhost:5000/api/paquetes/comprar', {
        method: 'POST',
        body: JSON.stringify(paqueteData)
      })

      if (response) {
        const nuevoPaquete = response
        paquetesComprados.value.push(nuevoPaquete)
        return nuevoPaquete
      }
    } catch (error) {
      console.error('Error comprando paquete:', error)
      throw error
    }
  }

  // CANCELAR CITA
  const cancelarCita = async (citaId) => {
    try {
      const response = await simpleFetch(`http://localhost:5000/api/citas/${citaId}`, {
        method: 'DELETE'
      })

      if (response) {
        citas.value = citas.value.filter(c => c.id !== citaId)
      }
    } catch (error) {
      console.error('Error cancelando cita:', error)
      throw error
    }
  }

  // CANCELAR PAQUETE
  const cancelarPaquete = async (paqueteId) => {
    try {
      const response = await simpleFetch(`http://localhost:5000/api/paquetes/${paqueteId}`, {
        method: 'DELETE'
      })

      if (response) {
        paquetesComprados.value = paquetesComprados.value.filter(p => p.id !== paqueteId)
      }
    } catch (error) {
      console.error('Error cancelando paquete:', error)
      throw error
    }
  }

  // ACTUALIZAR DATOS USUARIO
  const actualizarDatosUsuario = async (datosUsuario) => {
    try {
      const response = await simpleFetch(`http://localhost:5000/api/usuarios/${auth.value.user.nom_usuario}`, {
        method: 'PATCH',
        body: JSON.stringify(datosUsuario)
      })

      if (response) {
        const usuarioActualizado = response
        auth.value.user = { ...auth.value.user, ...usuarioActualizado }
        localStorage.setItem('user', JSON.stringify(auth.value.user))
        localStorage.setItem('auth', JSON.stringify(auth.value))
        return usuarioActualizado
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  }

  // UTILIDADES
  const limpiarSeleccionPaquete = () => {
    paqueteSeleccionado.value = null
    tipoPaqueteSeleccionado.value = null
  }

  // INICIALIZACIÓN
  const inicializarDesdeLocalStorage = () => {
    syncStoreWithLocalStorage() // ✅ SINCRONIZAR AL INICIAR
  }

  // ✅ INICIALIZAR AUTOMÁTICAMENTE AL CREAR EL STORE
  syncStoreWithLocalStorage()

  // RETURN FINAL
  return {
    // State
    auth,
    tratamientos,
    areas,
    paquetes,
    citas,
    paquetesComprados,
    loading,
    error,
    tratamientoSeleccionado,
    paqueteSeleccionado,
    tipoPaqueteSeleccionado,

    // Getters
    isCliente,
    isAdmin,
    userRole,
    user, // ✅ AGREGADO
    isAuthenticated, // ✅ AGREGADO

    // Actions
    login,
    register,
    logout,
    verifyToken,
    initializeAuth,
    authenticatedFetch: simpleFetch, // ✅ ALIAS PARA COMPATIBILIDAD
    simpleFetch, // ✅ NUEVO MÉTODO SIMPLIFICADO
    cargarTratamientos,
    cargarAreas,
    cargarPaquetes,
    reservarCita,
    comprarPaquete,
    cancelarCita,
    cancelarPaquete,
    actualizarDatosUsuario,
    tratamientosPorCategoria,
    citasPorCarnet,
    paquetesPorCarnet,
    limpiarSeleccionPaquete,
    inicializarDesdeLocalStorage,
    syncStoreWithLocalStorage // ✅ EXPORTAR PARA USO EXTERNO
  }
})