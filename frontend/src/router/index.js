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
    meta: { requiresAuth: false }
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ GUARD SIMPLIFICADO - SIN DEPENDER DEL STORE
router.beforeEach((to, from, next) => {
  console.log('🛡️ Router guard - Verificando ruta:', to.path)
  
  // Obtener datos de autenticación directamente de localStorage
  const userData = localStorage.getItem('user')
  const isAuthenticated = !!userData
  let userRole = null
  
  if (userData) {
    try {
      const user = JSON.parse(userData)
      userRole = user.rol_usuario
      console.log('👤 Usuario detectado:', user.nom_usuario, 'Rol:', userRole)
    } catch (error) {
      console.error('❌ Error parseando user data:', error)
    }
  }

  // Si la ruta requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('🚫 No autenticado - Redirigiendo a login')
    next('/login')
    return
  }

  // Si la ruta requiere un rol específico y no lo tiene
  if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    console.log('🚫 Rol insuficiente - Redirigiendo a home')
    next('/home')
    return
  }

  // Si ya está autenticado y va al login, redirigir a home
  if (to.path === '/login' && isAuthenticated) {
    console.log('✅ Ya autenticado - Redirigiendo a home')
    next('/home')
    return
  }

  console.log('✅ Acceso permitido a:', to.path)
  next()
})

export default router