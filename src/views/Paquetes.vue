<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('packages.title') }}</h2>
        <p>{{ $t('packages.subtitle') }}</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <!-- Estado de carga -->
        <div v-if="loading" class="loading-state">
          <p>Cargando paquetes...</p>
        </div>

        <!-- Estado sin datos -->
        <div v-else-if="paquetesPaginados.length === 0" class="empty-state">
          <h3>No hay paquetes disponibles</h3>
          <p>En este momento no hay paquetes para mostrar.</p>
        </div>

        <!-- Contenido principal -->
        <div v-else>
          <!-- Información de paginación superior -->
          <div class="pagination-info-top" v-if="totalPages > 1">
            <p>Mostrando {{ startItem }}-{{ endItem }} de {{ totalPaquetes }} paquetes</p>
          </div>

          <div class="paquetes-grid">
            <div v-for="paquete in paquetesPaginados" :key="paquete.id" class="paquete-card">
              <div class="paquete-header">
                <h3>{{ paquete.nombre }}</h3>
                <div class="paquete-precio">${{ paquete.precio }}</div>
              </div>
              <div class="paquete-body">
                <p class="paquete-descripcion">{{ paquete.descripcion }}</p>
                <div class="paquete-tratamientos">
                  <h4>{{ $t('packages.includedTreatments') }}</h4>
                  <ul>
                    <li v-for="tratamientoId in paquete.tratamientos" :key="tratamientoId">
                      {{ getTratamientoNombre(tratamientoId) }}
                    </li>
                  </ul>
                </div>
                <div class="paquete-duracion">
                  <strong>{{ $t('packages.totalDuration', { minutes: calcularDuracionTotal(paquete.tratamientos) })
                  }}</strong>
                </div>
                <div class="paquete-ahorro" v-if="calcularAhorro(paquete) > 0">
                  <span class="ahorro-tag">{{ $t('packages.youSave', { amount: calcularAhorro(paquete) }) }}</span>
                </div>
                <div class="paquete-ahorro paquete-ahorro-vacio" v-else></div>
              </div>
              <div class="paquete-footer">
                <button v-if="isCliente" @click="comprarPaquetePredefinido(paquete)" class="btn btn-primary">
                  {{ $t('packages.buyPackage') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Controles de paginación inferior (igual que Tratamientos.vue) -->
          <div class="pagination-controls" v-if="totalPages > 1">
            <div class="pagination-info">
              Mostrando {{ startItem }}-{{ endItem }} de {{ totalPaquetes }} paquetes
            </div>
            <div class="pagination-buttons">
              <button @click="previousPage" :disabled="currentPage === 1" class="btn-pagination">
                ‹ Anterior
              </button>

              <!-- Números de página -->
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
                Siguiente ›
              </button>
            </div>

            <!-- Selector de items por página -->
            <div class="items-per-page">
              <label for="itemsPerPage">Mostrar:</label>
              <select id="itemsPerPage" v-model="itemsPerPage" @change="resetPagination">
                <option value="6">6</option>
                <option value="9">9</option>
                <option value="12">12</option>
                <option value="15">15</option>
              </select>
            </div>
          </div>
        </div>

        <div class="info-adicional">
          <div class="info-card" v-if="isCliente">
            <h3>{{ $t('packages.personalizedPackages') }}</h3>
            <p>{{ $t('packages.personalizedDescription') }}</p>
            <router-link to="/comprar-paquete" @click="crearPaquetePersonalizado" class="btn-link">
              {{ $t('packages.createPersonalized') }}
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'vue-router'

export default {
  name: 'Paquetes',
  setup() {
    const store = useAppStore()
    const router = useRouter()

    // Variables de paginación
    const currentPage = ref(1)
    const itemsPerPage = ref(6)
    const loading = ref(true)

    const paquetes = computed(() => {
      console.log('Paquetes en store:', store.paquetes)
      return store.paquetes
    })

    const tratamientos = computed(() => {
      console.log('Tratamientos en store:', store.tratamientos)
      return store.tratamientos
    })

    const isCliente = computed(() => store.isCliente)
    const user = computed(() => store.auth.user)

    // Computed para paginación
    const totalPaquetes = computed(() => paquetes.value.length)

    const totalPages = computed(() => {
      return Math.ceil(totalPaquetes.value / itemsPerPage.value)
    })

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return end > totalPaquetes.value ? totalPaquetes.value : end
    })

    const paquetesPaginados = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return paquetes.value.slice(start, end)
    })

    // Números de página visibles
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

    // Resetear paginación cuando cambian los datos
    watch(paquetes, () => {
      currentPage.value = 1
      loading.value = false
    })

    const comprarPaquetePredefinido = async (paquete) => {
      try {
        console.log('Iniciando compra de paquete:', paquete)

        // Verificar que el usuario esté autenticado
        if (!store.auth.isAuthenticated || !user.value) {
          alert('Debe iniciar sesión para comprar un paquete')
          router.push('/login')
          return
        }

        // Verificar que el paquete tenga todos los datos necesarios
        if (!paquete || !paquete.id || !paquete.nombre) {
          console.error('Paquete inválido:', paquete)
          alert('Error: Paquete no válido')
          return
        }

        // Verificar datos del usuario
        if (!user.value.carnet || !user.value.nombre) {
          console.error('Datos de usuario incompletos:', user.value)
          alert('Error: Datos de usuario incompletos')
          return
        }

        console.log('Datos del usuario:', user.value)
        console.log('Paquete seleccionado:', paquete)

        // Guardar el paquete seleccionado en el store
        store.paqueteSeleccionado = paquete
        store.tipoPaqueteSeleccionado = 'predefinido'

        console.log('Store actualizado - paqueteSeleccionado:', store.paqueteSeleccionado)
        console.log('Store actualizado - tipoPaqueteSeleccionado:', store.tipoPaqueteSeleccionado)

        // Navegar a la página de compra
        router.push('/comprar-paquete')

      } catch (error) {
        console.error('Error al comprar paquete:', error)
        alert('Error al procesar la compra: ' + error.message)
      }
    }

    const crearPaquetePersonalizado = () => {
      try {
        // Solo establecer el tipo, el router-link ya maneja la navegación
        store.paqueteSeleccionado = null
        store.tipoPaqueteSeleccionado = 'personalizado'
        console.log('Paquete personalizado configurado')
      } catch (error) {
        console.error('Error al crear paquete personalizado:', error)
      }
    }

    const getTratamientoNombre = (id) => {
      try {
        const tratamiento = tratamientos.value.find(t => t.id === id)
        return tratamiento ? tratamiento.nombre : 'Tratamiento no encontrado'
      } catch (error) {
        console.error('Error al obtener nombre de tratamiento:', error)
        return 'Tratamiento no disponible'
      }
    }

    const getTratamientoPrecio = (id) => {
      try {
        const tratamiento = tratamientos.value.find(t => t.id === id)
        return tratamiento ? tratamiento.precio : 0
      } catch (error) {
        console.error('Error al obtener precio de tratamiento:', error)
        return 0
      }
    }

    const getTratamientoDuracion = (id) => {
      try {
        const tratamiento = tratamientos.value.find(t => t.id === id)
        return tratamiento ? tratamiento.duracion : 0
      } catch (error) {
        console.error('Error al obtener duración de tratamiento:', error)
        return 0
      }
    }

    const calcularDuracionTotal = (tratamientosIds) => {
      try {
        return tratamientosIds.reduce((total, id) => {
          return total + getTratamientoDuracion(id)
        }, 0)
      } catch (error) {
        console.error('Error al calcular duración total:', error)
        return 0
      }
    }

    const calcularAhorro = (paquete) => {
      try {
        const precioIndividual = paquete.tratamientos.reduce((total, id) => {
          return total + getTratamientoPrecio(id)
        }, 0)
        return precioIndividual - paquete.precio
      } catch (error) {
        console.error('Error al calcular ahorro:', error)
        return 0
      }
    }

    // Inicializar
    onMounted(() => {
      console.log('Componente Paquetes montado')
      console.log('Paquetes disponibles:', store.paquetes)
      console.log('Tratamientos disponibles:', store.tratamientos)
      console.log('Usuario actual:', store.auth.user)
      console.log('Autenticado:', store.auth.isAuthenticated)
      loading.value = false
    })

    return {
      // Datos principales
      paquetesPaginados,
      totalPaquetes,
      isCliente,
      loading,
      user,

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
      comprarPaquetePredefinido,
      crearPaquetePersonalizado,
      getTratamientoNombre,
      calcularDuracionTotal,
      calcularAhorro
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 4vw, 2rem) 0;
  text-align: center;
}

