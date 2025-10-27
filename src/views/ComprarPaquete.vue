<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Comprar Paquete</h2>
        <p>Seleccione un paquete predefinido o personalice el suyo</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <form @submit.prevent="handleSubmit" class="form">
          <!-- Datos Personales -->
          <div class="form-section">
            <h3>Datos Personales</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="nombre-paquete">Nombre Completo *</label>
                <input type="text" id="nombre-paquete" v-model="formData.nombre" :class="{ error: fieldErrors.nombre }"
                  placeholder="Solo letras (sin números ni símbolos)" @blur="validateField('nombre')">
                <span v-if="fieldErrors.nombre" class="error-message">{{ fieldErrors.nombre }}</span>
              </div>

              <div class="form-group">
                <label for="carnet-paquete">Carnet de Identidad *</label>
                <input type="text" id="carnet-paquete" v-model="formData.carnet" :class="{ error: fieldErrors.carnet }"
                  placeholder="Solo números (máximo once dígitos)" maxlength="11" @blur="validateField('carnet')">
                <span v-if="fieldErrors.carnet" class="error-message">{{ fieldErrors.carnet }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="telefono-paquete">Teléfono *</label>
                <input type="tel" id="telefono-paquete" v-model="formData.telefono"
                  :class="{ error: fieldErrors.telefono }" placeholder="8 dígitos" maxlength="8"
                  @blur="validateField('telefono')">
                <span v-if="fieldErrors.telefono" class="error-message">{{ fieldErrors.telefono }}</span>
              </div>

              <div class="form-group">
                <label for="email-paquete">Email *</label>
                <input type="email" id="email-paquete" v-model="formData.email" :class="{ error: fieldErrors.email }"
                  placeholder="usuario@gmail.com" @blur="validateField('email')">
                <span v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</span>
              </div>
            </div>
          </div>

          <!-- Selección de Paquete -->
          <div class="form-section">
            <h3>Selección de Paquete</h3>
            <div class="form-group">
              <label for="tipo-paquete">Tipo de Paquete *</label>
              <select id="tipo-paquete" v-model="formData.tipoPaquete" :class="{ error: fieldErrors.tipoPaquete }"
                @change="onTipoPaqueteChange">
                <option value="">Seleccione una opción</option>
                <option value="predefinido">Paquete Predefinido</option>
                <option value="personalizado">Paquete Personalizado</option>
              </select>
              <span v-if="fieldErrors.tipoPaquete" class="error-message">{{ fieldErrors.tipoPaquete }}</span>
            </div>

            <!-- Paquete Predefinido -->
            <div v-if="formData.tipoPaquete === 'predefinido'" class="form-group">
              <label for="paquete">Paquete *</label>
              <select id="paquete" v-model="formData.paqueteSeleccionado"
                :class="{ error: fieldErrors.paqueteSeleccionado }" @change="validateField('paqueteSeleccionado')">
                <option value="">Seleccione un paquete</option>
                <option v-for="paquete in paquetes" :key="paquete.id" :value="paquete">
                  {{ paquete.nombre }} - ${{ paquete.precio }}
                </option>
              </select>
              <span v-if="fieldErrors.paqueteSeleccionado" class="error-message">{{ fieldErrors.paqueteSeleccionado
              }}</span>

              <!-- Información del Paquete Seleccionado -->
              <div v-if="formData.paqueteSeleccionado" class="paquete-info">
                <h4>{{ formData.paqueteSeleccionado.nombre }}</h4>
                <p>{{ formData.paqueteSeleccionado.descripcion }}</p>
                <div class="tratamientos-lista">
                  <h5>Tratamientos incluidos:</h5>
                  <ul>
                    <li v-for="tratamientoId in formData.paqueteSeleccionado.tratamientos" :key="tratamientoId">
                      {{ getTratamientoNombre(tratamientoId) }}
                    </li>
                  </ul>
                </div>
                <div class="precio-total">
                  <strong>Precio total: ${{ formData.paqueteSeleccionado.precio }}</strong>
                </div>
              </div>
            </div>

            <!-- Paquete Personalizado -->
            <div v-if="formData.tipoPaquete === 'personalizado'" class="form-group">
              <label>Seleccione los tratamientos para su paquete personalizado *</label>
              <div class="checkbox-group">
                <div v-for="tratamiento in tratamientos" :key="tratamiento.id" class="checkbox-item">
                  <input type="checkbox" :id="`tratamiento-${tratamiento.id}`" :value="tratamiento.id"
                    v-model="formData.tratamientosPersonalizados">
                  <label :for="`tratamiento-${tratamiento.id}`">
                    {{ tratamiento.nombre }} - ${{ tratamiento.precio }} ({{ tratamiento.duracion }} min)
                  </label>
                </div>
              </div>
              <span v-if="fieldErrors.tratamientosPersonalizados" class="error-message">{{
                fieldErrors.tratamientosPersonalizados }}</span>

              <!-- Resumen Paquete Personalizado -->
              <div v-if="formData.tratamientosPersonalizados.length > 0" class="paquete-personalizado-info">
                <h4>Su Paquete Personalizado</h4>
                <div class="tratamientos-lista">
                  <h5>Tratamientos seleccionados:</h5>
                  <ul>
                    <li v-for="tratamientoId in formData.tratamientosPersonalizados" :key="tratamientoId">
                      {{ getTratamientoNombre(tratamientoId) }} - ${{ getTratamientoPrecio(tratamientoId) }}
                    </li>
                  </ul>
                </div>
                <div class="precio-total">
                  <strong>Precio total: ${{ calcularPrecioTotal() }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Fecha de Inicio -->
          <div class="form-section">
            <h3>Programación</h3>
            <div class="form-group">
              <label for="fecha-inicio">Fecha de Inicio *</label>
              <input type="date" id="fecha-inicio" v-model="formData.fechaInicio"
                :class="{ error: fieldErrors.fechaInicio }" :min="minDate" @change="validateField('fechaInicio')">
              <span v-if="fieldErrors.fechaInicio" class="error-message">{{ fieldErrors.fechaInicio }}</span>
            </div>

            <div class="form-group">
              <label class="label-fecha">
                ATENCIÓN: La reservación se debe de hacer a partir de un día de antelación
              </label>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="form-section">
            <div class="form-group">
              <label for="observaciones-paquete">Observaciones o Preferencias</label>
              <textarea id="observaciones-paquete" v-model="formData.observaciones" rows="3"
                placeholder="Indique cualquier preferencia especial o observación..."></textarea>
            </div>
          </div>

          <!-- Acciones -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Procesando...' : 'Comprar Paquete' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              Cancelar
            </button>
          </div>
        </form>

        <div v-if="resultado" class="resultado" :class="resultado.tipo">
          <h3>{{ resultado.titulo }}</h3>
          <p>{{ resultado.mensaje }}</p>
          <div v-if="resultado.detalles" class="detalles-compra">
            <h4>Detalles de su compra:</h4>
            <ul>
              <li><strong>Número de compra:</strong> {{ resultado.detalles.id }}</li>
              <li><strong>Nombre:</strong> {{ resultado.detalles.nombre }}</li>
              <li><strong>Paquete:</strong> {{ resultado.detalles.paquete }}</li>
              <li><strong>Tratamientos:</strong> {{ resultado.detalles.tratamientos.join(', ') }}</li>
              <li><strong>Fecha de inicio:</strong> {{ resultado.detalles.fechaInicio }}</li>
              <li><strong>Estado:</strong> {{ resultado.detalles.estado }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { validators } from '../utils/validators'

export default {
  name: 'ComprarPaquete',
  setup() {
    const store = useAppStore()

    const formData = ref({
      nombre: '',
      carnet: '',
      telefono: '',
      email: '',
      tipoPaquete: '',
      paqueteSeleccionado: null,
      tratamientosPersonalizados: [],
      fechaInicio: '',
      observaciones: ''
    })

    const fieldErrors = ref({})
    const resultado = ref(null)
    const loading = ref(false)

    const tratamientos = computed(() => store.tratamientos) // ← Acceso directo
    const paquetes = computed(() => store.paquetes)

    const minDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const validateField = (field) => {
      const value = formData.value[field]
      let isValid = true
      let message = ''

      switch (field) {
        case 'nombre':
          isValid = validators.nombre(value)
          message = isValid ? '' : 'Solo se permiten letras y espacios'
          break
        case 'carnet':
          isValid = validators.carnet(value)
          message = isValid ? '' : 'Solo números (máximo 11 dígitos)'
          break
        case 'telefono':
          isValid = validators.telefono(value)
          message = isValid ? '' : 'Debe tener exactamente 8 dígitos'
          break
        case 'email':
          isValid = validators.email(value)
          message = isValid ? '' : 'Debe ser un email válido de Gmail'
          break
        case 'tipoPaquete':
          isValid = validators.select(value)
          message = isValid ? '' : 'Seleccione un tipo de paquete'
          break
        case 'paqueteSeleccionado':
          isValid = formData.value.tipoPaquete !== 'predefinido' || value !== null
          message = isValid ? '' : 'Seleccione un paquete predefinido'
          break
        case 'tratamientosPersonalizados':
          isValid = formData.value.tipoPaquete !== 'personalizado' || value.length > 0
          message = isValid ? '' : 'Seleccione al menos un tratamiento'
          break
        case 'fechaInicio':
          isValid = validators.fecha(value) && validators.validarDiaDescanso(value)
          message = isValid ? '' : 'Fecha inválida o domingo (cerrado)'
          break
      }

      if (isValid) {
        delete fieldErrors.value[field]
      } else {
        fieldErrors.value[field] = message
      }

      return isValid
    }

    const validateForm = () => {
      const baseFields = ['nombre', 'carnet', 'telefono', 'email', 'tipoPaquete', 'fechaInicio']
      baseFields.forEach(field => validateField(field))

      if (formData.value.tipoPaquete === 'predefinido') {
        validateField('paqueteSeleccionado')
      } else if (formData.value.tipoPaquete === 'personalizado') {
        validateField('tratamientosPersonalizados')
      }

      return Object.keys(fieldErrors.value).length === 0
    }

    const onTipoPaqueteChange = () => {
      // Limpiar selecciones anteriores al cambiar tipo
      formData.value.paqueteSeleccionado = null
      formData.value.tratamientosPersonalizados = []
    }

    const getTratamientoNombre = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.nombre : 'Tratamiento no encontrado'
    }

    const getTratamientoPrecio = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.precio : 0
    }

    const calcularPrecioTotal = () => {
      return formData.value.tratamientosPersonalizados.reduce((total, tratamientoId) => {
        return total + getTratamientoPrecio(tratamientoId)
      }, 0)
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        resultado.value = {
          tipo: 'error',
          titulo: 'Error de Validación',
          mensaje: 'Por favor, corrija los errores en el formulario.'
        }
        return
      }

      loading.value = true

      try {
        let paqueteData

        if (formData.value.tipoPaquete === 'predefinido') {
          paqueteData = {
            nombre: formData.value.nombre,
            carnet: formData.value.carnet,
            telefono: formData.value.telefono,
            paquete: formData.value.paqueteSeleccionado.nombre,
            tratamientos: formData.value.paqueteSeleccionado.tratamientos.map(id => getTratamientoNombre(id)),
            fechaInicio: formData.value.fechaInicio,
            observaciones: formData.value.observaciones
          }
        } else {
          paqueteData = {
            nombre: formData.value.nombre,
            carnet: formData.value.carnet,
            telefono: formData.value.telefono,
            paquete: 'Paquete Personalizado',
            tratamientos: formData.value.tratamientosPersonalizados.map(id => getTratamientoNombre(id)),
            fechaInicio: formData.value.fechaInicio,
            observaciones: formData.value.observaciones
          }
        }

        const compra = await store.comprarPaquete(paqueteData) // ← Sin dispatch

        resultado.value = {
          tipo: 'exito',
          titulo: '¡Paquete Comprado Exitosamente!',
          mensaje: 'Su paquete ha sido activado. Recibirá un email de confirmación.',
          detalles: compra
        }

        resetForm()
      } catch (error) {
        resultado.value = {
          tipo: 'error',
          titulo: 'Error al Comprar',
          mensaje: 'Ha ocurrido un error al procesar su compra. Por favor, intente nuevamente.'
        }
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      formData.value = {
        nombre: '',
        carnet: '',
        telefono: '',
        email: '',
        tipoPaquete: '',
        paqueteSeleccionado: null,
        tratamientosPersonalizados: [],
        fechaInicio: minDate.value,
        observaciones: ''
      }
      fieldErrors.value = {}
    }

    onMounted(() => {
      // Inicializar fecha mínima
      formData.value.fechaInicio = minDate.value
    })

    return {
      formData,
      fieldErrors,
      resultado,
      loading,
      tratamientos,
      paquetes,
      minDate,
      validateField,
      onTipoPaqueteChange,
      getTratamientoNombre,
      getTratamientoPrecio,
      calcularPrecioTotal,
      handleSubmit,
      resetForm
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

.form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  color: #5a5a5a;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5a5a5a;
}

.label-fecha {
  font-weight: 400 !important;
  color: #666 !important;
  font-size: 0.9rem;
  font-style: italic;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #a2d2ff;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.checkbox-item:hover {
  background: #e9ecef;
}

.checkbox-item input {
  width: auto;
  margin-right: 0.5rem;
}

.paquete-info,
.paquete-personalizado-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #a2d2ff;
}

.paquete-info h4,
.paquete-personalizado-info h4 {
  color: #5a5a5a;
  margin-bottom: 0.5rem;
}

.tratamientos-lista h5 {
  margin: 1rem 0 0.5rem 0;
  color: #5a5a5a;
  font-size: 0.9rem;
}

.tratamientos-lista ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tratamientos-lista li {
  padding: 0.25rem 0;
  border-bottom: 1px solid #eee;
  font-size: 0.875rem;
}

.tratamientos-lista li:last-child {
  border-bottom: none;
}

.precio-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #dee2e6;
  text-align: right;
  color: #ff6b95;
  font-size: 1.1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.detalles-compra {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
}

.detalles-compra h4 {
  margin-bottom: 1rem;
  color: #5a5a5a;
}

.detalles-compra ul {
  list-style: none;
  padding: 0;
}

.detalles-compra li {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
