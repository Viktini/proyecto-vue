<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Panel de Administración</h2>
        <p>Gestión de citas y paquetes</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="admin-tabs">
          <div class="tab-buttons">
            <button @click="activeTab = 'citas'" :class="{ active: activeTab === 'citas' }" class="tab-btn">
              Gestión de Citas
            </button>
            <button @click="activeTab = 'paquetes'" :class="{ active: activeTab === 'paquetes' }" class="tab-btn">
              Gestión de Paquetes
            </button>
          </div>

          <div class="tab-content">
            <!-- Gestión de Citas -->
            <div v-if="activeTab === 'citas'" class="tab-pane">
              <h3>Citas Reservadas</h3>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Carnet</th>
                      <th>Teléfono</th>
                      <th>Tratamiento</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cita in citas" :key="cita.id">
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
                          Cancelar
                        </button>
                        <span v-else class="text-muted">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="citas.length === 0" class="no-data">
                  No hay citas reservadas
                </div>
              </div>
            </div>

            <!-- Gestión de Paquetes -->
            <div v-if="activeTab === 'paquetes'" class="tab-pane">
              <h3>Paquetes Comprados</h3>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Carnet</th>
                      <th>Teléfono</th>
                      <th>Paquete</th>
                      <th>Tratamientos</th>
                      <th>Fecha Inicio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="paquete in paquetesComprados" :key="paquete.id">
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
                          Cancelar
                        </button>
                        <span v-else class="text-muted">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="paquetesComprados.length === 0" class="no-data">
                  No hay paquetes comprados
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
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores'

export default {
  name: 'AdminDashboard',
  setup() {
    const store = useAppStore() // ← Cambiar
    const activeTab = ref('citas')

    const citas = computed(() => store.citas) // ← Acceso directo al state
    const paquetesComprados = computed(() => store.paquetesComprados)

    const cancelarCita = (id) => {
      if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
        store.cancelarCita(id) // ← Sin dispatch
      }
    }

    const cancelarPaquete = (id) => {
      if (confirm('¿Está seguro de que desea cancelar este paquete?')) {
        store.cancelarPaquete(id) // ← Sin dispatch
      }
    }

    return {
      activeTab,
      citas,
      paquetesComprados,
      cancelarCita,
      cancelarPaquete
    }
  }
}
</script>

<style scoped>
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
</style>