.page-header h2 {
  color: #5a5a5a;
  margin-bottom: 0.5rem;
  font-size: clamp(1.3rem, 5vw, 1.8rem);
}

.content-section {
  padding: clamp(1rem, 3vw, 2rem) 0;
}

/* Información de paginación superior */
.pagination-info-top {
  text-align: center;
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  color: #666;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
}

.pagination-info-top p {
  margin: 0;
  padding: clamp(0.4rem, 1.5vw, 0.5rem);
  background: #f8f9fa;
  border-radius: 5px;
  display: inline-block;
}

.paquetes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.paquete-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: min(450px, 80vw);
}

.paquete-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.paquete-header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 3vw, 2rem);
  text-align: center;
  position: relative;
}

.paquete-header h3 {
  color: #5a5a5a;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(1.1rem, 4vw, 1.5rem);
}

.paquete-precio {
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 700;
  color: #ff6b95;
  background: white;
  padding: clamp(0.4rem, 2vw, 0.5rem) clamp(0.8rem, 3vw, 1rem);
  border-radius: 25px;
  display: inline-block;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.paquete-body {
  padding: clamp(1rem, 3vw, 2rem);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.paquete-descripcion {
  color: #666;
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  font-style: italic;
  text-align: center;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
  line-height: 1.5;
}

.paquete-tratamientos {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.paquete-tratamientos h4 {
  color: #5a5a5a;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.95rem, 3vw, 1.1rem);
  border-bottom: 2px solid #f8c8dc;
  padding-bottom: 0.5rem;
}

.paquete-tratamientos ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.paquete-tratamientos li {
  padding: clamp(0.4rem, 1.5vw, 0.5rem) 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  font-size: clamp(0.85rem, 2.5vw, 0.9rem);
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
  padding-top: clamp(0.75rem, 2vw, 1rem);
  border-top: 2px solid #f0f0f0;
  text-align: center;
  color: #5a5a5a;
  font-size: clamp(0.85rem, 2.5vw, 0.95rem);
}

.paquete-ahorro {
  margin-top: clamp(0.75rem, 2vw, 1rem);
  text-align: center;
}

.paquete-ahorro-vacio {
  height: clamp(1.5rem, 4vw, 2rem);
}

.ahorro-tag {
  background-color: #f0f0f0;
  color: #444;
  padding: clamp(0.25rem, 1.5vw, 0.3rem) clamp(0.6rem, 2vw, 0.8rem);
  border-radius: 10px;
  font-weight: 500;
  font-size: clamp(0.8rem, 2.5vw, 0.85rem);
  display: inline-block;
  border: 1px solid #ddd;
}

.paquete-footer {
  padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem);
  background: #f8f9fa;
  text-align: center;
}

.btn {
  padding: clamp(0.6rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 600;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  background: #ff6b95;
  color: white;
}

.btn:hover {
  background: #e55a82;
  transform: translateY(-2px);
}

/* CONTROLES DE PAGINACIÓN FLUIDOS */
.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: clamp(1rem, 3vw, 1.5rem) 0;
  padding: clamp(0.75rem, 2vw, 1rem);
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: clamp(0.5rem, 2vw, 1rem);
}

.pagination-info {
  color: #666;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  font-weight: 500;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 1vw, 0.5rem);
  flex-wrap: wrap;
  justify-content: center;
}

.btn-pagination {
  padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem);
  border: 1px solid #ddd;
  background: white;
  color: #5a5a5a;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  min-width: clamp(35px, 8vw, 40px);
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
  gap: clamp(0.1rem, 1vw, 0.25rem);
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 1vw, 0.5rem);
  font-size: clamp(0.8rem, 2vw, 0.9rem);
}

.items-per-page select {
  padding: clamp(0.3rem, 1.5vw, 0.4rem);
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
}

.info-adicional {
  max-width: min(600px, 95vw);
  margin: 0 auto clamp(1rem, 4vw, 3rem);
}

.info-card {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
  color: #5a5a5a;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(1.1rem, 3vw, 1.3rem);
}

.info-card p {
  color: #666;
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  font-size: clamp(0.9rem, 2.5vw, 0.95rem);
  line-height: 1.5;
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

.loading-state,
.empty-state {
  text-align: center;
  padding: clamp(1.5rem, 5vw, 3rem);
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin: clamp(1rem, 3vw, 2rem) 0;
}

.loading-state p {
  color: #666;
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.empty-state h3 {
  color: #5a5a5a;
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(1.1rem, 3vw, 1.3rem);
}

.empty-state p {
  color: #666;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* AJUSTES PARA DISPOSITIVOS MUY PEQUEÑOS */
@media (max-width: 360px) {
  .pagination-controls {
    flex-direction: column;
    text-align: center;
  }

  .pagination-buttons {
    flex-direction: column;
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

  .paquete-header {
    padding: 1rem;
  }

  .paquete-body {
    padding: 1rem;
  }
}
</style>