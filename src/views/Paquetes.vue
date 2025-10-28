<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Nuestros Paquetes</h2>
        <p>Descubre nuestras experiencias completas de bienestar</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="paquetes-grid">
          <div v-for="paquete in paquetes" :key="paquete.id" class="paquete-card">
            <div class="paquete-header">
              <h3>{{ paquete.nombre }}</h3>
              <div class="paquete-precio">${{ paquete.precio }}</div>
            </div>
            <div class="paquete-body">
              <p class="paquete-descripcion">{{ paquete.descripcion }}</p>
              <div class="paquete-tratamientos">
                <h4>Tratamientos incluidos:</h4>
                <ul>
                  <li v-for="tratamientoId in paquete.tratamientos" :key="tratamientoId">
                    {{ getTratamientoNombre(tratamientoId) }}
                  </li>
                </ul>
              </div>
              <div class="paquete-duracion">
                <strong>Duración total: {{ calcularDuracionTotal(paquete.tratamientos) }} minutos</strong>
              </div>
              <div class="paquete-ahorro" v-if="calcularAhorro(paquete) > 0">
                <span class="ahorro-tag">¡Ahorras ${{ calcularAhorro(paquete) }}!</span>
              </div>
            </div>
            <div class="paquete-footer">
              <router-link v-if="isCliente" to="/comprar-paquete" class="btn btn-primary">
                Comprar Paquete
              </router-link>
              <button v-else class="btn btn-secondary" @click="redirigirALogin">
                Inicia sesión como cliente para comprar
              </button>
            </div>
          </div>
        </div>

        <div class="info-adicional">
          <div class="info-card">
            <h3>💫 Paquetes Personalizados</h3>
            <p>¿No encuentras lo que buscas? Crea tu propio paquete personalizado seleccionando los tratamientos que
              prefieras.</p>
            <router-link v-if="isCliente" to="/comprar-paquete" class="btn-link">
              Crear paquete personalizado
            </router-link>
          </div>
        </div>

        <div class="action-buttons">
          <router-link v-if="isCliente" to="/comprar-paquete" class="btn btn-primary">
            Comprar Paquete
          </router-link>
          <router-link to="/" class="btn btn-secondary">
            Volver al Inicio
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAppStore } from '@/stores'
import { useRouter } from 'vue-router'

export default {
  name: 'Paquetes',
  setup() {
    const store = useAppStore()
    const router = useRouter()

    const paquetes = computed(() => store.paquetes) // ← Acceso directo
    const tratamientos = computed(() => store.tratamientos)
    const isCliente = computed(() => store.isCliente)

    const getTratamientoNombre = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.nombre : 'Tratamiento no encontrado'
    }

    const getTratamientoPrecio = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.precio : 0
    }

    const getTratamientoDuracion = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.duracion : 0
    }

    const calcularDuracionTotal = (tratamientosIds) => {
      return tratamientosIds.reduce((total, id) => {
        return total + getTratamientoDuracion(id)
      }, 0)
    }

    const calcularAhorro = (paquete) => {
      const precioIndividual = paquete.tratamientos.reduce((total, id) => {
        return total + getTratamientoPrecio(id)
      }, 0)
      return precioIndividual - paquete.precio
    }

    const redirigirALogin = () => {
      // Cerrar sesión actual y redirigir al login
      store.logout()
      router.push('/login')
    }

    return {
      paquetes,
      isCliente,
      getTratamientoNombre,
      calcularDuracionTotal,
      calcularAhorro,
      redirigirALogin
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 2rem 0;
  text-align: center;
}

.page-header h2 {
  color: #5a5a5a;
  margin-bottom: 0.5rem;
}

.content-section {
  padding: 2rem 0;
}

.paquetes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.paquete-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.paquete-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.paquete-header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 2rem;
  text-align: center;
  position: relative;
}

.paquete-header h3 {
  color: #5a5a5a;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.paquete-precio {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b95;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  display: inline-block;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.paquete-body {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.paquete-descripcion {
  color: #666;
  margin-bottom: 1.5rem;
  font-style: italic;
  text-align: center;
}

.paquete-tratamientos {
  margin-bottom: 1.5rem;
}

.paquete-tratamientos h4 {
  color: #5a5a5a;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 2px solid #f8c8dc;
  padding-bottom: 0.5rem;
}

.paquete-tratamientos ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.paquete-tratamientos li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.paquete-tratamientos li:before {
  content: "✓";
  color: #ff6b95;
  font-weight: bold;
  margin-right: 0.5rem;
}

.paquete-tratamientos li:last-child {
  border-bottom: none;
}

.paquete-duracion {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
  text-align: center;
  color: #5a5a5a;
}

.paquete-ahorro {
  margin-top: 1rem;
  text-align: center;
}

.ahorro-tag {
  background: linear-gradient(135deg, #ff6b95 0%, #ff8eb4 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
}

.paquete-footer {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  text-align: center;
}

.info-adicional {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.info-card {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  color: #5a5a5a;
  margin-bottom: 1rem;
}

.info-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .paquetes-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .paquete-header {
    padding: 1.5rem;
  }

  .paquete-body {
    padding: 1.5rem;
  }
}
</style>
