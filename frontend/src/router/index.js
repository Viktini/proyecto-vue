// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '../stores/appStore'

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
    meta: { requiresAuth: false }  // ← PÚBLICA
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }  // ← PÚBLICA
  },
  {
    path: '/tratamientos',
    name: 'Tratamientos',
    component: Tratamientos,
    meta: { requiresAuth: true }   // ← PRIVADA
  },
  {
    path: '/paquetes',
    name: 'Paquetes',
    component: Paquetes,
    meta: { requiresAuth: true }   // ← PRIVADA
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

router.beforeEach((to, from, next) => {
  const store = useAppStore()
  const isAuthenticated = store.auth.isAuthenticated
  const userRole = store.auth.role

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirigir a login si no está autenticado
    next('/login')
  } else if (to.meta.requiresAuth && to.meta.role && to.meta.role !== userRole) {
    // Redirigir a home si no tiene el rol necesario
    next('/')
  } else {
    next()
  }
})

export default router
