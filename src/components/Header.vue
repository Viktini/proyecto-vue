<template>
  <header class="header">
    <div class="container">
      <div class="logo-container">
        <img src="../assets/logo.jpg" alt="Logo Belleza y Relajación" class="logo">
        <h1>Belleza y Relajación</h1>
      </div>
      <nav class="nav">
        <ul>
          <li><router-link to="/" :class="{ active: $route.name === 'Home' }">Inicio</router-link></li>
          <li><router-link to="/tratamientos"
              :class="{ active: $route.name === 'Tratamientos' }">Tratamientos</router-link></li>
          <li><router-link to="/paquetes" :class="{ active: $route.name === 'Paquetes' }">Paquetes</router-link></li>
          <li v-if="isCliente">
            <router-link to="/reservar-cita" :class="{ active: $route.name === 'ReservarCita' }">Reservar
              Cita</router-link>
          </li>
          <li v-if="isCliente">
            <router-link to="/comprar-paquete" :class="{ active: $route.name === 'ComprarPaquete' }">Comprar
              Paquete</router-link>
          </li>
          <li v-if="isCliente">
            <router-link to="/cancelar-cita" :class="{ active: $route.name === 'CancelarCita' }">Cancelar
              Cita</router-link>
          </li>
          <li v-if="isCliente">
            <router-link to="/cancelar-paquete" :class="{ active: $route.name === 'CancelarPaquete' }">Cancelar
              Paquete</router-link>
          </li>
          <li v-if="isAdmin">
            <router-link to="/admin" :class="{ active: $route.name === 'AdminDashboard' }">Panel Admin</router-link>
          </li>
          <li><a href="#" @click="logout">Cerrar Sesión</a></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores';

export default {
  name: 'Header',
  setup() {
    const store = useAppStore() // ← Cambiar
    const router = useRouter()

    const isAdmin = computed(() => store.isAdmin) // ← Getter como propiedad
    const isCliente = computed(() => store.isCliente)

    const logout = () => {
      store.logout() // ← Acción directa, sin dispatch
      router.push('/login')
    }

    return {
      isAdmin,
      isCliente,
      logout
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.header h1 {
  color: #5a5a5a;
  font-size: 1.8rem;
}

.nav ul {
  display: flex;
  list-style: none;
  flex-wrap: wrap;
}

.nav li {
  margin-right: 1.5rem;
}

.nav a {
  text-decoration: none;
  color: #5a5a5a;
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.3s;
  position: relative;
}

.nav a:hover,
.nav a.active {
  color: #ff6b95;
}

.nav a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff6b95;
}

@media (max-width: 768px) {
  .nav ul {
    flex-direction: column;
  }

  .nav li {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style>
