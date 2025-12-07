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
        <!-- Botón Crear Tratamiento (Solo Admin) -->
        <div class="admin-actions" v-if="isAdmin">
          <button class="btn btn-success" @click="mostrarModalCrear">
            <i class="fas fa-plus"></i> Crear Nuevo Tratamiento
          </button>
        </div>

        <!-- Filtros -->
        <div class="filtros-container">
          <div class="filtro-group">
            <label for="filtro-categoria">{{ $t('treatments.filterCategory') }}</label>
            <select id="filtro-categoria" v-model="filtroCategoria" class="filtro-select">
              <option value="">{{ $t('treatments.allCategories') }}</option>
              <option v-for="area in areasExistentes" :key="area.nom_area" :value="area.nom_area">
                {{ area.nom_area }}
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
            <div class="estadistica-valor">{{ areasExistentes.length }}</div>
            <div class="estadistica-label">{{ $t('treatments.categories') }}</div>
          </div>
          <div class="estadistica-card">
            <div class="estadistica-valor">${{ precioMinimo }} - ${{ precioMaximo }}</div>
            <div class="estadistica-label">{{ $t('treatments.priceRange') }}</div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="cargando" class="loading-state">
          <p>Cargando tratamientos...</p>
        </div>

        <!-- Estado sin resultados -->
        <div v-else-if="tratamientosFiltrados.length === 0" class="no-resultados">
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
                <th @click="ordenarPor('cod_trat')" class="sortable">
                  {{ $t('treatments.id') }}
                  <span v-if="ordenCampo === 'cod_trat'" class="sort-icon">
                    {{ ordenDireccion === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th @click="ordenarPor('nom_trat')" class="sortable">
                  {{ $t('treatments.name') }}
                  <span v-if="ordenCampo === 'nom_trat'" class="sort-icon">
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
              <tr v-for="tratamiento in tratamientosPaginados" :key="tratamiento.codigo_tratamiento">
                <td class="text-center">{{ tratamiento.codigo_tratamiento }}</td>
                <td>
                  <strong>{{ tratamiento.nombre_tratamiento }}</strong>
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
                  <button class="btn-warning btn-small" @click="mostrarModalActualizar(tratamiento)">
                    <i class="fas fa-edit"></i> Actualizar
                  </button>
                  <button class="btn-eliminar" @click="eliminarTratamiento(tratamiento)">
                    <i class="fas fa-trash"></i> Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA PARA CLIENTE (Tarjetas) -->
        <div v-else class="tarjetas-container">
          <div v-for="tratamiento in tratamientosPaginados" :key="tratamiento.codigo_tratamiento"
            class="tarjeta-tratamiento">
            <div class="contenido-tratamiento">
              <div class="tarjeta-header">
                <h3 class="tratamiento-nombre">{{ tratamiento.nombre_tratamiento }}</h3>
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
                <div class="info-item" v-if="tratamiento.frecuencia_mensual">
                  <span class="info-label">Frecuencia:</span>
                  <span class="info-value">{{ tratamiento.frecuencia_mensual }}/mes</span>
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

    <!-- Modal para Crear/Actualizar Tratamiento -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ esActualizacion ? 'Actualizar Tratamiento' : 'Crear Nuevo Tratamiento' }}</h3>
          <button class="btn-cerrar" @click="cerrarModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="esActualizacion ? actualizarTratamiento() : crearTratamiento()">
            <div class="form-grid">
              <div class="form-group" v-if="esActualizacion">
                <label for="codigo">Código del Tratamiento:</label>
                <input type="text" id="codigo" v-model="tratamientoForm.codigo_tratamiento" readonly class="form-input">
              </div>

              <div class="form-group">
                <label for="nombre">Nombre del Tratamiento *:</label>
                <input type="text" id="nombre" v-model="tratamientoForm.nombre_tratamiento" required class="form-input">
              </div>

              <div class="form-group">
                <label for="categoria">Categoría (Área) *:</label>
                <select id="categoria" v-model="tratamientoForm.categoria" required class="form-input">
                  <option value="">Seleccionar categoría</option>
                  <option v-for="area in areasExistentes" :key="area.nom_area" :value="area.nom_area">
                    {{ area.nom_area }} ({{ area.cantidad_personal_fijo }} personal)
                  </option>
                </select>
              </div>

              <!-- Sección para crear nueva área -->
              <div class="form-group full-width" v-if="mostrarCrearArea">
                <div class="nueva-area-section">
                  <h4>Crear Nueva Área</h4>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="nuevaAreaNombre">Nombre del Área *:</label>
                      <input type="text" id="nuevaAreaNombre" v-model="nuevaAreaForm.nombre_area" class="form-input"
                        placeholder="Ej: Masajes, Faciales, etc.">
                    </div>
                    <div class="form-group">
                      <label for="nuevaAreaPersonal">Personal Fijo *:</label>
                      <input type="number" id="nuevaAreaPersonal" v-model="nuevaAreaForm.cantidad_personal_fijo"
                        class="form-input" min="1" placeholder="Cantidad de personal">
                    </div>
                  </div>
                  <div class="area-actions">
                    <button type="button" @click="cancelarCrearArea" class="btn btn-secondary">Cancelar</button>
                    <button type="button" @click="crearNuevaArea" class="btn btn-success" :disabled="procesandoArea">
                      {{ procesandoArea ? 'Creando...' : 'Crear Área' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Botón para crear nueva área -->
              <div class="form-group full-width" v-else>
                <button type="button" @click="mostrarCrearArea = true" class="btn btn-outline">
                  + Crear Nueva Área
                </button>
                <small class="form-help">Si no encuentras el área adecuada, crea una nueva primero</small>
              </div>

              <div class="form-group full-width">
                <label for="descripcion">Descripción *:</label>
                <textarea id="descripcion" v-model="tratamientoForm.descripcion" required class="form-input" rows="3"
                  placeholder="Describe el tratamiento..."></textarea>
              </div>

              <div class="form-group">
                <label for="duracion">Duración (minutos) *:</label>
                <input type="number" id="duracion" v-model="tratamientoForm.duracion" required class="form-input"
                  min="5" placeholder="0">
              </div>

              <div class="form-group">
                <label for="precio">Precio ($) *:</label>
                <input type="number" id="precio" v-model="tratamientoForm.precio" required class="form-input" min="0"
                  step="0.01" placeholder="0.00">
              </div>

              <div class="form-group">
                <label for="frecuencia">Frecuencia Mensual:</label>
                <input type="number" id="frecuencia" v-model="tratamientoForm.frecuencia_mensual" class="form-input"
                  min="0" placeholder="Opcional">
              </div>

              <div class="form-group full-width">
                <label for="materiales">Materiales Necesarios:</label>
                <textarea id="materiales" v-model="tratamientoForm.materiales_necesarios" class="form-input" rows="3"
                  placeholder="Lista de materiales separados por coma (opcional)"></textarea>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="cerrarModal" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="procesando || !tratamientoForm.categoria">
                {{ procesando ? 'Procesando...' : (esActualizacion ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '../stores/appStore'
import { useRouter } from 'vue-router'

// URL base de tu API NestJS
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default {
  name: 'Tratamientos',
  setup() {
    const router = useRouter()
    const store = useAppStore()
    const tratamientos = ref([])
    const cargando = ref(false)

    // Roles - puedes obtener esto de tu sistema de autenticación
    const isCliente = ref(true) // Cambiar según tu lógica de auth
    const isAdmin = ref(true)   // Cambiar según tu lógica de auth

    // Variables de paginación
    const currentPage = ref(1)
    const itemsPerPage = ref(9)

    // Filtros y ordenamiento
    const filtroCategoria = ref('')
    const filtroPrecio = ref('')
    const busqueda = ref('')
    const ordenCampo = ref('codigo_tratamiento')
    const ordenDireccion = ref('asc')

    // Modal y formularios
    const mostrarModal = ref(false)
    const esActualizacion = ref(false)
    const procesando = ref(false)
    const tratamientoForm = ref({
      codigo_tratamiento: '',
      nombre_tratamiento: '',
      categoria: '',
      descripcion: '',
      duracion: 30,
      precio: 0,
      frecuencia_mensual: 0,
      materiales_necesarios: ''
    })

    // Gestión de áreas
    const areasExistentes = ref([])
    const mostrarCrearArea = ref(false)
    const procesandoArea = ref(false)
    const nuevaAreaForm = ref({
      nombre_area: '',
      cantidad_personal_fijo: 1
    })

    // Cargar tratamientos desde la API
    // En Tratamientos.vue - modifica cargarTratamientos
    // En la función cargarTratamientos - CORREGIR el mapeo
    const cargarTratamientos = async () => {
      cargando.value = true
      try {
        const response = await fetch(`${API_BASE_URL}/api/tratamientos`)
        console.log('📤 Response status:', response.status)

        if (response.ok) {
          const datos = await response.json()
          console.log('📥 Datos CRUDOS recibidos:', datos)

          // 🔄 CORRECCIÓN: Usar los nombres de campo que llegan del backend
          tratamientos.value = datos.map(item => ({
            codigo_tratamiento: item.cod_trat,
            nombre_tratamiento: item.nom_trat,
            categoria: item.categoria,
            descripcion: item.descripcion,
            duracion: Number(item.duracion) || 0,
            precio: Number(item.precio) || 0,
            frecuencia_mensual: item.frecuencia_mensual ? Number(item.frecuencia_mensual) : null,
            materiales_necesarios: item.materiales_necesarios || ''
          }))

          console.log('✅ Tratamientos transformados:', tratamientos.value)
        } else {
          console.error('❌ Error response:', await response.text())
        }
      } catch (error) {
        console.error('🔥 Error:', error)
      } finally {
        cargando.value = false
      }
    }

    // Cargar áreas existentes desde la API
    // En la función cargarAreas - CORREGIR también
    const cargarAreas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/areas`)
        if (response.ok) {
          const datos = await response.json()
          console.log('Respuesta cruda de áreas:', datos)

          // 🔄 SIMPLIFICAR: El backend parece devolver directamente el array
          if (Array.isArray(datos)) {
            // Si el backend devuelve un array directo
            areasExistentes.value = datos.map(area => ({
              nom_area: area.nom_area,
              cantidad_personal_fijo: area.cantidad_personal_fijo
            }))
          } else if (datos.obtener_areas && Array.isArray(datos.obtener_areas)) {
            // Si el backend devuelve { obtener_areas: [...] }
            areasExistentes.value = datos.obtener_areas.map(area => ({
              nom_area: area.nom_area,
              cantidad_personal_fijo: area.cantidad_personal_fijo
            }))
          } else {
            console.error('Formato de respuesta no reconocido:', datos)
            areasExistentes.value = []
          }

          console.log('Áreas procesadas:', areasExistentes.value)
        } else {
          console.error('Error al cargar áreas:', response.statusText)
          areasExistentes.value = []
        }
      } catch (error) {
        console.error('Error al conectar con el servidor para áreas:', error)
        areasExistentes.value = []
      }
    }

    // Crear nueva área
    const crearNuevaArea = async () => {
      if (!nuevaAreaForm.value.nom_area || !nuevaAreaForm.value.cantidad_personal_fijo) {
        alert('Por favor complete todos los campos del área')
        return
      }

      procesandoArea.value = true
      try {
        const response = await fetch(`${API_BASE_URL}/api/areas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nuevaAreaForm.value)
        })

        if (response.ok) {
          await cargarAreas()
          tratamientoForm.value.categoria = nuevaAreaForm.value.nom_area
          nuevaAreaForm.value = { nom_area: '', cantidad_personal_fijo: 1 }
          mostrarCrearArea.value = false
          alert('Área creada exitosamente')
        } else {
          const errorData = await response.json()
          alert(errorData.message || 'Error al crear el área')
        }
      } catch (error) {
        console.error('Error al crear área:', error)
        alert('Error al crear el área')
      } finally {
        procesandoArea.value = false
      }
    }

    const cancelarCrearArea = () => {
      mostrarCrearArea.value = false
      nuevaAreaForm.value = { nom_area: '', cantidad_personal_fijo: 1 }
    }

    // Crear tratamiento
    const crearTratamiento = async () => {
      if (!tratamientoForm.value.categoria) {
        alert('Por favor seleccione una categoría (área)')
        return
      }

      const areaExiste = areasExistentes.value.some(area => area.nom_area === tratamientoForm.value.categoria)
      if (!areaExiste) {
        alert('La categoría seleccionada no existe. Por favor seleccione una categoría válida.')
        return
      }

      procesando.value = true
      try {
        const tratamientoData = {
          ...tratamientoForm.value,
          duracion: parseInt(tratamientoForm.value.duracion),
          precio: parseFloat(tratamientoForm.value.precio),
          frecuencia_mensual: tratamientoForm.value.frecuencia_mensual ? parseInt(tratamientoForm.value.frecuencia_mensual) : null,
          materiales_necesarios: tratamientoForm.value.materiales_necesarios || null
        }

        console.log('Enviando datos del tratamiento:', tratamientoData)

        const response = await fetch(`${API_BASE_URL}/api/tratamientos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tratamientoData)
        })

        if (response.ok) {
          await cargarTratamientos()
          cerrarModal()
          alert('Tratamiento creado exitosamente')
        } else {
          const errorData = await response.json()
          alert(errorData.message || 'Error al crear el tratamiento')
        }
      } catch (error) {
        console.error('Error al crear tratamiento:', error)
        alert('Error al crear el tratamiento')
      } finally {
        procesando.value = false
      }
    }

    // Actualizar tratamiento
    const actualizarTratamiento = async () => {
      const areaExiste = areasExistentes.value.some(area => area.nom_area === tratamientoForm.value.categoria)
      if (!areaExiste) {
        alert('La categoría seleccionada no existe. Por favor seleccione una categoría válida.')
        return
      }

      procesando.value = true
      try {
        const tratamientoData = {
          ...tratamientoForm.value,
          duracion: parseInt(tratamientoForm.value.duracion),
          precio: parseFloat(tratamientoForm.value.precio),
          frecuencia_mensual: tratamientoForm.value.frecuencia_mensual ? parseInt(tratamientoForm.value.frecuencia_mensual) : null,
          materiales_necesarios: tratamientoForm.value.materiales_necesarios || null
        }

        console.log('Actualizando tratamiento:', tratamientoData)

        const response = await fetch(`${API_BASE_URL}/api/tratamientos/${tratamientoForm.value.cod_trat}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tratamientoData)
        })

        if (response.ok) {
          await cargarTratamientos()
          cerrarModal()
          alert('Tratamiento actualizado exitosamente')
        } else {
          const errorData = await response.json()
          alert(errorData.message || 'Error al actualizar el tratamiento')
        }
      } catch (error) {
        console.error('Error al actualizar tratamiento:', error)
        alert('Error al actualizar el tratamiento')
      } finally {
        procesando.value = false
      }
    }

    // Eliminar tratamiento
    const eliminarTratamiento = async (tratamiento) => {
      if (confirm(`¿Estás seguro de que quieres eliminar el tratamiento "${tratamiento.nom_trat}"?`)) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/tratamientos/${tratamiento.cod_trat}`, {
            method: 'DELETE'
          })

          if (response.ok) {
            await cargarTratamientos()
            alert('Tratamiento eliminado exitosamente')
          } else {
            alert('Error al eliminar el tratamiento')
          }
        } catch (error) {
          console.error('Error al eliminar tratamiento:', error)
          alert('Error al eliminar el tratamiento')
        }
      }
    }

    // Modal functions
    const mostrarModalCrear = () => {
      tratamientoForm.value = {
        cod_trat: '',
        nom_trat: '',
        categoria: '',
        descripcion: '',
        duracion: 30,
        precio: 0,
        frecuencia_mensual: 0,
        materiales_necesarios: ''
      }
      mostrarCrearArea.value = false
      esActualizacion.value = false
      mostrarModal.value = true
    }

    const mostrarModalActualizar = (tratamiento) => {
      tratamientoForm.value = {
        ...tratamiento,
        duracion: parseInt(tratamiento.duracion) || 0,
        precio: parseFloat(tratamiento.precio) || 0,
        frecuencia_mensual: parseInt(tratamiento.frecuencia_mensual) || 0
      }
      mostrarCrearArea.value = false
      esActualizacion.value = true
      mostrarModal.value = true
    }

    const cerrarModal = () => {
      mostrarModal.value = false
      mostrarCrearArea.value = false
      tratamientoForm.value = {
        cod_trat: '',
        nom_trat: '',
        categoria: '',
        descripcion: '',
        duracion: 30,
        precio: 0,
        frecuencia_mensual: 0,
        materiales_necesarios: ''
      }
      nuevaAreaForm.value = { nom_area: '', cantidad_personal_fijo: 1 }
    }

    // Computed properties
    const tratamientosFiltrados = computed(() => {
      let filtered = [...tratamientos.value]

      if (filtroCategoria.value) {
        filtered = filtered.filter(t => t.categoria === filtroCategoria.value)
      }

      if (filtroPrecio.value) {
        const [min, max] = filtroPrecio.value.split('-').map(Number)
        filtered = filtered.filter(t => t.precio >= min && t.precio <= max)
      }

      if (busqueda.value) {
        const searchTerm = busqueda.value.toLowerCase()
        filtered = filtered.filter(t =>
          t.nom_trat.toLowerCase().includes(searchTerm) ||
          t.descripcion.toLowerCase().includes(searchTerm)
        )
      }

      return filtered
    })

    const tratamientosFiltradosOrdenados = computed(() => {
      return [...tratamientosFiltrados.value].sort((a, b) => {
        let aValue = a[ordenCampo.value]
        let bValue = b[ordenCampo.value]

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

    const precioMinimo = computed(() => {
      if (tratamientos.value.length === 0) return 0
      return Math.min(...tratamientos.value.map(t => t.precio))
    })

    const precioMaximo = computed(() => {
      if (tratamientos.value.length === 0) return 0
      return Math.max(...tratamientos.value.map(t => t.precio))
    })

    // Pagination computed properties
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

    // Watchers
    watch([filtroCategoria, filtroPrecio, busqueda], () => {
      resetPagination()
    })

    // Métodos existentes
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
        'Especiales': '#d8b4fe',
        'Relajación': '#ffc8dd',
        'Belleza': '#cdb4db',
        'Spa': '#ffafcc'
      }
      return colores[categoria] || '#e0e0e0'
    }

    const limpiarFiltros = () => {
      filtroCategoria.value = ''
      filtroPrecio.value = ''
      busqueda.value = ''
      ordenCampo.value = 'codigo_tratamiento'
      ordenDireccion.value = 'asc'
      resetPagination()
    }

    // MODIFICADO: Pasar datos por ruta en lugar de usar store
    const irAReserva = (tratamiento) => {
      router.push({
        name: 'ReservarCita',
        query: {
          tratamiento: JSON.stringify(tratamiento)
        }
      })
    }

    onMounted(() => {
      console.log('Componente montado - Cargando datos...')
      cargarTratamientos()
      cargarAreas()
    })

    return {
      store,
      tratamientosPaginados,
      isCliente,
      isAdmin,
      cargando,
      filtroCategoria,
      filtroPrecio,
      busqueda,
      ordenCampo,
      ordenDireccion,
      areasExistentes,
      tratamientosFiltrados,
      precioMinimo,
      precioMaximo,
      mostrarModal,
      esActualizacion,
      tratamientoForm,
      procesando,
      mostrarCrearArea,
      nuevaAreaForm,
      procesandoArea,
      currentPage,
      itemsPerPage,
      totalPages,
      startItem,
      endItem,
      visiblePages,
      nextPage,
      previousPage,
      goToPage,
      resetPagination,
      ordenarPor,
      getColorCategoria,
      limpiarFiltros,
      irAReserva,
      mostrarModalCrear,
      mostrarModalActualizar,
      cerrarModal,
      crearTratamiento,
      actualizarTratamiento,
      eliminarTratamiento,
      crearNuevaArea,
      cancelarCrearArea
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

.btn-primary:hover {
  background: #e55a82;
  transform: translateY(-1px);
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
  border: none;
}

.btn-warning:hover {
  background: #e0a800;
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
  font-weight: 00;
  transition: all 0.3s;
}

.btn-eliminar:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 2px solid #ff6b95;
  color: #ff6b95;
}

.btn-outline:hover {
  background: #ff6b95;
  color: white;
}

.btn-small {
  padding: clamp(0.5rem, 1.5vw, 0.4rem) clamp(0.6rem, 2vw, 0.8rem);
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  border-radius: 5px;
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

.admin-actions {
  margin-bottom: 1.5rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

/* Estilos del Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  border-radius: 10px 10px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #5a5a5a;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #5a5a5a;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #5a5a5a;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
  resize: none;
}

.form-input:focus {
  outline: none;
  border-color: #a2d2ff;
}

.form-input:read-only {
  background-color: #f5f5f5;
  color: #666;
}

.form-help {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* Sección de nueva área */
.nueva-area-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin: 1rem 0;
}

.nueva-area-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
}

.area-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .area-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}

/* AJUSTES PARA DISPOSITIVOS MUY PEQUEÑOS */
@media (max-width: 360px) {
  .page-numbers {
    order: -1;
  }

  .acciones-cell {
    flex-direction: column;
  }

  .pagination-controls {
    flex-direction: column;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 1rem);
  }

  .pagination-info {
    order: 1;
  }

  .pagination-buttons {
    flex-direction: column;
    order: 3;
    width: 100%;
  }

  .page-numbers {
    margin: clamp(0.25rem, 1vw, 0.5rem) 0;
  }

  .items-per-page {
    order: 2;
  }
}
</style>