<template>
  <div id="app">
    <!-- Mostrar Header solo cuando NO esté en login y esté autenticado -->
    <Header v-if="!isLoginRoute && isAuthenticated" />

    <main class="main">
      <router-view />
    </main>

    <!-- Mostrar Footer solo cuando NO esté en login y esté autenticado -->
    <Footer v-if="!isLoginRoute && isAuthenticated" />

    <!-- Indicador de carga mientras se verifica la sesión -->
    <div v-if="!sessionVerified && isCheckingSession" class="session-checking">
      <div class="spinner"></div>
      <p>Verificando sesión...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()

// Estado para controlar la verificación de sesión
const isCheckingSession = ref(false)
const sessionVerified = ref(false)

const isAuthenticated = computed(() => appStore.isAuthenticated)

// ✅ Computed para saber si estamos en la ruta de login
const isLoginRoute = computed(() => {
  const path = route.path;
  return path === '/' || path === '/login';
})

onMounted(async () => {
  console.log('🚀 App montada - Verificando sesión...')
  console.log('🔍 Estado inicial isAuthenticated:', isAuthenticated.value)

  // Solo verificar sesión si no estamos en login
  if (!isLoginRoute.value) {
    isCheckingSession.value = true

    try {
      const sessionValid = await appStore.checkSession()
      sessionVerified.value = true

      if (!sessionValid && !isLoginRoute.value) {
        console.log('🔒 No autenticado - Redirigiendo a login')
        router.push('/login')
      }
    } catch (error) {
      console.error('❌ Error verificando sesión:', error)
      sessionVerified.value = true
    } finally {
      isCheckingSession.value = false
    }
  } else {
    sessionVerified.value = true
  }
})

// Watcher para redirigir si pierde autenticación
watch(isAuthenticated, (newVal, oldVal) => {
  console.log('🔄 isAuthenticated cambió de', oldVal, 'a', newVal)

  if (!newVal && !isLoginRoute.value) {
    console.log('🔒 Pérdida de autenticación - Redirigiendo a login')
    router.push('/login')
  }
})

// Watcher para cambios de ruta
watch(
  () => route.path,
  async (newPath) => {
    console.log('🔄 Ruta cambiada a:', newPath)

    // Si va a una ruta protegida sin estar autenticado, verificar sesión
    const isProtectedRoute = !newPath.includes('/login') && newPath !== '/'
    if (isProtectedRoute && !isAuthenticated.value) {
      console.log('🔍 Verificando sesión desde watch...')
      const valid = await appStore.checkSession()
      if (!valid) {
        router.push('/login')
      }
    }
  }
)
</script>

<style>
/* Estilos generales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f9f7f7;
  font-size: 14px;
  /* Tamaño base más pequeño para móviles */
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  /* Agregar padding en móviles */
}

.main {
  min-height: calc(100vh - 200px);
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  margin-top: 0.5rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  text-align: center;
  font-size: 0.9rem;
  /* Tamaño más pequeño para móviles */
  width: 100%;
  /* Botones de ancho completo en móviles */
  max-width: 200px;
  /* Máximo ancho */
}

.btn-primary {
  background-color: #ff6b95;
  color: white;
}

.btn-primary:hover {
  background-color: #ff4d7d;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #a2d2ff;
  color: white;
}

.btn-secondary:hover {
  background-color: #89c2ff;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #ff6b6b;
  color: white;
}

.btn-danger:hover {
  background-color: #ff5252;
  transform: translateY(-2px);
}

.btn-link {
  color: #ff6b95;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.btn-link:hover {
  color: #ff4d7d;
}

/* Utility classes */
.hidden {
  display: none !important;
}

.text-center {
  text-align: center;
}

.error {
  border: 2px solid red !important;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3) !important;
}

.success {
  border: 2px solid green !important;
}

/* Resultado */
.resultado {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.resultado.exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.resultado.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive */
@media (max-width: 1200px) {
  .container {
    width: 95%;
  }
}

@media (max-width: 768px) {
  body {
    font-size: 13px;
  }

  .container {
    width: 100%;
    padding: 0 10px;
  }

  .main {
    min-height: calc(100vh - 180px);
  }

  .btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
    max-width: 100%;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .resultado {
    margin-top: 1rem;
    padding: 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 12px;
  }

  .container {
    padding: 0 8px;
  }

  .btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .session-checking {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #a2d2ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .session-checking p {
    color: #5a5a5a;
    font-size: 1rem;
    font-weight: 500;
  }
}
</style>