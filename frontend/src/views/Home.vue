<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h2>{{ $t('home.welcome') }}</h2>
          <p>{{ $t('home.description') }}</p>
          <!-- ✅ AGREGAR INFO DEL USUARIO -->
          <div class="user-welcome" v-if="user">
            <p><strong>Bienvenido:</strong> {{ user.nom_usuario }}</p>
            <p><strong>Rol:</strong> {{ user.rol_usuario }}</p>
            <button @click="logout" class="btn-logout">Cerrar Sesión</button>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid" v-if="isCliente">
          <div class="feature-card">
            <img src="@/assets/camilla.jpg" alt="Camilla de spa" class="feature-image" />
            <h3>Tratamientos Relajantes</h3>
            <p>Disfruta de nuestros mejores tratamientos de spa</p>
            <router-link to="/tratamientos" class="btn-link">Ver Tratamientos</router-link>
          </div>
          <div class="feature-card">
            <img src="@/assets/piedras.jpg" alt="Masaje con piedras" class="feature-image" />
            <h3>Paquetes Especiales</h3>
            <p>Descubre nuestros paquetes promocionales</p>
            <router-link to="/paquetes" class="btn-link">Ver Paquetes</router-link>
          </div>
          <div class="feature-card">
            <img src="@/assets/toalla.jpg" alt="Toalla y flores relajantes" class="feature-image" />
            <h3>Reserva tu Cita</h3>
            <p>Agenda tu tratamiento favorito</p>
            <router-link to="/reservar-cita" class="btn-link">Reservar Cita</router-link>
          </div>
        </div>

        <div class="features-grid" v-if="isAdmin">
          <div class="feature-card">
            <h3>{{ $t('home.adminPanel') }}</h3>
            <p>{{ $t('home.adminDescription') }}</p>
            <router-link to="/admin" class="btn-link">{{ $t('home.goToPanel') }}</router-link>
          </div>
          <div class="feature-card">
            <h3>Gestión de Usuarios</h3>
            <p>Administra los usuarios del sistema</p>
            <router-link to="/admin/users" class="btn-link">Gestionar Usuarios</router-link>
          </div>
          <div class="feature-card">
            <h3>Reportes</h3>
            <p>Visualiza reportes y estadísticas</p>
            <router-link to="/admin/reports" class="btn-link">Ver Reportes</router-link>
          </div>
        </div>

        <!-- ✅ DEBUG TEMPORAL -->
        <div class="debug-info" v-if="showDebug">
          <h3>🔧 Información de Debug</h3>
          <p><strong>Usuario:</strong> {{ user }}</p>
          <p><strong>Store Auth:</strong> {{ store?.auth }}</p>
          <p><strong>isCliente:</strong> {{ isCliente }}</p>
          <p><strong>isAdmin:</strong> {{ isAdmin }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore' // ✅ IMPORTAR EL STORE

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const store = useAppStore() // ✅ USAR EL STORE
    const user = ref(null)
    const showDebug = ref(true) // ✅ TEMPORAL PARA DEBUG

    // Obtener usuario de localStorage
    onMounted(() => {
      console.log('🏠 Home - Montando componente')
      
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        user.value = JSON.parse(savedUser)
        console.log('✅ Home - Usuario cargado:', user.value)
        
        // ✅ SINCRONIZAR STORE CON LOCALSTORAGE
        if (store && store.auth) {
          store.auth.user = user.value
          store.auth.isAuthenticated = true
          console.log('✅ Store sincronizado con localStorage')
        }
      } else {
        console.log('❌ No hay usuario - Redirigiendo a login')
        router.push('/login')
      }
    })

    // Computed properties
    const isCliente = computed(() => {
      return user.value?.rol_usuario === 'cliente'
    })

    const isAdmin = computed(() => {
      return user.value?.rol_usuario === 'admin'
    })

    const logout = () => {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      if (store && store.auth) {
        store.auth.user = null
        store.auth.isAuthenticated = false
      }
      router.push('/login')
    }

    return {
      user,
      isCliente,
      isAdmin,
      logout,
      showDebug,
      store // ✅ EXPORTAR STORE PARA DEBUG
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
    url('../assets/spa.jpg') no-repeat center center/cover;
  padding: clamp(1rem, 4vw, 3rem) 0;
  text-align: center;
}

.hero h2 {
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  color: #5a5a5a;
}

.hero p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  max-width: min(800px, 90vw);
  margin: 0 auto clamp(1rem, 4vw, 2rem);
  color: #666;
  line-height: 1.6;
}

.user-welcome {
  background: rgba(162, 210, 255, 0.2);
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  border-left: 4px solid #a2d2ff;
}

.btn-logout {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-logout:hover {
  background: #ff5252;
}

.features {
  padding: clamp(1rem, 4vw, 3rem) 0;
  background-color: #f0f8ff;
}

.features h2 {
  text-align: center;
  margin-bottom: clamp(1rem, 4vw, 2rem);
  color: #5a5a5a;
  font-size: clamp(1.5rem, 5vw, 2rem);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.feature-card {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: min(200px, 40vw);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  color: #5a5a5a;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
}

.feature-card p {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  color: #666;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  line-height: 1.5;
}

.feature-image {
  width: 100%;
  height: auto;
  border-radius: 15px;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-height: min(300px, 50vw);
  margin-bottom: 1rem;
}

.btn-link {
  display: inline-block;
  padding: clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  background: #ff6b95;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.btn-link:hover {
  background: #e55a82;
  transform: translateY(-2px);
}

.debug-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 2rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.debug-info h3 {
  color: #856404;
  margin-bottom: 0.5rem;
}

.debug-info p {
  margin: 0.25rem 0;
  color: #666;
}

/* Ajuste para una sola tarjeta en admin */
.features-grid:has(.feature-card:only-child) {
  grid-template-columns: minmax(auto, 600px);
  justify-content: center;
}
</style>