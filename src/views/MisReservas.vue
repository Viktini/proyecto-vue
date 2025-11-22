<template>
    <div>
        <section class="page-header">
            <div class="container">
                <h2>{{ $t('myReservations.title') }}</h2>
                <p>{{ $t('myReservations.subtitle') }}</p>
            </div>
        </section>

        <section class="content-section">
            <div class="container">
                <div class="user-tabs">
                    <div class="tab-buttons">
                        <button @click="activeTab = 'citas'" :class="{ active: activeTab === 'citas' }" class="tab-btn">
                            {{ $t('myReservations.appointments') }}
                        </button>
                        <button @click="activeTab = 'paquetes'" :class="{ active: activeTab === 'paquetes' }"
                            class="tab-btn">
                            {{ $t('myReservations.packages') }}
                        </button>
                    </div>

                    <div class="tab-content">
                        <!-- Gestión de Citas -->
                        <div v-if="activeTab === 'citas'" class="tab-pane">
                            <h3>{{ $t('cancelAppointment.reservedAppointments') }}</h3>

                            <!-- Solo mostrar cuando hay citas -->
                            <div v-if="citasEncontradas.length > 0" class="citas-container">
                                <!-- Controles de paginación para citas -->
                                <div class="pagination-controls" v-if="citasTotalPages > 1">
                                    <div class="pagination-info">
                                        {{ $t('cancelAppointment.paginationInfo', {
                                            start: citasStartItem,
                                            end: citasEndItem,
                                            total: citasEncontradas.length
                                        }) }}
                                    </div>
                                    <div class="pagination-buttons">
                                        <button @click="citasPreviousPage" :disabled="citasCurrentPage === 1"
                                            class="btn-pagination">
                                            {{ $t('cancelAppointment.previous') }}
                                        </button>
                                        <div class="page-numbers">
                                            <button v-for="page in citasVisiblePages" :key="'citas-' + page"
                                                @click="citasGoToPage(page)" :class="{
                                                    'btn-pagination': true,
                                                    'active': page === citasCurrentPage,
                                                    'ellipsis': page === '...'
                                                }" :disabled="page === '...'">
                                                {{ page }}
                                            </button>
                                        </div>
                                        <button @click="citasNextPage" :disabled="citasCurrentPage === citasTotalPages"
                                            class="btn-pagination">
                                            {{ $t('cancelAppointment.next') }}
                                        </button>
                                    </div>
                                    <div class="items-per-page">
                                        <label for="citasItemsPerPage">{{ $t('cancelAppointment.show') }}:</label>
                                        <select id="citasItemsPerPage" v-model="citasItemsPerPage"
                                            @change="citasResetPagination">
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
                                                    <button @click="cancelarCita(cita.id)" class="btn-cancelar"
                                                        :disabled="cancelandoId === cita.id">
                                                        {{ cancelandoId === cita.id ? $t('cancelAppointment.canceling')
                                                            :
                                                            $t('cancelAppointment.cancelButton') }}
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <!-- Mostrar cuando no hay citas -->
                            <div v-else-if="citasBusquedaRealizada" class="no-appointments">
                                <div class="no-appointments-content">
                                    <div class="no-appointments-icon">📅</div>
                                    <h3>{{ $t('cancelAppointment.noAppointmentsTitle') }}</h3>
                                    <p>{{ $t('cancelAppointment.noAppointmentsMessage') }}</p>
                                    <router-link to="/reservar-cita" class="btn btn-primary">
                                        {{ $t('cancelAppointment.bookFirstAppointment') }}
                                    </router-link>
                                </div>
                            </div>

                            <!-- Mostrar mientras se cargan las citas -->
                            <div v-else class="loading">
                                <p>{{ $t('cancelAppointment.loading') }}</p>
                            </div>
                        </div>

                        <!-- Gestión de Paquetes -->
                        <div v-if="activeTab === 'paquetes'" class="tab-pane">
                            <h3>{{ $t('cancelPackage.reservedPackages') }}</h3>

                            <!-- Solo mostrar cuando hay paquetes -->
                            <div v-if="paquetesTotales.length > 0" class="paquetes-container">
                                <!-- Controles de paginación para paquetes -->
                                <div class="pagination-controls" v-if="paquetesTotalPages > 1">
                                    <div class="pagination-info">
                                        {{ $t('cancelPackage.paginationInfo', {
                                            start: paquetesStartItem,
                                            end: paquetesEndItem,
                                            total: paquetesTotales.length
                                        }) }}
                                    </div>
                                    <div class="pagination-buttons">
                                        <button @click="paquetesPreviousPage" :disabled="paquetesCurrentPage === 1"
                                            class="btn-pagination">
                                            {{ $t('cancelPackage.previous') }}
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
                                        <button @click="paquetesNextPage"
                                            :disabled="paquetesCurrentPage === paquetesTotalPages"
                                            class="btn-pagination">
                                            {{ $t('cancelPackage.next') }}
                                        </button>
                                    </div>
                                    <div class="items-per-page">
                                        <label for="paquetesItemsPerPage">{{ $t('cancelPackage.show') }}:</label>
                                        <select id="paquetesItemsPerPage" v-model="paquetesItemsPerPage"
                                            @change="paquetesResetPagination">
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="paquetes-grid">
                                    <div v-for="paquete in paquetesPaginados" :key="paquete.id" class="paquete-card"
                                        :class="{ seleccionado: paqueteSeleccionado === paquete.id }"
                                        @click="seleccionarPaquete(paquete.id)">
                                        <div class="paquete-header">
                                            <h4>{{ paquete.paquete }}</h4>
                                            <div class="paquete-id">{{ $t('cancelPackage.packageNumber', {
                                                number:
                                                    paquete.id
                                            }) }}</div>
                                        </div>
                                        <div class="paquete-body">
                                            <p><strong>{{ $t('cancelPackage.startDate') }}</strong> {{
                                                formatFecha(paquete.fechaInicio) }}</p>
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
                                    <button @click="cancelarPaquete" class="btn btn-danger"
                                        :disabled="!paqueteSeleccionado || cancelandoPaquete">
                                        {{ cancelandoPaquete ? $t('cancelPackage.canceling') :
                                            $t('cancelPackage.cancelSelected') }}
                                    </button>
                                </div>
                            </div>

                            <!-- Mostrar cuando no hay paquetes -->
                            <div v-else-if="paquetesBusquedaRealizada" class="no-packages">
                                <div class="no-packages-content">
                                    <div class="no-packages-icon">📦</div>
                                    <h3>{{ $t('cancelPackage.noPackagesTitle') }}</h3>
                                    <p>{{ $t('cancelPackage.noPackagesMessage') }}</p>
                                    <router-link to="/comprar-paquete" class="btn btn-primary">
                                        {{ $t('cancelPackage.buyFirstPackage') }}
                                    </router-link>
                                </div>
                            </div>

                            <!-- Mostrar mientras se cargan los paquetes -->
                            <div v-else class="loading">
                                <p>{{ $t('cancelPackage.loading') }}</p>
                            </div>
                        </div>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useI18n } from 'vue-i18n'

