<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('admin.title') }}</h2>
        <p>{{ $t('admin.subtitle') }}</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="admin-tabs">
          <div class="tab-buttons">
            <button @click="activeTab = 'citas'" :class="{ active: activeTab === 'citas' }" class="tab-btn">
              {{ $t('admin.appointmentManagement') }}
            </button>
            <button @click="activeTab = 'paquetes'" :class="{ active: activeTab === 'paquetes' }" class="tab-btn">
              {{ $t('admin.packageManagement') }}
            </button>
          </div>

          <div class="tab-content">
            <!-- Gestión de Citas -->
            <div v-if="activeTab === 'citas'" class="tab-pane">
              <h3>{{ $t('admin.reservedAppointments') }}</h3>

              <!-- Controles de paginación para citas -->
              <div class="pagination-controls" v-if="citasTotalPages > 1">
                <div class="pagination-info">
                  Mostrando {{ citasStartItem }}-{{ citasEndItem }} de {{ citasCompletas.length }} citas
                </div>
                <div class="pagination-buttons">
                  <button @click="citasPreviousPage" :disabled="citasCurrentPage === 1" class="btn-pagination">
                    ‹ Anterior
                  </button>
                  <div class="page-numbers">
                    <button v-for="page in citasVisiblePages" :key="'citas-' + page" @click="citasGoToPage(page)"
                      :class="{
                        'btn-pagination': true,
                        'active': page === citasCurrentPage,
                        'ellipsis': page === '...'
                      }" :disabled="page === '...'">
                      {{ page }}
                    </button>
                  </div>
                  <button @click="citasNextPage" :disabled="citasCurrentPage === citasTotalPages"
                    class="btn-pagination">
                    Siguiente ›
                  </button>
                </div>
                <div class="items-per-page">
                  <label for="citasItemsPerPage">Mostrar:</label>
                  <select id="citasItemsPerPage" v-model="citasItemsPerPage" @change="citasResetPagination">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{{ $t('admin.name') }}</th>
                      <th>{{ $t('admin.idCard') }}</th>
                      <th>{{ $t('admin.phone') }}</th>
                      <th>{{ $t('admin.treatment') }}</th>
                      <th>{{ $t('admin.date') }}</th>
                      <th>{{ $t('admin.time') }}</th>
                      <th>{{ $t('admin.status') }}</th>
                      <th>{{ $t('admin.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cita in citasPaginadas" :key="cita.id">
                      <td>{{ cita.id }}</td>
                      <td>{{ cita.nombre }}</td>
                      <td>{{ cita.carnet }}</td>
                      <td>{{ cita.telefono }}</td>
                      <td>{{ cita.tratamiento }}</td>
                      <td>{{ cita.fecha }}</td>
                      <td>{{ cita.hora }}</td>
                      <td>
                        <span :class="`status-${cita.estado.toLowerCase()}`">
                          {{ cita.estado }}
                        </span>
                      </td>
                      <td>
                        <button v-if="cita.estado === 'Confirmada'" @click="cancelarCita(cita.id)"
                          class="btn btn-danger btn-sm">
                          {{ $t('admin.cancel') }}
                        </button>
                        <span v-else class="text-muted">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="citasCompletas.length === 0" class="no-data">
                  {{ $t('admin.noAppointments') }}
                </div>
              </div>
            </div>

            <!-- Gestión de Paquetes -->
            <div v-if="activeTab === 'paquetes'" class="tab-pane">
              <h3>{{ $t('admin.purchasedPackages') }}</h3>

              <!-- Controles de paginación para paquetes -->
              <div class="pagination-controls" v-if="paquetesTotalPages > 1">
                <div class="pagination-info">
                  Mostrando {{ paquetesStartItem }}-{{ paquetesEndItem }} de {{ paquetesCompletos.length }} paquetes
                </div>
                <div class="pagination-buttons">
                  <button @click="paquetesPreviousPage" :disabled="paquetesCurrentPage === 1" class="btn-pagination">
                    ‹ Anterior
                  </button>
                  <div class="page-numbers">
                    <button v-for="page in paquetesVisiblePages" :key="'paquetes-' + page"
                      @click="paquetesGoToPage(page)" :class="{
                        'btn-pagination': true,
                        'active': page === paquetesCurrentPage,
                        'ellipsis': page === '...'
                      }" :disabled="page === '...'">
                      {{ page }}
                    </button>
                  </div>
                  <button @click="paquetesNextPage" :disabled="paquetesCurrentPage === paquetesTotalPages"
                    class="btn-pagination">
                    Siguiente ›
                  </button>
                </div>
                <div class="items-per-page">
                  <label for="paquetesItemsPerPage">Mostrar:</label>
                  <select id="paquetesItemsPerPage" v-model="paquetesItemsPerPage" @change="paquetesResetPagination">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>{{ $t('admin.name') }}</th>
                      <th>{{ $t('admin.idCard') }}</th>
                      <th>{{ $t('admin.phone') }}</th>
                      <th>{{ $t('admin.package') }}</th>
                      <th>{{ $t('admin.treatments') }}</th>
                      <th>{{ $t('admin.startDate') }}</th>
                      <th>{{ $t('admin.status') }}</th>
                      <th>{{ $t('admin.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="paquete in paquetesPaginados" :key="paquete.id">
                      <td>{{ paquete.id }}</td>
                      <td>{{ paquete.nombre }}</td>
                      <td>{{ paquete.carnet }}</td>
                      <td>{{ paquete.telefono }}</td>
                      <td>{{ paquete.paquete }}</td>
                      <td>
                        <ul class="tratamientos-list">
                          <li v-for="tratamiento in paquete.tratamientos" :key="tratamiento">
                            {{ tratamiento }}
                          </li>
                        </ul>
                      </td>
                      <td>{{ paquete.fechaInicio }}</td>
                      <td>
                        <span :class="`status-${paquete.estado.toLowerCase()}`">
                          {{ paquete.estado }}
                        </span>
                      </td>
                      <td>
                        <button v-if="paquete.estado === 'Activo'" @click="cancelarPaquete(paquete.id)"
                          class="btn btn-danger btn-sm">
                          {{ $t('admin.cancel') }}
                        </button>
                        <span v-else class="text-muted">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="paquetesCompletos.length === 0" class="no-data">
                  {{ $t('admin.noPackages') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useI18n } from 'vue-i18n'

export default {
  name: 'AdminDashboard',
  setup() {
    const { t } = useI18n()
    const store = useAppStore()
    const activeTab = ref('citas')

    // Variables de paginación para citas
    const citasCurrentPage = ref(1)
    const citasItemsPerPage = ref(10)

    // Variables de paginación para paquetes
    const paquetesCurrentPage = ref(1)
    const paquetesItemsPerPage = ref(10)

    // Datos completos del store
    const citasCompletas = computed(() => store.citas || [])
    const paquetesCompletos = computed(() => store.paquetesComprados || [])

    // Computed para paginación de citas
    const citasTotalPages = computed(() => {
      return Math.ceil(citasCompletas.value.length / citasItemsPerPage.value)
    })

    const citasStartItem = computed(() => {
      return (citasCurrentPage.value - 1) * citasItemsPerPage.value + 1
    })

    const citasEndItem = computed(() => {
      const end = citasCurrentPage.value * citasItemsPerPage.value
      return end > citasCompletas.value.length ? citasCompletas.value.length : end
    })

    const citasPaginadas = computed(() => {
      const start = (citasCurrentPage.value - 1) * citasItemsPerPage.value
      const end = start + citasItemsPerPage.value
      return citasCompletas.value.slice(start, end)
    })

    const citasVisiblePages = computed(() => {
      return getVisiblePages(citasCurrentPage.value, citasTotalPages.value)
    })

    // Computed para paginación de paquetes
    const paquetesTotalPages = computed(() => {
      return Math.ceil(paquetesCompletos.value.length / paquetesItemsPerPage.value)
    })

    const paquetesStartItem = computed(() => {
      return (paquetesCurrentPage.value - 1) * paquetesItemsPerPage.value + 1
    })

    const paquetesEndItem = computed(() => {
      const end = paquetesCurrentPage.value * paquetesItemsPerPage.value
      return end > paquetesCompletos.value.length ? paquetesCompletos.value.length : end
    })

    const paquetesPaginados = computed(() => {
      const start = (paquetesCurrentPage.value - 1) * paquetesItemsPerPage.value
      const end = start + paquetesItemsPerPage.value
      return paquetesCompletos.value.slice(start, end)
    })

    const paquetesVisiblePages = computed(() => {
      return getVisiblePages(paquetesCurrentPage.value, paquetesTotalPages.value)
    })

    // Función auxiliar para páginas visibles
    const getVisiblePages = (current, total) => {
      const pages = []

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
    }

    // Métodos de paginación para citas
    const citasNextPage = () => {
      if (citasCurrentPage.value < citasTotalPages.value) {
        citasCurrentPage.value++
      }
    }

    const citasPreviousPage = () => {
      if (citasCurrentPage.value > 1) {
        citasCurrentPage.value--
      }
    }

    const citasGoToPage = (page) => {
      if (page !== '...' && page >= 1 && page <= citasTotalPages.value) {
        citasCurrentPage.value = page
      }
    }

    const citasResetPagination = () => {
      citasCurrentPage.value = 1
    }

    // Métodos de paginación para paquetes
    const paquetesNextPage = () => {
      if (paquetesCurrentPage.value < paquetesTotalPages.value) {
        paquetesCurrentPage.value++
      }
    }

    const paquetesPreviousPage = () => {
      if (paquetesCurrentPage.value > 1) {
        paquetesCurrentPage.value--
      }
    }

    const paquetesGoToPage = (page) => {
      if (page !== '...' && page >= 1 && page <= paquetesTotalPages.value) {
        paquetesCurrentPage.value = page
      }
    }

    const paquetesResetPagination = () => {
      paquetesCurrentPage.value = 1
    }

    // Watchers para resetear paginación cuando cambia la pestaña
    watch(activeTab, (newTab) => {
      if (newTab === 'citas') {
        citasResetPagination()
      } else {
        paquetesResetPagination()
      }
    })

    // Datos de ejemplo para testing
    onMounted(() => {
      // Si no hay datos en el store, cargar datos de ejemplo
      if (store.citas.length === 0) {
        store.citas = [
          {
            id: 1,
            nombre: 'María González',
            carnet: '12345678',
            telefono: '555-1234',
            tratamiento: 'Masaje Relajante',
            fecha: '2024-01-15',
            hora: '10:00',
            estado: 'Confirmada'
          },
          {
            id: 2,
            nombre: 'Carlos López',
            carnet: '87654321',
            telefono: '555-5678',
            tratamiento: 'Facial Hidratante',
            fecha: '2024-01-16',
            hora: '14:30',
            estado: 'Confirmada'
          },
          {
            id: 3,
            nombre: 'Ana Martínez',
            carnet: '11223344',
            telefono: '555-9012',
            tratamiento: 'Manicure y Pedicure',
            fecha: '2024-01-17',
            hora: '11:15',
            estado: 'Cancelada'
          }
        ]
      }

      if (store.paquetesComprados.length === 0) {
        store.paquetesComprados = [
          {
            id: 1,
            nombre: 'Roberto Sánchez',
            carnet: '55667788',
            telefono: '555-3456',
            paquete: 'Spa Completo',
            tratamientos: ['Masaje Relajante', 'Facial Hidratante', 'Manicure'],
            fechaInicio: '2024-01-10',
            estado: 'Activo'
          },
          {
            id: 2,
            nombre: 'Laura Díaz',
            carnet: '99887766',
            telefono: '555-7890',
            paquete: 'Belleza Express',
            tratamientos: ['Facial Limpieza', 'Manicure Básico'],
            fechaInicio: '2024-01-12',
            estado: 'Cancelado'
          }
        ]
      }
    })

    const cancelarCita = (id) => {
      if (confirm(t('admin.confirmCancel', { item: t('admin.appointment') }))) {
        store.cancelarCita(id)
      }
    }

    const cancelarPaquete = (id) => {
      if (confirm(t('admin.confirmCancel', { item: t('admin.package') }))) {
        store.cancelarPaquete(id)
      }
    }

    return {
      activeTab,
      // Datos paginados para las tablas
      citasPaginadas,
      paquetesPaginados,
      // Datos completos para la información de paginación
      citasCompletas,
      paquetesCompletos,
      // Variables de paginación para citas
      citasCurrentPage,
      citasItemsPerPage,
      citasTotalPages,
      citasStartItem,
      citasEndItem,
      citasVisiblePages,
      // Variables de paginación para paquetes
      paquetesCurrentPage,
      paquetesItemsPerPage,
      paquetesTotalPages,
      paquetesStartItem,
      paquetesEndItem,
      paquetesVisiblePages,
      // Métodos de paginación para citas
      citasNextPage,
      citasPreviousPage,
      citasGoToPage,
      citasResetPagination,
      // Métodos de paginación para paquetes
      paquetesNextPage,
      paquetesPreviousPage,
      paquetesGoToPage,
      paquetesResetPagination,
      // Métodos existentes
      cancelarCita,
      cancelarPaquete,
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

.admin-tabs {
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-buttons {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.tab-btn {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #6c757d;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: #495057;
  background: #e9ecef;
}

.tab-btn.active {
  color: #ff6b95;
  border-bottom-color: #ff6b95;
  background: white;
}

.tab-content {
  padding: 2rem;
}

.tab-pane h3 {
  margin-bottom: 1.5rem;
  color: #5a5a5a;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-confirmada,
.status-activo {
  color: #28a745;
  font-weight: 600;
}

.status-cancelada,
.status-cancelado {
  color: #dc3545;
  font-weight: 600;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.tratamientos-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tratamientos-list li {
  padding: 0.1rem 0;
  font-size: 0.875rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
}

.text-muted {
  color: #6c757d;
  font-style: italic;
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

  .tab-buttons {
    flex-direction: column;
  }

  .tab-btn {
    text-align: left;
  }

  .data-table {
    font-size: 0.875rem;
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
}
</style>