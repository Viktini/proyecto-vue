import { createRouter, createWebHistory } from 'vue-router'

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
    meta: { requiresAuth: false, hideNavbar: true }
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
    meta: { requiresAuth: true, role: 'cliente' }
  },
  {
    path: '/comprar-paquete',
    name: 'ComprarPaquete',
    component: ComprarPaquete,
    meta: { requiresAuth: true, role: 'cliente' }
  },
  {
    path: '/mis-reservas',
    name: 'MisReservas',
    component: MisReservas,
    meta: { requiresAuth: true, role: 'cliente' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/datos-usuario',
    name: 'DatosUsuario',
    component: DatosUsuario,
    meta: { requiresAuth: true, role: 'cliente' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ GUARD MEJORADO CON VERIFICACIÓN DE ROLES
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userData = localStorage.getItem('user')
  let user = null
  
  try {
    user = userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.meta.role

  // Si la ruta requiere autenticación y no hay token
  if (requiresAuth && !token) {
    next('/login')
    return
  }

  // Si ya está autenticado y va a login, redirigir a home
  if (to.path === '/login' && token) {
    next('/home')
    return
  }

  // Si la ruta requiere un rol específico
  if (requiresAuth && requiredRole) {
    if (!user || user.rol_usuario !== requiredRole) {
      // Si no tiene el rol requerido, redirigir según su rol
      if (user && user.rol_usuario === 'admin') {
        next('/admin')
      } else {
        next('/home')
      }
      return
    }
  }

  // Si todo está bien, continuar
  next()
})

export default router