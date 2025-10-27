<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Cancelar Cita</h2>
        <p>Introduzca su carnet de identidad para ver y cancelar sus citas</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="form-group" id="form-cancelar-cita">
          <label for="carnet-cancelar" class="label-cancelar">Carnet de Identidad *</label>
          <input type="text" id="carnet-cancelar-cita" v-model="carnet" :class="{ error: carnetError }"
            placeholder="Solo números (máximo once dígitos)" maxlength="11" @input="validarCarnet">
          <button @click="buscarCitas" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Buscando...' : 'Buscar Citas' }}
          </button>
        </div>

        <div v-if="citasEncontradas.length > 0" class="citas-container">
          <h3>Sus Citas</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Seleccionar</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tratamiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cita in citasEncontradas" :key="cita.id">
                  <td>
                    <input type="radio" name="cita-seleccionada" :value="cita.id" v-model="citaSeleccionada">
                  </td>
                  <td>{{ formatFecha(cita.fecha) }}</td>
                  <td>{{ cita.hora }}</td>
                  <td>{{ cita.tratamiento }}</td>
                  <td>
                    <span :class="`estado-${cita.estado.toLowerCase()}`">
                      {{ cita.estado }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <button @click="cancelarCita" class="btn btn-danger" :disabled="!citaSeleccionada || cancelando">
            {{ cancelando ? 'Cancelando...' : 'Cancelar Cita Seleccionada' }}
          </button>
        </div>

        <div v-if="citasEncontradas.length === 0 && busquedaRealizada" class="no-result">
          <p>No se encontraron citas activas para este carnet de identidad.</p>
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
  name: 'CancelarCita',
  setup() {
    const store = useStore()

    const carnet = ref('')
    const carnetError = ref('')
    const citasEncontradas = ref([])
    const citaSeleccionada = ref(null)
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

    const buscarCitas = async () => {
      if (!validarCarnet()) return

      loading.value = true
      citasEncontradas.value = []
      busquedaRealizada.value = true

      try {
        // Usar el getter de Pinia
        const citas = store.citasPorCarnet(carnet.value) // ← Getter como función
        citasEncontradas.value = citas.filter(cita => cita.estado === 'Confirmada')

        if (citasEncontradas.value.length === 0) {
          mostrarResultado('No se encontraron citas activas para este carnet.', 'error')
        }
      } catch (error) {
        mostrarResultado('Error al buscar citas. Intente nuevamente.', 'error')
      } finally {
        loading.value = false
      }
    }

    const cancelarCita = async () => {
      if (!citaSeleccionada.value) {
        mostrarResultado('Por favor, seleccione una cita para cancelar.', 'error')
        return
      }

      cancelando.value = true

      try {
        await store.cancelarCita(citaSeleccionada.value) // ← Sin dispatch
        mostrarResultado('¡Cita cancelada exitosamente!', 'exito')

        // Actualizar la lista
        citasEncontradas.value = citasEncontradas.value.filter(
          cita => cita.id !== citaSeleccionada.value
        )
        citaSeleccionada.value = null
      } catch (error) {
        mostrarResultado('Error al cancelar la cita. Intente nuevamente.', 'error')
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
      citasEncontradas,
      citaSeleccionada,
      loading,
      cancelando,
      busquedaRealizada,
      resultado,
      validarCarnet,
      buscarCitas,
      cancelarCita,
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

#form-cancelar-cita {
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

#carnet-cancelar-cita {
  width: 250px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.citas-container {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.citas-container h3 {
  margin-bottom: 1.5rem;
  color: #5a5a5a;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8c8dc;
  color: #5a5a5a;
  font-weight: 600;
}

.data-table tr:hover {
  background-color: #f9f7f7;
}

.estado-confirmada {
  color: #28a745;
  font-weight: 600;
}

.estado-cancelada {
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
  #form-cancelar-cita {
    flex-direction: column;
    align-items: stretch;
  }

  #carnet-cancelar-cita {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>
