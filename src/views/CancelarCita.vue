<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('cancelAppointment.title') }}</h2>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <!-- Solo mostrar cuando hay citas -->
        <div v-if="citasEncontradas.length > 0" class="citas-container">
          <h3>{{ $t('cancelAppointment.yourAppointments') }}</h3>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t('cancelAppointment.date') }}</th>
                  <th>{{ $t('cancelAppointment.time') }}</th>
                  <th>{{ $t('cancelAppointment.treatment') }}</th>
                  <th>{{ $t('cancelAppointment.status') }}</th>
                  <th>{{ $t('cancelAppointment.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cita in citasPaginadas" :key="cita.id">
                  <td>{{ formatFecha(cita.fecha) }}</td>
                  <td>{{ cita.hora }}</td>
                  <td>{{ cita.tratamiento }}</td>
                  <td>
                    <span :class="`estado-${cita.estado.toLowerCase()}`">
                      {{ cita.estado }}
                    </span>
                  </td>
                  <td>
                    <button @click="cancelarCita(cita.id)" class="btn-cancelar" :disabled="cancelandoId === cita.id">
                      {{ cancelandoId === cita.id ? $t('cancelAppointment.canceling') :
                        $t('cancelAppointment.cancelButton') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Controles de paginación -->
          <div class="pagination-controls" v-if="totalPages > 1">
            <div class="pagination-info">
              {{ $t('cancelAppointment.paginationInfo', {
                start: startItem,
                end: endItem,
                total: citasEncontradas.length
              }) }}
            </div>
            <div class="pagination-buttons">
              <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
                {{ $t('cancelAppointment.previous') }}
              </button>
              <div class="page-numbers">
                <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :class="{
                  'btn-pagination': true,
                  'active': page === currentPage,
                  'ellipsis': page === '...'
                }" :disabled="page === '...'">
                  {{ page }}
                </button>
              </div>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-pagination">
                {{ $t('cancelAppointment.next') }}
              </button>
            </div>
            <div class="items-per-page">
              <label for="itemsPerPage">{{ $t('cancelAppointment.show') }}:</label>
              <select id="itemsPerPage" v-model="itemsPerPage" @change="resetPagination">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mostrar cuando no hay citas -->
        <div v-else-if="busquedaRealizada" class="no-appointments">
          <div class="no-appointments-content">
            <div class="no-appointments-icon">📅</div>
            <h3>{{ $t('cancelAppointment.noAppointmentsTitle') }}</h3>
            <p>{{ $t('cancelAppointment.noAppointmentsMessage') }}</p>
            <router-link to="/reservar" class="btn btn-primary">
              {{ $t('cancelAppointment.bookFirstAppointment') }}
            </router-link>
          </div>
        </div>

        <!-- Mostrar mientras se carga -->
        <div v-else class="loading">
          <p>{{ $t('cancelAppointment.loading') }}</p>
        </div>

        <!-- Mensaje de resultado -->
        <div v-if="resultado" class="resultado-message" :class="resultado.tipo">
          {{ resultado.mensaje }}
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useI18n } from 'vue-i18n'

export default {
  name: 'CancelarCita',
  setup() {
    const { t } = useI18n()
    const store = useAppStore()

    // Variables de paginación
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const citasEncontradas = ref([]) // Lista completa de citas
    const loading = ref(false)
    const cancelandoId = ref(null) // ID de la cita que se está cancelando
    const busquedaRealizada = ref(false)
    const resultado = ref(null)

    // Computed para paginación
    const totalPages = computed(() => {
      return Math.ceil(citasEncontradas.value.length / itemsPerPage.value)
    })

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return end > citasEncontradas.value.length ? citasEncontradas.value.length : end
    })

    const citasPaginadas = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return citasEncontradas.value.slice(start, end)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }

      return pages
    })

    // Métodos de paginación
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const goToPage = (page) => {
      if (page !== '...' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const resetPagination = () => {
      currentPage.value = 1
    }

    const cargarCitasDelUsuario = () => {
      loading.value = true
      const usuario = store.auth.user || {}
      const carnetUsuario = usuario.carnet

      if (!carnetUsuario) {
        mostrarResultado(t('cancelAppointment.errors.noUserCard'), 'error')
        loading.value = false
        busquedaRealizada.value = true
        return
      }

      try {
        console.log('Cargando citas para carnet:', carnetUsuario)

        // Obtener todas las citas del usuario
        const citas = store.citasPorCarnet(carnetUsuario)

        console.log('Citas encontradas:', citas)

        // Filtrar solo las citas confirmadas para cancelar
        citasEncontradas.value = citas.filter(cita => cita.estado === 'Confirmada')
        busquedaRealizada.value = true

        console.log('Citas confirmadas:', citasEncontradas.value)

        resetPagination()
      } catch (error) {
        mostrarResultado(t('cancelAppointment.errors.loadError'), 'error')
      } finally {
        loading.value = false
      }
    }

    const cancelarCita = async (citaId) => {
      cancelandoId.value = citaId

      try {
        await store.cancelarCita(citaId)
        mostrarResultado(t('cancelAppointment.success'), 'exito')

        // Actualizar la lista completa
        citasEncontradas.value = citasEncontradas.value.filter(
          cita => cita.id !== citaId
        )
        resetPagination()
      } catch (error) {
        console.error('Error al cancelar cita:', error)
        mostrarResultado(t('cancelAppointment.error'), 'error')
      } finally {
        cancelandoId.value = null
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

    onMounted(() => {
      cargarCitasDelUsuario()
    })

    return {
      citasEncontradas,
      citasPaginadas,
      loading,
      cancelandoId,
      busquedaRealizada,
      resultado,
      // Variables de paginación
      currentPage,
      itemsPerPage,
      totalPages,
      startItem,
      endItem,
      visiblePages,
      // Métodos de paginación
      nextPage,
      previousPage,
      goToPage,
      resetPagination,
      // Métodos existentes
      cancelarCita,
      formatFecha,
      t
    }
  }
}
</script>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.5rem 0;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  color: #5a5a5a;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  min-width: 40px;
  text-align: center;
}

.btn-pagination:hover:not(:disabled) {
  background: #f8c8dc;
  border-color: #f8c8dc;
  color: white;
}

.btn-pagination:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.btn-pagination.active {
  background: #ff6b95;
  border-color: #ff6b95;
  color: white;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.items-per-page select {
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
}

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

/* Botón de cancelar individual - MEJORADO */
.btn-cancelar {
  padding: 0.4rem 0.8rem;
  background: #ff6b95;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
}

.btn-cancelar:hover:not(:disabled) {
  background: #ff4d7a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 107, 149, 0.3);
}

.btn-cancelar:disabled {
  background: #a0a0a0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Estilos para cuando no hay citas */
.no-appointments {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.no-appointments-content {
  text-align: center;
  max-width: 400px;
}

.no-appointments-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-appointments h3 {
  color: #5a5a5a;
  margin-bottom: 1rem;
}

.no-appointments p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

/* Mensaje de resultado */
.resultado-message {
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;
  text-align: center;
}

.resultado-message.exito {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.resultado-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.resultado-message.info {
  background: #cce7ff;
  color: #004085;
  border: 1px solid #b3d7ff;
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .pagination-buttons {
    order: 1;
  }

  .pagination-info {
    order: 2;
  }

  .items-per-page {
    order: 3;
  }

  .btn-pagination {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    min-width: 35px;
  }

  .page-numbers {
    gap: 0.1rem;
  }

  .citas-container {
    padding: 1.5rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .btn-cancelar {
    padding: 0.35rem 0.7rem;
    font-size: 0.75rem;
    min-width: 70px;
  }

  .no-appointments {
    padding: 1.5rem;
    min-height: 250px;
  }

  .no-appointments-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .pagination-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }

  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
  }

  .btn-pagination {
    width: 100%;
    max-width: 120px;
  }

  .citas-container {
    padding: 1rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.6rem;
    font-size: 0.85rem;
  }

  .btn-cancelar {
    padding: 0.3rem 0.6rem;
    font-size: 0.7rem;
    min-width: 65px;
  }

  .no-appointments {
    padding: 1rem;
    min-height: 200px;
  }

  .no-appointments-icon {
    font-size: 2.5rem;
  }
}
</style>