export default {
    name: 'CancelarGestion',
    setup() {
        const { t } = useI18n()
        const store = useAppStore()
        const activeTab = ref('citas')

        // Variables para citas
        const citasCurrentPage = ref(1)
        const citasItemsPerPage = ref(10)
        const citasEncontradas = ref([])
        const citasBusquedaRealizada = ref(false)
        const cancelandoId = ref(null)

        // Variables para paquetes
        const paquetesCurrentPage = ref(1)
        const paquetesItemsPerPage = ref(5)
        const paquetesTotales = ref([])
        const paquetesBusquedaRealizada = ref(false)
        const paqueteSeleccionado = ref(null)
        const cancelandoPaquete = ref(false)

        // Mensaje de resultado
        const resultado = ref(null)

        // Computed para paginación de citas
        const citasTotalPages = computed(() => {
            return Math.ceil(citasEncontradas.value.length / citasItemsPerPage.value)
        })

        const citasStartItem = computed(() => {
            return (citasCurrentPage.value - 1) * citasItemsPerPage.value + 1
        })

        const citasEndItem = computed(() => {
            const end = citasCurrentPage.value * citasItemsPerPage.value
            return end > citasEncontradas.value.length ? citasEncontradas.value.length : end
        })

        const citasPaginadas = computed(() => {
            const start = (citasCurrentPage.value - 1) * citasItemsPerPage.value
            const end = start + citasItemsPerPage.value
            return citasEncontradas.value.slice(start, end)
        })

        const citasVisiblePages = computed(() => {
            return getVisiblePages(citasCurrentPage.value, citasTotalPages.value)
        })

        // Computed para paginación de paquetes
        const paquetesTotalPages = computed(() => {
            return Math.ceil(paquetesTotales.value.length / paquetesItemsPerPage.value)
        })

        const paquetesStartItem = computed(() => {
            return (paquetesCurrentPage.value - 1) * paquetesItemsPerPage.value + 1
        })

        const paquetesEndItem = computed(() => {
            const end = paquetesCurrentPage.value * paquetesItemsPerPage.value
            return end > paquetesTotales.value.length ? paquetesTotales.value.length : end
        })

        const paquetesPaginados = computed(() => {
            const start = (paquetesCurrentPage.value - 1) * paquetesItemsPerPage.value
            const end = start + paquetesItemsPerPage.value
            return paquetesTotales.value.slice(start, end)
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

        // Métodos para cargar datos
        const cargarCitasDelUsuario = () => {
            const usuario = store.auth.user || {}
            const carnetUsuario = usuario.carnet

            if (!carnetUsuario) {
                mostrarResultado(t('cancelAppointment.errors.noUserCard'), 'error')
                citasBusquedaRealizada.value = true
                return
            }

            try {
                // Obtener todas las citas del usuario
                const citas = store.citasPorCarnet(carnetUsuario)

                // Filtrar solo las citas confirmadas para cancelar
                citasEncontradas.value = citas.filter(cita => cita.estado === 'Confirmada')
                citasBusquedaRealizada.value = true

                citasResetPagination()
            } catch (error) {
                mostrarResultado(t('cancelAppointment.errors.loadError'), 'error')
            }
        }

        const cargarPaquetesDelUsuario = () => {
            const usuario = store.auth.user || {}
            const carnetUsuario = usuario.carnet

            if (!carnetUsuario) {
                mostrarResultado(t('cancelPackage.errors.noUserCard'), 'error')
                paquetesBusquedaRealizada.value = true
                return
            }

            try {
                // Obtener todos los paquetes del usuario
                const paquetes = store.paquetesPorCarnet(carnetUsuario)

                // Filtrar solo los paquetes activos para cancelar
                paquetesTotales.value = paquetes.filter(paquete => paquete.estado === 'Activo')
                paquetesBusquedaRealizada.value = true

                paquetesResetPagination()
            } catch (error) {
                mostrarResultado(t('cancelPackage.errors.loadError'), 'error')
            }
        }

        // Métodos de acciones
        const cancelarCita = async (citaId) => {
            cancelandoId.value = citaId

            try {
                await store.cancelarCita(citaId)
                mostrarResultado(t('cancelAppointment.success'), 'exito')

                // Actualizar la lista completa
                citasEncontradas.value = citasEncontradas.value.filter(
                    cita => cita.id !== citaId
                )
                citasResetPagination()
            } catch (error) {
                console.error('Error al cancelar cita:', error)
                mostrarResultado(t('cancelAppointment.error'), 'error')
            } finally {
                cancelandoId.value = null
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

            cancelandoPaquete.value = true

            try {
                await store.cancelarPaquete(paqueteSeleccionado.value)
                mostrarResultado(t('cancelPackage.success'), 'exito')

                // Actualizar la lista
                paquetesTotales.value = paquetesTotales.value.filter(
                    paquete => paquete.id !== paqueteSeleccionado.value
                )
                paqueteSeleccionado.value = null
                paquetesResetPagination()
            } catch (error) {
                mostrarResultado(t('cancelPackage.error'), 'error')
            } finally {
                cancelandoPaquete.value = false
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

        // Watchers para cargar datos cuando cambia la pestaña
        watch(activeTab, (newTab) => {
            if (newTab === 'citas' && citasEncontradas.value.length === 0) {
                cargarCitasDelUsuario()
            } else if (newTab === 'paquetes' && paquetesTotales.value.length === 0) {
                cargarPaquetesDelUsuario()
            }
        })

        // Cargar datos iniciales
        onMounted(() => {
            cargarCitasDelUsuario()
        })

        return {
            activeTab,
            // Variables para citas
            citasEncontradas,
            citasPaginadas,
            citasBusquedaRealizada,
            cancelandoId,
            // Variables para paquetes
            paquetesTotales,
            paquetesPaginados,
            paquetesBusquedaRealizada,
            paqueteSeleccionado,
            cancelandoPaquete,
            // Variables de resultado
            resultado,
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
            // Métodos de acciones
            cancelarCita,
            seleccionarPaquete,
            cancelarPaquete,
            formatFecha,
            t
        }
    }
}
</script>

<style scoped>
.user-tabs {
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.tab-buttons {
    display: flex;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    flex-wrap: wrap;
}

.tab-btn {
    padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 600;
    color: #6c757d;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    flex: 1;
    min-width: min(150px, 100%);
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
    padding: clamp(1rem, 3vw, 2rem);
}

.tab-pane h3 {
    margin-bottom: clamp(1rem, 3vw, 1.5rem);
    color: #5a5a5a;
    font-size: clamp(1.1rem, 3vw, 1.3rem);
}

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

/* ESTILOS PARA CITAS */
.citas-container {
    background: white;
    padding: clamp(1rem, 3vw, 2rem);
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    margin-bottom: clamp(1rem, 3vw, 2rem);
}

.table-container {
    overflow-x: auto;
    margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    min-width: min(600px, 100%);
}

.data-table th,
.data-table td {
    padding: clamp(0.6rem, 2vw, 1rem);
    text-align: left;
    border-bottom: 1px solid #eee;
    font-size: clamp(0.8rem, 2vw, 0.9rem);
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

.btn-cancelar {
    padding: clamp(0.3rem, 1.5vw, 0.4rem) clamp(0.6rem, 2vw, 0.8rem);
    background: #ff6b95;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: clamp(0.75rem, 2vw, 0.8rem);
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
    min-width: max-content;
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

/* ESTILOS PARA PAQUETES */
.paquetes-container {
    background: white;
    padding: clamp(1rem, 3vw, 2rem);
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    margin-bottom: clamp(1rem, 3vw, 2rem);
}

.paquetes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
    gap: clamp(1rem, 3vw, 1.5rem);
    margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.paquete-card {
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 10px;
    padding: clamp(1rem, 3vw, 1.5rem);
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
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
    padding-bottom: clamp(0.75rem, 2vw, 1rem);
    border-bottom: 1px solid #dee2e6;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.paquete-header h4 {
    color: #5a5a5a;
    margin: 0;
    flex: 1;
    font-size: clamp(1rem, 3vw, 1.1rem);
}

.paquete-id {
    background: #a2d2ff;
    color: white;
    padding: clamp(0.2rem, 1vw, 0.25rem) clamp(0.4rem, 1.5vw, 0.5rem);
    border-radius: 15px;
    font-size: clamp(0.75rem, 2vw, 0.875rem);
    font-weight: 600;
}

.paquete-body p {
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
    color: #666;
    font-size: clamp(0.85rem, 2.5vw, 0.9rem);
}

.paquete-tratamientos h5 {
    margin-bottom: 0.5rem;
    color: #5a5a5a;
    font-size: clamp(0.85rem, 2.5vw, 0.9rem);
}

.paquete-tratamientos ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.paquete-tratamientos li {
    padding: 0.25rem 0;
    font-size: clamp(0.8rem, 2vw, 0.875rem);
    color: #666;
    border-bottom: 1px solid #eee;
}

.paquete-tratamientos li:last-child {
    border-bottom: none;
}

.paquete-estado {
    margin-top: clamp(0.75rem, 2vw, 1rem);
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

.action-buttons {
    display: flex;
    justify-content: center;
    margin-top: clamp(1rem, 3vw, 2rem);
}

.btn {
    padding: clamp(0.6rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    min-width: max-content;
}

.btn-primary {
    background: #a2d2ff;
    color: white;
}

.btn-primary:hover {
    background: #8bc1ff;
}

.btn-danger {
    background: #ff6b95;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #ff4d7a;
}

.btn-danger:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
}

/* ESTILOS PARA CUANDO NO HAY DATOS */
.no-appointments,
.no-packages {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: min(300px, 50vh);
    background: white;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    padding: clamp(1rem, 3vw, 2rem);
}

.no-appointments-content,
.no-packages-content {
    text-align: center;
    max-width: min(400px, 90vw);
}

.no-appointments-icon,
.no-packages-icon {
    font-size: clamp(2.5rem, 10vw, 4rem);
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
}

.no-appointments h3,
.no-packages h3 {
    color: #5a5a5a;
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
    font-size: clamp(1.1rem, 3vw, 1.3rem);
}

.no-appointments p,
.no-packages p {
    color: #666;
    margin-bottom: clamp(1rem, 3vw, 2rem);
    line-height: 1.5;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.loading {
    text-align: center;
    padding: clamp(1rem, 3vw, 2rem);
    color: #666;
    font-style: italic;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
}

/* MENSAJE DE RESULTADO */
.resultado-message {
    padding: clamp(0.75rem, 2vw, 1rem);
    border-radius: 5px;
    margin-top: clamp(0.75rem, 2vw, 1rem);
    text-align: center;
    font-size: clamp(0.9rem, 2.5vw, 1rem);
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

/* ESTILOS GENERALES */
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

/* AJUSTES PARA DISPOSITIVOS MUY PEQUEÑOS */
@media (max-width: 360px) {
    .tab-buttons {
        flex-direction: column;
    }

    .tab-btn {
        min-width: 100%;
    }

    .paquete-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .paquete-id {
        align-self: flex-start;
    }
}
</style>