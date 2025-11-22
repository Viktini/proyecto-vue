<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('cancelPackage.title') }}</h2>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <!-- Solo mostrar cuando hay paquetes -->
        <div v-if="paquetesTotales.length > 0" class="paquetes-container">
          <h3>{{ $t('cancelPackage.yourPackages') }}</h3>

          <div class="paquetes-grid">
            <div v-for="paquete in paquetesPaginados" :key="paquete.id" class="paquete-card"
              :class="{ seleccionado: paqueteSeleccionado === paquete.id }" @click="seleccionarPaquete(paquete.id)">
              <div class="paquete-header">
                <h4>{{ paquete.paquete }}</h4>
                <div class="paquete-id">{{ $t('cancelPackage.packageNumber', { number: paquete.id }) }}</div>
              </div>
              <div class="paquete-body">
                <p><strong>{{ $t('cancelPackage.startDate') }}</strong> {{ formatFecha(paquete.fechaInicio) }}</p>
                <div class="paquete-tratamientos">
                  <h5>{{ $t('cancelPackage.includedTreatments') }}</h5>
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

          <div class="action-buttons">
            <button @click="cancelarPaquete" class="btn btn-danger" :disabled="!paqueteSeleccionado || cancelando">
              {{ cancelando ? $t('cancelPackage.canceling') : $t('cancelPackage.cancelSelected') }}
            </button>
          </div>
        </div>

        <!-- Mostrar cuando no hay paquetes -->
        <div v-else-if="busquedaRealizada" class="no-packages">
          <div class="no-packages-content">
            <div class="no-packages-icon">📦</div>
            <h3>{{ $t('cancelPackage.noPackagesTitle') }}</h3>
            <p>{{ $t('cancelPackage.noPackagesMessage') }}</p>
            <router-link to="/comprar-paquete" class="btn btn-primary">
              {{ $t('cancelPackage.buyFirstPackage') }}
            </router-link>
          </div>
        </div>

        <!-- Mostrar mientras se carga -->
        <div v-else class="loading">
          <p>{{ $t('cancelPackage.loading') }}</p>
        </div>

        <!-- Controles de paginación -->
        <div class="pagination-controls" v-if="totalPages > 1">
          <div class="pagination-info">
            {{ $t('cancelPackage.paginationInfo', {
              start: startItem,
              end: endItem,
              total: paquetesTotales.length
            }) }}
          </div>
          <div class="pagination-buttons">
            <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
              {{ $t('cancelPackage.previous') }}
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
              {{ $t('cancelPackage.next') }}
            </button>
          </div>
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
  name: 'CancelarPaquete',
  setup() {
    const { t } = useI18n()
    const store = useAppStore()

    // Variables de paginación
    const currentPage = ref(1)
    const itemsPerPage = ref(5)

    // Cambiar el nombre para mayor claridad
    const paquetesTotales = ref([]) // Todos los paquetes encontrados
    const paqueteSeleccionado = ref(null)
    const loading = ref(false)
    const cancelando = ref(false)
    const busquedaRealizada = ref(false)
    const resultado = ref(null)

    // Computed para los paquetes que se muestran (paginados)
    const paquetesPaginados = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return paquetesTotales.value.slice(start, end)
    })

    // Computed para paginación
    const totalPages = computed(() => {
      return Math.ceil(paquetesTotales.value.length / itemsPerPage.value)
    })

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return end > paquetesTotales.value.length ? paquetesTotales.value.length : end
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value

      if (total <= 5) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 3; i <= total; i++) {
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

    // Métodos de paginación (sin cambios)
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

    // Métodos específicos de paquetes
    const cargarPaquetesDelUsuario = () => {
      loading.value = true
      const usuario = store.auth.user || {}
      const carnetUsuario = usuario.carnet

      if (!carnetUsuario) {
        mostrarResultado(t('cancelPackage.errors.noUserCard'), 'error')
        loading.value = false
        busquedaRealizada.value = true
        return
      }

      try {
        // Obtener todos los paquetes del usuario
        const paquetes = store.paquetesPorCarnet(carnetUsuario)

        // Filtrar solo los paquetes activos para cancelar
        paquetesTotales.value = paquetes.filter(paquete => paquete.estado === 'Activo')
        busquedaRealizada.value = true

        resetPagination()
      } catch (error) {
        mostrarResultado(t('cancelPackage.errors.loadError'), 'error')
      } finally {
        loading.value = false
      }
    }

    const seleccionarPaquete = (id) => {
      paqueteSeleccionado.value = id
    }

    const cancelarPaquete = async () => {
      if (!paqueteSeleccionado.value) {
        mostrarResultado(t('cancelPackage.selectPackage'), 'error')
        return
      }

      cancelando.value = true

      try {
        await store.cancelarPaquete(paqueteSeleccionado.value)
        mostrarResultado(t('cancelPackage.success'), 'exito')

        // Actualizar la lista
        paquetesTotales.value = paquetesTotales.value.filter(
          paquete => paquete.id !== paqueteSeleccionado.value
        )
        paqueteSeleccionado.value = null
        resetPagination()
      } catch (error) {
        mostrarResultado(t('cancelPackage.error'), 'error')
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

    onMounted(() => {
      cargarPaquetesDelUsuario()
    })

    return {
      // Datos para el template
      paquetesTotales, // Todos los paquetes (para verificar si hay datos)
      paquetesPaginados, // Paquetes de la página actual
      paqueteSeleccionado,
      loading,
      cancelando,
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
      // Métodos específicos de paquetes
      seleccionarPaquete,
      cancelarPaquete,
      formatFecha,
      t
    }
  }
}
</script>

<style scoped>
/* Tus estilos se mantienen igual */
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

.no-packages {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.no-packages-content {
  text-align: center;
  max-width: 400px;
}

.no-packages-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-packages h3 {
  color: #5a5a5a;
  margin-bottom: 1rem;
}

.no-packages p {
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

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
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

  .btn-pagination {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    min-width: 35px;
  }

  .page-numbers {
    gap: 0.1rem;
  }

  .paquetes-grid {
    grid-template-columns: 1fr;
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