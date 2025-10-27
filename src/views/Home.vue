<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h2>Bienvenido a nuestro oasis de bienestar</h2>
          <p>En Belleza y Relajación, nos dedicamos a ofrecerte una experiencia única de cuidado personal y
            rejuvenecimiento. Nuestros tratamientos de lujo están diseñados para brindarte el máximo confort y
            resultados excepcionales.</p>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>Nuestros Servicios</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>Tratamientos Especializados</h3>
            <p>Masajes terapéuticos, faciales rejuvenecedores, hidroterapia y más.</p>
            <router-link to="/tratamientos" class="btn-link">Ver Tratamientos</router-link>
          </div>
          <div class="feature-card">
            <h3>Paquetes Exclusivos</h3>
            <p>Experiencias completas diseñadas para tu máximo bienestar.</p>
            <router-link to="/paquetes" class="btn-link">Ver Paquetes</router-link>
          </div>
          <div class="feature-card" v-if="isCliente">
            <h3>Reserva Online</h3>
            <p>Agenda tu cita de forma rápida y sencilla desde cualquier lugar.</p>
            <router-link to="/reservar-cita" class="btn-link">Reservar Ahora</router-link>
          </div>
          <div class="feature-card" v-if="isAdmin">
            <h3>Panel de Administración</h3>
            <p>Gestiona citas, paquetes y configuraciones del sistema.</p>
            <router-link to="/admin" class="btn-link">Ir al Panel</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAppStore } from '@/stores'

export default {
  name: 'Home',
  setup() {
    const store = useAppStore() // ← Cambiar
    const isCliente = computed(() => store.isCliente) // ← Getter como propiedad
    const isAdmin = computed(() => store.isAdmin)

    return {
      isCliente,
      isAdmin
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
    url('../assets/spa.jpg') no-repeat center center/cover;
  padding: 1rem 0;
  text-align: center;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #5a5a5a;
}

.hero p {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  color: #666;
}

.features {
  padding: 1rem 0;
  background-color: #f0f8ff;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #5a5a5a;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1rem;
}

.feature-card {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #5a5a5a;
}

.feature-card p {
  margin-bottom: 1.5rem;
  color: #666;
}
</style>
