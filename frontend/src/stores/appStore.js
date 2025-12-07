import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Estado de autenticación
  const auth = ref({
    isAuthenticated: false,
    user: null
    // ❌ NO hay "token" porque está en cookie HTTP-only
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

  // GETTERS DE COMPATIBILIDAD
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

  const syncStoreWithLocalStorage = () => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      try {
        if (savedUser === 'undefined' || savedUser === 'null') {
          console.log('⚠️ Datos inválidos en localStorage, limpiando...')
          localStorage.removeItem('user')
          return
        }

        const user = JSON.parse(savedUser)

        // ✅ SOLO cargar el usuario, NO establecer isAuthenticated como true
        if (user && typeof user === 'object' && user.nom_usuario) {
          auth.value.user = user
          console.log('🔄 Store sincronizado con localStorage (solo usuario)')
        } else {
          console.log('⚠️ Datos de usuario inválidos, limpiando...')
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('❌ Error sincronizando store:', error)
        localStorage.removeItem('user')
      }
    }
  }

  // ✅ LOGIN - Con cookies (el token viene en cookie HTTP-only)
  const login = async (userData) => {
    try {
      loading.value = true
      console.log('📤 Enviando login:', userData)

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ IMPORTANTE: Para enviar/recibir cookies
        body: JSON.stringify({
          username: userData.username,
          password: userData.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al iniciar sesión')
      }

      const result = await response.json()
      console.log('✅ Login exitoso:', result)

      // ✅ El token NO está en result, está en cookie HTTP-only
      // Solo guardamos los datos del usuario
      auth.value.user = result.usuario
      auth.value.isAuthenticated = true

      // Guardar usuario en localStorage (solo para UI)
      localStorage.setItem('user', JSON.stringify(result.usuario))
      // ❌ NO guardar token - está en cookie HTTP-only

      return result

    } catch (error) {
      console.error('❌ Error en login:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // ✅ REGISTRO - Con cookies
  const register = async (userData) => {
    try {
      loading.value = true
      console.log('📤 Enviando registro:', userData)

      const backendData = {
        id_usuario: userData.carnet,
        nom_usuario: userData.username,
        contrasenna_usuario: userData.password,
        rol_usuario: userData.rol_usuario || 'cliente'
      }

      console.log('📤 Datos para backend:', backendData)

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Para cookies
        body: JSON.stringify(backendData)
      })

      console.log('📥 Respuesta del servidor status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error en el registro')
      }

      const result = await response.json()
      console.log('✅ Registro exitoso:', result)

      // ✅ Auto-login después del registro (cookie ya está establecida)
      auth.value.user = result.usuario
      auth.value.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(result.usuario))

      return result

    } catch (error) {
      console.error('❌ Error en register:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      // Llamar al endpoint de logout
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Error en logout backend:', error)
    } finally {
      // Limpiar TODO el estado
      auth.value = {
        isAuthenticated: false,
        user: null
      }
      localStorage.removeItem('user')
      // También limpiar sessionStorage por si acaso
      sessionStorage.clear()
      console.log('🚪 Usuario cerró sesión - Estado limpiado completamente')
    }
  }
  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        auth.value.user = data.user
        auth.value.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(data.user))
        return true
      } else {
        // Limpiar todo si falla la verificación
        auth.value.isAuthenticated = false
        auth.value.user = null
        localStorage.removeItem('user')
        return false
      }
    } catch (error) {
      console.warn('⚠️ No se pudo verificar autenticación:', error)
      // Limpiar en caso de error
      auth.value.isAuthenticated = false
      auth.value.user = null
      localStorage.removeItem('user')
      return false
    }
  }

  // ✅ FETCH CON COOKIES AUTOMÁTICAS
  const simpleFetch = async (url, options = {}) => {
    try {
      console.log('🌐 Fetch a:', url)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include', // ✅ Envía cookies automáticamente
        ...options
      })

      if (!response.ok) {
        // Si es 401, podríamos hacer logout automático
        if (response.status === 401) {
          console.warn('⚠️ Token expirado o inválido')
          auth.value.isAuthenticated = false
          auth.value.user = null
          localStorage.removeItem('user')
        }
        throw new Error(`Error HTTP: ${response.status}`)
      }

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

  // ✅ FUNCIÓN PARA DEBUG (opcional)
  const debugCookies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/debug-cookies', {
        credentials: 'include'
      })
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error debug cookies:', error)
    }
  }

  // Resto de funciones (sin cambios)
  const cargarTratamientos = async () => {
    try {
      console.log('📥 Cargando tratamientos...')
      const data = await simpleFetch('http://localhost:5000/api/tratamientos')
      tratamientos.value = data
      console.log('✅ Tratamientos cargados:', data.length)
    } catch (error) {
      console.error('❌ Error cargando tratamientos:', error)
      tratamientos.value = [
        { id: 1, nombre: 'Masaje Relajante', precio: 50, duracion: 60 },
        { id: 2, nombre: 'Facial de Lujo', precio: 80, duracion: 90 }
      ]
      console.log('📋 Usando tratamientos de prueba')
    }
  }

  const cargarAreas = async () => {
    try {
      console.log('📥 Cargando áreas...')
      const data = await simpleFetch('http://localhost:5000/api/areas')
      areas.value = data
      console.log('✅ Áreas cargadas:', data.length)
    } catch (error) {
      console.error('❌ Error cargando áreas:', error)
      areas.value = [
        { id: 1, nombre: 'Spa Principal', descripcion: 'Área principal de tratamientos' },
        { id: 2, nombre: 'Zona de Masajes', descripcion: 'Especializada en masajes' }
      ]
      console.log('📋 Usando áreas de prueba')
    }
  }

  const cargarPaquetes = async () => {
    try {
      console.log('📥 Cargando paquetes...')
      const data = await simpleFetch('http://localhost:5000/api/paquetes')
      paquetes.value = data
      console.log('✅ Paquetes cargados:', data.length)
    } catch (error) {
      console.error('❌ Error cargando paquetes:', error)
      paquetes.value = [
        { id: 1, nombre: 'Paquete Relax', precio: 120, tratamientos: ['Masaje', 'Facial'] },
        { id: 2, nombre: 'Paquete Premium', precio: 200, tratamientos: ['Masaje', 'Facial', 'Manicura'] }
      ]
      console.log('📋 Usando paquetes de prueba')
    }
  }

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
        return usuarioActualizado
      }
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  }

  const limpiarSeleccionPaquete = () => {
    paqueteSeleccionado.value = null
    tipoPaqueteSeleccionado.value = null
  }

  // ✅ INICIALIZAR DESDE LOCALSTORAGE
  syncStoreWithLocalStorage()

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
    user,
    isAuthenticated,

    // Actions
    login,
    register,
    logout,
    checkSession,
    debugCookies,
    simpleFetch,
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
    syncStoreWithLocalStorage
  }
})