<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('treatments.title') }}</h2>
        <p>{{ $t('treatments.subtitle') }}</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <!-- Filtros -->
        <div class="filtros-container">
          <div class="filtro-group">
            <label for="filtro-categoria">{{ $t('treatments.filterCategory') }}</label>
            <select id="filtro-categoria" v-model="filtroCategoria" class="filtro-select">
              <option value="">{{ $t('treatments.allCategories') }}</option>
              <option v-for="categoria in categorias" :key="categoria" :value="categoria">
                {{ categoria }}
              </option>
            </select>
          </div>

          <div class="filtro-group">
            <label for="filtro-precio">{{ $t('treatments.filterPrice') }}</label>
            <select id="filtro-precio" v-model="filtroPrecio" class="filtro-select">
              <option value="">{{ $t('treatments.allPrices') }}</option>
              <option value="0-30">$0 - $30</option>
              <option value="31-50">$31 - $50</option>
              <option value="51-100">$51 - $100</option>
            </select>
          </div>

          <div class="filtro-group">
            <label for="buscar-tratamiento">{{ $t('treatments.searchTreatment') }}</label>
            <input type="text" id="buscar-tratamiento" v-model="busqueda"
              :placeholder="$t('treatments.searchTreatment')" class="filtro-busqueda">
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="estadisticas" v-if="isAdmin">
          <div class="estadistica-card">
            <div class="estadistica-valor">{{ tratamientosFiltrados.length }}</div>
            <div class="estadistica-label">{{ $t('treatments.availableTreatments') }}</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-valor">{{ categorias.length }}</div>
            <div class="estadistica-label">{{ $t('treatments.categories') }}</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-valor">${{ precioMinimo }} - ${{ precioMaximo }}</div>
            <div class="estadistica-label">{{ $t('treatments.priceRange') }}</div>
          </div>
        </div>

        <!-- Estado sin resultados -->
        <div v-if="tratamientosFiltrados.length === 0" class="no-resultados">
          <p>{{ $t('treatments.noResults') }}</p>
          <button @click="limpiarFiltros" class="btn btn-secondary">
            {{ $t('treatments.clearFilters') }}
          </button>
        </div>

        <!-- VISTA PARA ADMINISTRADOR (Tabla) -->
        <div v-else-if="isAdmin" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="ordenarPor('id')" class="sortable">
                  {{ $t('treatments.id') }}
                  <span v-if="ordenCampo === 'id'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('nombre')" class="sortable">
                  {{ $t('treatments.name') }}
                  <span v-if="ordenCampo === 'nombre'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('categoria')" class="sortable">
                  {{ $t('treatments.category') }}
                  <span v-if="ordenCampo === 'categoria'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('duracion')" class="sortable">
                  {{ $t('treatments.duration') }}
                  <span v-if="ordenCampo === 'duracion'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('precio')" class="sortable">
                  {{ $t('treatments.price') }}
                  <span v-if="ordenCampo === 'precio'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th>{{ $t('treatments.description') }}</th>
                <th>{{ $t('treatments.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tratamiento in tratamientosPaginados" :key="tratamiento.id">
                <td class="text-center">{{ tratamiento.id }}</td>
                <td>
                  <strong>{{ tratamiento.nombre }}</strong>
                </td>
                <td>
                  <span class="categoria-tag" :style="{ backgroundColor: getColorCategoria(tratamiento.categoria) }">
                    {{ tratamiento.categoria }}
                  </span>
                </td>
                <td class="text-center">{{ tratamiento.duracion }} min</td>
                <td class="text-center">
                  <span class="precio">${{ tratamiento.precio }}</span>
                </td>
                <td class="descripcion-cell">
                  {{ tratamiento.descripcion }}
                </td>
                <td class="text-center acciones-cell">
                  <button v-if="isCliente" class="btn btn-primary btn-small" @click="irAReserva(tratamiento)">
                    {{ $t('treatments.book') }}
                  </button>
                  <button class="btn-eliminar" @click="eliminarTratamiento(tratamiento)" v-if="isAdmin">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA PARA CLIENTE (Tarjetas) -->
        <div v-else class="tarjetas-container">
          <div v-for="tratamiento in tratamientosPaginados" :key="tratamiento.id" class="tarjeta-tratamiento">
            <div class="contenido-tratamiento">
              <div class="tarjeta-header">
                <h3 class="tratamiento-nombre">{{ tratamiento.nombre }}</h3>
                <span class="categoria-tag" :style="{ backgroundColor: getColorCategoria(tratamiento.categoria) }">
                  {{ tratamiento.categoria }}
                </span>
              </div>

              <p class="descripcion">{{ tratamiento.descripcion }}</p>

              <div class="tarjeta-info">
                <div class="info-item">
                  <span class="info-label">Duración:</span>
                  <span class="info-value">{{ tratamiento.duracion }} min</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Precio:</span>
                  <span class="precio">${{ tratamiento.precio }}</span>
                </div>
              </div>

              <div class="tarjeta-actions">
                <button class="btn btn-primary btn-reservar" @click="irAReserva(tratamiento)">
                  {{ $t('treatments.book') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Controles de paginación inferior -->
        <div class="pagination-controls" v-if="totalPages > 1 && tratamientosFiltrados.length > 0">
          <div class="pagination-info">
            Mostrando {{ startItem }}-{{ endItem }} de {{ tratamientosFiltrados.length }} tratamientos
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
              <option value="9">9</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'vue-router'

export default {
  name: 'Tratamientos',
  setup() {
    const store = useAppStore()
    const router = useRouter()
    const tratamientos = computed(() => store.tratamientos || [])
    const isCliente = computed(() => store.isCliente)
    const isAdmin = computed(() => store.isAdmin)

    // Variables de paginación - Por defecto 9 para clientes
    const currentPage = ref(1)
    const itemsPerPage = ref(9)

    // Filtros y ordenamiento
    const filtroCategoria = ref('')
    const filtroPrecio = ref('')
    const busqueda = ref('')
    const ordenCampo = ref('id')
    const ordenDireccion = ref('asc')

    // Computed para paginación
    const totalPages = computed(() => {
      return Math.ceil(tratamientosFiltrados.value.length / itemsPerPage.value)
    })

    const startItem = computed(() => {
      return (currentPage.value - 1) * itemsPerPage.value + 1
    })

    const endItem = computed(() => {
      const end = currentPage.value * itemsPerPage.value
      return end > tratamientosFiltrados.value.length ? tratamientosFiltrados.value.length : end
    })

    const tratamientosPaginados = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return tratamientosFiltradosOrdenados.value.slice(start, end)
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

    // Watchers para resetear paginación cuando cambian los filtros
    watch([filtroCategoria, filtroPrecio, busqueda], () => {
      resetPagination()
    })

    // Métodos de navegación
    const irAReserva = (tratamiento) => {
      store.seleccionarTratamiento(tratamiento)
      router.push({ name: 'ReservarCita' })
    }

    const eliminarTratamiento = (tratamiento) => {
      if (confirm(`¿Estás seguro de que quieres eliminar el tratamiento "${tratamiento.nombre}"?`)) {
        console.log('Eliminar tratamiento:', tratamiento)
        // Aquí iría la lógica para eliminar el tratamiento del store
      }
    }

    // Obtener categorías únicas
    const categorias = computed(() => {
      const categoriasUnicas = [...new Set(tratamientos.value.map(t => t.categoria))]
      return categoriasUnicas.sort()
    })

    // Estadísticas
    const precioMinimo = computed(() => {
      if (tratamientos.value.length === 0) return 0
      return Math.min(...tratamientos.value.map(t => t.precio))
    })

    const precioMaximo = computed(() => {
      if (tratamientos.value.length === 0) return 0
      return Math.max(...tratamientos.value.map(t => t.precio))
    })

    // Filtrar tratamientos
    const tratamientosFiltrados = computed(() => {
      let filtered = [...tratamientos.value]

      // Filtrar por categoría
      if (filtroCategoria.value) {
        filtered = filtered.filter(t => t.categoria === filtroCategoria.value)
      }

      // Filtrar por precio
      if (filtroPrecio.value) {
        const [min, max] = filtroPrecio.value.split('-').map(Number)
        filtered = filtered.filter(t => t.precio >= min && t.precio <= max)
      }

      // Filtrar por búsqueda
      if (busqueda.value) {
        const searchTerm = busqueda.value.toLowerCase()
        filtered = filtered.filter(t =>
          t.nombre.toLowerCase().includes(searchTerm) ||
          t.descripcion.toLowerCase().includes(searchTerm)
        )
      }

      return filtered
    })

    // Ordenar tratamientos
    const tratamientosFiltradosOrdenados = computed(() => {
      return [...tratamientosFiltrados.value].sort((a, b) => {
        let aValue = a[ordenCampo.value]
        let bValue = b[ordenCampo.value]

        // Ordenar strings
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (ordenDireccion.value === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })
    })

    // Métodos
    const ordenarPor = (campo) => {
      if (ordenCampo.value === campo) {
        ordenDireccion.value = ordenDireccion.value === 'asc' ? 'desc' : 'asc'
      } else {
        ordenCampo.value = campo
        ordenDireccion.value = 'asc'
      }
    }

    const getColorCategoria = (categoria) => {
      const colores = {
        'Masajes': '#f8c8dc',
        'Faciales': '#a2d2ff',
        'Manos y Pies': '#ffd6a5',
        'Corporales': '#caffbf',
        'Especiales': '#d8b4fe'
      }
      return colores[categoria] || '#e0e0e0'
    }

    const limpiarFiltros = () => {
      filtroCategoria.value = ''
      filtroPrecio.value = ''
      busqueda.value = ''
      ordenCampo.value = 'id'
      ordenDireccion.value = 'asc'
      resetPagination()
    }

    onMounted(() => {
      console.log('Tratamientos cargados:', tratamientos.value)
    })

    return {
      tratamientosPaginados,
      isCliente,
      isAdmin,
      filtroCategoria,
      filtroPrecio,
      busqueda,
      ordenCampo,
      ordenDireccion,
      categorias,
      tratamientosFiltrados,
      precioMinimo,
      precioMaximo,
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
      ordenarPor,
      getColorCategoria,
      limpiarFiltros,
      irAReserva,
      eliminarTratamiento
    }
  }
}
</script>

<style scoped>
/* ESTILOS FLUIDOS MEJORADOS */
.table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: clamp(1rem, 3vw, 2rem);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: min(800px, 100%);
}

.data-table th {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  color: #5a5a5a;
  font-weight: 600;
  padding: clamp(0.5rem, 2vw, 1rem);
  text-align: left;
  border-bottom: 2px solid #dee2e6;
  position: relative;
  font-size: clamp(0.8rem, 2vw, 1rem);
}

.data-table td {
  padding: clamp(0.5rem, 2vw, 1rem);
  border-bottom: 1px solid #eee;
  vertical-align: middle;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.4);
}

.sort-icon {
  margin-left: 0.5rem;
  font-weight: bold;
  position: absolute;
  right: 0.5rem;
}

.text-center {
  text-align: center;
}

.categoria-tag {
  padding: clamp(0.2rem, 1vw, 0.25rem) clamp(0.5rem, 2vw, 0.75rem);
  border-radius: 15px;
  color: #5a5a5a;
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  font-weight: 600;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
}

.precio {
  color: #ff6b95;
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  font-weight: 600;
}

.descripcion-cell {
  color: #666;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  line-height: 1.4;
  max-width: min(250px, 100%);
}

.acciones-cell {
  display: flex;
  gap: clamp(0.25rem, 1vw, 0.5rem);
  justify-content: center;
  align-items: center;
  min-width: min(120px, 100%);
  flex-wrap: wrap;
}

/* BOTONES FLUIDOS */
.btn {
  padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  min-width: max-content;
}

.btn-primary {
  background: #ff6b95;
  color: white;
}

.btn-eliminar {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
  padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #e55a82;
  transform: translateY(-1px);
}

.btn-small {
  padding: clamp(0.3rem, 1.5vw, 0.4rem) clamp(0.6rem, 2vw, 0.8rem);
  font-size: clamp(0.7rem, 2vw, 0.8rem);
}

/* ESTILOS PARA TARJETAS FLUIDAS */
.tarjetas-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.tarjeta-tratamiento {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f0f0f0;
}

.tarjeta-tratamiento:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.contenido-tratamiento {
  padding: clamp(1rem, 3vw, 1.5rem);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: clamp(0.5rem, 2vw, 1rem);
}

.tarjeta-header {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 2vw, 0.75rem);
}

.tratamiento-nombre {
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: 700;
  color: #5a5a5a;
  margin: 0;
  line-height: 1.3;
}

.descripcion {
  color: #666;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  line-height: 1.5;
  flex-grow: 1;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tarjeta-info {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.5rem);
  padding: clamp(0.5rem, 2vw, 1rem) 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: clamp(0.75rem, 2vw, 0.85rem);
  color: #888;
  font-weight: 500;
}

.info-value {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: #5a5a5a;
  font-weight: 600;
}

.tarjeta-actions {
  margin-top: auto;
  padding-top: clamp(0.5rem, 2vw, 1rem);
}

.btn-reservar {
  width: 100%;
  padding: clamp(0.6rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  font-weight: 600;
}

/* PAGINACIÓN FLUIDA */
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

/* FILTROS FLUIDOS */
.filtros-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: clamp(0.75rem, 2vw, 1rem);
  margin-bottom: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 1.5rem);
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.filtro-group {
  display: flex;
  flex-direction: column;
}

.filtro-group label {
  font-weight: 600;
  color: #5a5a5a;
  margin-bottom: 0.5rem;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
}

.filtro-select,
.filtro-busqueda {
  padding: clamp(0.5rem, 2vw, 0.6rem);
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  transition: border-color 0.3s;
}

.filtro-select:focus,
.filtro-busqueda:focus {
  outline: none;
  border-color: #a2d2ff;
}

/* ESTADÍSTICAS FLUIDAS */
.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
  gap: clamp(0.75rem, 2vw, 1rem);
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.estadistica-card {
  background: white;
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #ff6b95;
}

.estadistica-valor {
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 700;
  color: #ff6b95;
  margin-bottom: 0.5rem;
}

.estadistica-label {
  color: #666;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
}

/* ESTILOS GENERALES FLUIDOS */
.page-header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 4vw, 2rem) 0;
  text-align: center;
}

.page-header h2 {
  color: #5a5a5a;
  margin-bottom: 0.5rem;
  font-size: clamp(1.5rem, 5vw, 2rem);
}

.content-section {
  padding: clamp(1rem, 3vw, 2rem) 0;
}

.no-resultados {
  text-align: center;
  padding: clamp(1.5rem, 5vw, 3rem);
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin: clamp(1rem, 3vw, 2rem) 0;
}

.no-resultados p {
  margin-bottom: 1rem;
  font-size: clamp(1rem, 3vw, 1.1rem);
  color: #666;
}

/* AJUSTES PARA DISPOSITIVOS MUY PEQUEÑOS */
@media (max-width: 360px) {

  .page-numbers {
    order: -1;
  }

  .acciones-cell {
    flex-direction: column;
  }

  /* PAGINACIÓN FLUIDA MEJORADA */
  .pagination-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 1rem);
    margin: clamp(1rem, 3vw, 1.5rem) 0;
    padding: clamp(0.75rem, 2vw, 1rem);
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .pagination-info {
    color: #666;
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    font-weight: 500;
    order: 1;
  }

  .pagination-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.5rem, 2vw, 0.75rem);
    order: 3;
    width: 100%;
  }

  .pagination-nav {
    display: flex;
    gap: clamp(0.5rem, 2vw, 1rem);
    justify-content: center;
    width: 100%;
  }

  .page-numbers {
    display: flex;
    gap: clamp(0.1rem, 1vw, 0.25rem);
    justify-content: center;
    flex-wrap: wrap;
    margin: clamp(0.25rem, 1vw, 0.5rem) 0;
  }

  .btn-pagination {
    padding: clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.6rem, 1.5vw, 0.8rem);
    border: 1px solid #ddd;
    background: white;
    color: #5a5a5a;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: clamp(0.75rem, 1.8vw, 0.85rem);
    min-width: clamp(32px, 7vw, 38px);
    text-align: center;
    flex-shrink: 0;
  }

  .items-per-page {
    display: flex;
    align-items: center;
    gap: clamp(0.25rem, 1vw, 0.5rem);
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    order: 2;
  }

}
</style>