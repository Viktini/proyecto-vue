<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Nuestros Tratamientos</h2>
        <p>Descubre nuestra amplia gama de tratamientos especializados</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <!-- Filtros -->
        <div class="filtros-container">
          <div class="filtro-group">
            <label for="filtro-categoria">Filtrar por categoría:</label>
            <select id="filtro-categoria" v-model="filtroCategoria" class="filtro-select">
              <option value="">Todas las categorías</option>
              <option v-for="categoria in categorias" :key="categoria" :value="categoria">
                {{ categoria }}
              </option>
            </select>
          </div>

          <div class="filtro-group">
            <label for="filtro-precio">Filtrar por precio:</label>
            <select id="filtro-precio" v-model="filtroPrecio" class="filtro-select">
              <option value="">Todos los precios</option>
              <option value="0-30">$0 - $30</option>
              <option value="31-50">$31 - $50</option>
              <option value="51-100">$51 - $100</option>
            </select>
          </div>

          <div class="filtro-group">
            <label for="buscar-tratamiento">Buscar tratamiento:</label>
            <input type="text" id="buscar-tratamiento" v-model="busqueda"
              placeholder="Escribe el nombre del tratamiento..." class="filtro-busqueda">
          </div>
        </div>

        <!-- Estadísticas -->
        <div class="estadisticas">
          <div class="estadistica-card">
            <div class="estadistica-valor">{{ tratamientosFiltrados.length }}</div>
            <div class="estadistica-label">Tratamientos disponibles</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-valor">{{ categorias.length }}</div>
            <div class="estadistica-label">Categorías</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-valor">${{ precioMinimo }} - ${{ precioMaximo }}</div>
            <div class="estadistica-label">Rango de precios</div>
          </div>
        </div>

        <!-- Tabla de tratamientos -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="ordenarPor('id')" class="sortable">
                  ID
                  <span v-if="ordenCampo === 'id'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('nombre')" class="sortable">
                  Nombre
                  <span v-if="ordenCampo === 'nombre'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('categoria')" class="sortable">
                  Categoría
                  <span v-if="ordenCampo === 'categoria'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('duracion')" class="sortable">
                  Duración (min)
                  <span v-if="ordenCampo === 'duracion'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('precio')" class="sortable">
                  Precio
                  <span v-if="ordenCampo === 'precio'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th>Descripción</th>
                <th v-if="isCliente">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tratamiento in tratamientosFiltradosOrdenados" :key="tratamiento.id">
                <td class="text-center">{{ tratamiento.id }}</td>
                <td>
                  <strong>{{ tratamiento.nombre }}</strong>
                </td>
                <td>
                  <span class="categoria-tag" :style="{ backgroundColor: getColorCategoria(tratamiento.categoria) }">
                    {{ tratamiento.categoria }}
                  </span>
                </td>
                <td class="text-center">{{ tratamiento.duracion }}</td>
                <td class="text-center precio-cell">
                  <span class="precio">${{ tratamiento.precio }}</span>
                </td>
                <td class="descripcion-cell">
                  {{ tratamiento.descripcion }}
                </td>
                <td v-if="isCliente" class="text-center">
                  <router-link :to="{ name: 'ReservarCita', query: { tratamiento: tratamiento.id } }"
                    class="btn btn-primary btn-sm">
                    Reservar
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="tratamientosFiltrados.length === 0" class="no-resultados">
            <p>No se encontraron tratamientos que coincidan con los filtros aplicados.</p>
            <button @click="limpiarFiltros" class="btn btn-secondary">
              Limpiar filtros
            </button>
          </div>
        </div>

        <div class="action-buttons">
          <router-link v-if="isCliente" to="/reservar-cita" class="btn btn-primary">
            Reservar Cita
          </router-link>
          <router-link to="/home" class="btn btn-secondary">
            Volver al Inicio
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'

export default {
  name: 'Tratamientos',
  setup() {
    const store = useAppStore() // ← Cambiar

    const tratamientos = computed(() => store.tratamientos) // ← Acceso directo
    const isCliente = computed(() => store.isCliente)

    // Filtros y ordenamiento
    const filtroCategoria = ref('')
    const filtroPrecio = ref('')
    const busqueda = ref('')
    const ordenCampo = ref('id')
    const ordenDireccion = ref('asc')

    // Obtener categorías únicas
    const categorias = computed(() => {
      const categoriasUnicas = [...new Set(tratamientos.value.map(t => t.categoria))]
      return categoriasUnicas.sort()
    })

    // Estadísticas
    const precioMinimo = computed(() => {
      return Math.min(...tratamientos.value.map(t => t.precio))
    })

    const precioMaximo = computed(() => {
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
        'Corporales': '#caffbf'
      }
      return colores[categoria] || '#e0e0e0'
    }

    const limpiarFiltros = () => {
      filtroCategoria.value = ''
      filtroPrecio.value = ''
      busqueda.value = ''
      ordenCampo.value = 'id'
      ordenDireccion.value = 'asc'
    }

    onMounted(() => {
      // Cargar datos si es necesario
    })

    return {
      tratamientos: tratamientosFiltradosOrdenados,
      isCliente,
      filtroCategoria,
      filtroPrecio,
      busqueda,
      ordenCampo,
      ordenDireccion,
      categorias,
      tratamientosFiltrados,
      precioMinimo,
      precioMaximo,
      ordenarPor,
      getColorCategoria,
      limpiarFiltros
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

.filtros-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
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
  font-size: 0.9rem;
}

.filtro-select,
.filtro-busqueda {
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
}

.filtro-select:focus,
.filtro-busqueda:focus {
  outline: none;
  border-color: #a2d2ff;
}

.estadisticas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.estadistica-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #ff6b95;
}

.estadistica-valor {
  font-size: 2rem;
  font-weight: 700;
  color: #ff6b95;
  margin-bottom: 0.5rem;
}

.estadistica-label {
  color: #666;
  font-size: 0.9rem;
}

.table-container {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  color: #5a5a5a;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.sort-icon {
  margin-left: 0.5rem;
  font-weight: bold;
}

.text-center {
  text-align: center;
}

.categoria-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  color: #5a5a5a;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.precio-cell {
  font-weight: 600;
}

.precio {
  color: #ff6b95;
  font-size: 1.1rem;
}

.descripcion-cell {
  max-width: 300px;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
}

.no-resultados {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-resultados p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .filtros-container {
    grid-template-columns: 1fr;
  }

  .estadisticas {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-container {
    overflow-x: auto;
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
