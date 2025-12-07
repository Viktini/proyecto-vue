import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/appStore'

// Componentes
import Login from '../components/Login.vue'
import Home from '../views/Home.vue'
import Tratamientos from '../views/Tratamientos.vue'
import Paquetes from '../views/Paquetes.vue'
import ReservarCita from '../views/ReservarCita.vue'
import ComprarPaquete from '../views/ComprarPaquete.vue'
import MisReservas from '../views/MisReservas.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import DatosUsuario from '../views/DatosUsuario.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/tratamientos',
    name: 'Tratamientos',
    component: Tratamientos,
    meta: { requiresAuth: true }
  },
  {
    path: '/paquetes',
    name: 'Paquetes',
    component: Paquetes,
    meta: { requiresAuth: true }
  },
  {
    path: '/reservar-cita',
    name: 'ReservarCita',
    component: ReservarCita,
    meta: { requiresAuth: true, requiresRole: 'cliente' }
  },
  {
    path: '/comprar-paquete',
    name: 'ComprarPaquete',
    component: ComprarPaquete,
    meta: { requiresAuth: true, requiresRole: 'cliente' }
  },
  {
    path: '/mis-reservas',
    name: 'MisReservas',
    component: MisReservas,
    meta: { requiresAuth: true, requiresRole: 'cliente' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/datos-usuario',
    name: 'DatosUsuario',
    component: DatosUsuario,
    meta: { requiresAuth: true, requiresRole: 'cliente' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  console.log('🛡️ Router guard - Verificando ruta:', to.path)

  const appStore = useAppStore()

  // Rutas que son públicas (siempre accesibles)
  const publicPaths = ['/login', '/']

  if (publicPaths.includes(to.path)) {
    // Si ya está autenticado y trata de ir a login, redirigir
    if (appStore.isAuthenticated) {
      if (appStore.isAdmin) {
        next('/admin')
      } else {
        next('/home')
      }
      return
    }
    next()
    return
  }

  // Para rutas protegidas, verificar autenticación
  if (to.meta.requiresAuth) {
    // Primero intentar sincronizar con localStorage
    appStore.syncStoreWithLocalStorage()

    // Si no está autenticado, verificar sesión con backend
    if (!appStore.isAuthenticated) {
      try {
        const sessionValid = await appStore.checkSession()
        if (!sessionValid) {
          console.log('❌ Sesión inválida - Redirigiendo a login')
          next('/login')
          return
        }
      } catch (error) {
        console.error('❌ Error verificando sesión:', error)
        next('/login')
        return
      }
    }

    // Si aún no está autenticado después de checkSession, redirigir a login
    if (!appStore.isAuthenticated) {
      console.log('🚫 No autenticado después de checkSession - Redirigiendo a login')
      next('/login')
      return
    }

    // Verificar rol si es requerido
    if (to.meta.requiresRole) {
      const userRole = appStore.user?.rol_usuario

      if (!userRole) {
        console.log('🚫 Sin rol definido - Redirigiendo a home')
        next('/home')
        return
      }

      if (to.meta.requiresRole === 'admin' && !appStore.isAdmin) {
        console.log('🚫 Acceso denegado - Se requiere rol admin')
        next('/home')
        return
      }

      if (to.meta.requiresRole === 'cliente' && !appStore.isCliente) {
        console.log('🚫 Acceso denegado - Se requiere rol cliente')
        next('/home')
        return
      }
    }

    console.log('✅ Acceso permitido a:', to.path)
    next()
    return
  }

  // Para cualquier otra ruta no definida (caerá en el catch-all de abajo si existe)
  console.log('✅ Ruta sin restricciones - Acceso permitido')
  next()
})

// Manejar error de navegación
router.onError((error) => {
  console.error('❌ Error de navegación:', error)
})

// Añadir catch-all route para redirigir rutas no encontradas
router.beforeResolve((to, from, next) => {
  if (!to.matched.length) {
    console.log('📍 Ruta no encontrada:', to.path)

    // Verificar si está autenticado para redirigir apropiadamente
    const appStore = useAppStore()
    if (appStore.isAuthenticated) {
      next('/home')
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router