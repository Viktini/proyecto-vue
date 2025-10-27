<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Cancelar Paquete</h2>
        <p>Introduzca su carnet de identidad para ver y cancelar sus paquetes</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="form-group" id="form-cancelar-paquete">
          <label for="carnet-cancelar-paquete" class="label-cancelar">Carnet de Identidad *</label>
          <input type="text" id="carnet-cancelar-paquete" v-model="carnet" :class="{ error: carnetError }"
            placeholder="Solo números (máximo once dígitos)" maxlength="11" @input="validarCarnet">
          <button @click="buscarPaquetes" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Buscando...' : 'Buscar Paquetes' }}
          </button>
        </div>

        <div v-if="paquetesEncontrados.length > 0" class="paquetes-container">
          <h3>Sus Paquetes</h3>
          <div class="paquetes-grid">
            <div v-for="paquete in paquetesEncontrados" :key="paquete.id" class="paquete-card"
              :class="{ seleccionado: paqueteSeleccionado === paquete.id }" @click="seleccionarPaquete(paquete.id)">
              <div class="paquete-header">
                <h4>{{ paquete.paquete }}</h4>
                <div class="paquete-id">N° {{ paquete.id }}</div>
              </div>
              <div class="paquete-body">
                <p><strong>Fecha de inicio:</strong> {{ formatFecha(paquete.fechaInicio) }}</p>
                <div class="paquete-tratamientos">
                  <h5>Tratamientos incluidos:</h5>
                  <ul>
                    <li v-for="tratamiento in paquete.tratamientos" :key="tratamiento">
                      {{ tratamiento }}
                    </li>
                  </ul>
                </div>
                <div class="paquete-estado">
                  <span :class="`estado-${paquete.estado.toLowerCase()}`">
                    {{ paquete.estado }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button @click="cancelarPaquete" class="btn btn-danger" :disabled="!paqueteSeleccionado || cancelando">
            {{ cancelando ? 'Cancelando...' : 'Cancelar Paquete Seleccionado' }}
          </button>
        </div>

        <div v-if="paquetesEncontrados.length === 0 && busquedaRealizada" class="no-result">
          <p>No se encontraron paquetes activos para este carnet de identidad.</p>
        </div>

        <div v-if="resultado" class="resultado" :class="resultado.tipo">
          {{ resultado.mensaje }}
        </div>

        <div class="action-buttons">
          <router-link to="/" class="btn btn-secondary">Volver al Inicio</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAppStore } from '@/stores'
import { validators } from '../utils/validators'

export default {
  name: 'CancelarPaquete',
  setup() {
    const store = useStore()

    const carnet = ref('')
    const carnetError = ref('')
    const paquetesEncontrados = ref([])
    const paqueteSeleccionado = ref(null)
    const loading = ref(false)
    const cancelando = ref(false)
    const busquedaRealizada = ref(false)
    const resultado = ref(null)

    const validarCarnet = () => {
      if (!carnet.value.trim()) {
        carnetError.value = 'El carnet es requerido'
        return false
      }

      if (!validators.carnet(carnet.value)) {
        carnetError.value = 'Solo números (máximo 11 dígitos)'
        return false
      }

      carnetError.value = ''
      return true
    }

    const buscarPaquetes = async () => {
      if (!validarCarnet()) return

      loading.value = true
      paquetesEncontrados.value = []
      busquedaRealizada.value = true

      try {
        // Usar el getter de Vuex para buscar paquetes por carnet
        const paquetes = store.paquetesPorCarnet(carnet.value) // ← Getter como función
        paquetesEncontrados.value = paquetes.filter(paquete => paquete.estado === 'Activo')

        if (paquetesEncontrados.value.length === 0) {
          mostrarResultado('No se encontraron paquetes activos para este carnet.', 'error')
        }
      } catch (error) {
        mostrarResultado('Error al buscar paquetes. Intente nuevamente.', 'error')
      } finally {
        loading.value = false
      }
    }

    const seleccionarPaquete = (id) => {
      paqueteSeleccionado.value = id
    }

    const cancelarPaquete = async () => {
      if (!paqueteSeleccionado.value) {
        mostrarResultado('Por favor, seleccione un paquete para cancelar.', 'error')
        return
      }

      cancelando.value = true

      try {
        await store.cancelarPaquete(paqueteSeleccionado.value) // ← Sin dispatch
        mostrarResultado('¡Paquete cancelado exitosamente!', 'exito')

        // Actualizar la lista
        paquetesEncontrados.value = paquetesEncontrados.value.filter(
          paquete => paquete.id !== paqueteSeleccionado.value
        )
        paqueteSeleccionado.value = null
      } catch (error) {
        mostrarResultado('Error al cancelar el paquete. Intente nuevamente.', 'error')
      } finally {
        cancelando.value = false
      }
    }

    const formatFecha = (fecha) => {
      return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const mostrarResultado = (mensaje, tipo) => {
      resultado.value = { mensaje, tipo }
      setTimeout(() => {
        resultado.value = null
      }, 5000)
    }

    return {
      carnet,
      carnetError,
      paquetesEncontrados,
      paqueteSeleccionado,
      loading,
      cancelando,
      busquedaRealizada,
      resultado,
      validarCarnet,
      buscarPaquetes,
      seleccionarPaquete,
      cancelarPaquete,
      formatFecha
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

#form-cancelar-paquete {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.label-cancelar {
  margin-right: 1rem;
  font-weight: 600;
  color: #5a5a5a;
}

#carnet-cancelar-paquete {
  width: 250px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.paquetes-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.paquetes-container h3 {
  margin-bottom: 1.5rem;
  color: #5a5a5a;
}

.paquetes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.paquete-card {
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.paquete-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.paquete-card.seleccionado {
  border-color: #ff6b95;
  background: #fff5f7;
}

.paquete-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.paquete-header h4 {
  color: #5a5a5a;
  margin: 0;
  flex: 1;
}

.paquete-id {
  background: #a2d2ff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.875rem;
  font-weight: 600;
}

.paquete-body p {
  margin-bottom: 1rem;
  color: #666;
}

.paquete-tratamientos h5 {
  margin-bottom: 0.5rem;
  color: #5a5a5a;
  font-size: 0.9rem;
}

.paquete-tratamientos ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.paquete-tratamientos li {
  padding: 0.25rem 0;
  font-size: 0.875rem;
  color: #666;
  border-bottom: 1px solid #eee;
}

.paquete-tratamientos li:last-child {
  border-bottom: none;
}

.paquete-estado {
  margin-top: 1rem;
  text-align: right;
}

.estado-activo {
  color: #28a745;
  font-weight: 600;
}

.estado-cancelado {
  color: #dc3545;
  font-weight: 600;
}

.no-result {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  #form-cancelar-paquete {
    flex-direction: column;
    align-items: stretch;
  }

  #carnet-cancelar-paquete {
    width: 100%;
    margin-bottom: 1rem;
  }

  .paquetes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
