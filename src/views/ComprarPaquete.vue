<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('buyPackage.title') }}</h2>
        <p>{{ $t('buyPackage.subtitle') }}</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <form @submit.prevent="handleSubmit" class="form">
          <!-- Solo mostrar Selección de Paquete -->
          <div class="form-section">
            <h3>{{ $t('buyPackage.packageSelection') }}</h3>
            <div class="form-group">
              <label for="tipo-paquete">{{ $t('buyPackage.packageType') }}</label>
              <select id="tipo-paquete" v-model="formData.tipoPaquete" :class="{ error: fieldErrors.tipoPaquete }"
                @change="onTipoPaqueteChange">
                <option value="">{{ $t('buyPackage.selectOption') }}</option>
                <option value="predefinido">{{ $t('buyPackage.predefined') }}</option>
                <option value="personalizado">{{ $t('buyPackage.personalized') }}</option>
              </select>
              <span v-if="fieldErrors.tipoPaquete" class="error-message">{{ fieldErrors.tipoPaquete }}</span>
            </div>

            <!-- Paquete Predefinido -->
            <div v-if="formData.tipoPaquete === 'predefinido'" class="form-group">
              <label for="paquete">{{ $t('buyPackage.package') }}</label>
              <select id="paquete" v-model="formData.paqueteSeleccionado"
                :class="{ error: fieldErrors.paqueteSeleccionado }" @change="validateField('paqueteSeleccionado')">
                <option value="">{{ $t('buyPackage.selectPackage') }}</option>
                <option v-for="paquete in paquetes" :key="paquete.id" :value="paquete">
                  {{ paquete.nombre }} - ${{ paquete.precio }} ({{ calcularDuracionTotal(paquete.tratamientos) }} min)
                </option>
              </select>
              <span v-if="fieldErrors.paqueteSeleccionado" class="error-message">{{ fieldErrors.paqueteSeleccionado
              }}</span>

              <!-- Información del Paquete Seleccionado -->
              <div v-if="formData.paqueteSeleccionado" class="paquete-info">
                <h4>{{ formData.paqueteSeleccionado.nombre }}</h4>
                <p>{{ formData.paqueteSeleccionado.descripcion }}</p>
                <div class="tratamientos-lista">
                  <h5>{{ $t('packages.includedTreatments') }}</h5>
                  <ul>
                    <li v-for="tratamientoId in formData.paqueteSeleccionado.tratamientos" :key="tratamientoId">
                      {{ getTratamientoNombre(tratamientoId) }} ({{ getTratamientoDuracion(tratamientoId) }} min)
                    </li>
                  </ul>
                </div>
                <div class="precio-total">
                  <strong>{{ $t('buyPackage.totalPrice', { amount: formData.paqueteSeleccionado.precio }) }}</strong>
                  <br>
                  <strong>{{ $t('buyPackage.totalDuration', {
                    minutes:
                      calcularDuracionTotal(formData.paqueteSeleccionado.tratamientos)
                  }) }}</strong>
                </div>
              </div>
            </div>

            <!-- Paquete Personalizado -->
            <div v-if="formData.tipoPaquete === 'personalizado'" class="form-group">
              <label>{{ $t('buyPackage.selectTreatments') }}</label>
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
                <h4>{{ $t('buyPackage.yourPersonalizedPackage') }}</h4>
                <div class="tratamientos-lista">
                  <h5>{{ $t('buyPackage.selectedTreatments') }}</h5>
                  <ul>
                    <li v-for="tratamientoId in formData.tratamientosPersonalizados" :key="tratamientoId">
                      {{ getTratamientoNombre(tratamientoId) }} - ${{ getTratamientoPrecio(tratamientoId) }} ({{
                        getTratamientoDuracion(tratamientoId) }} min)
                    </li>
                  </ul>
                </div>
                <div class="precio-total">
                  <strong>{{ $t('buyPackage.totalPrice', { amount: calcularPrecioTotal() }) }}</strong>
                  <br>
                  <strong>{{ $t('buyPackage.totalDuration', { minutes: calcularDuracionTotalPersonalizado() })
                  }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Fecha-->
          <div class="form-section">
            <h3>{{ $t('buyPackage.scheduling') }}</h3>
            <div class="form-group">
              <label for="fecha">{{ $t('buyPackage.Date') }}</label>
              <input type="date" id="fecha" v-model="formData.fecha" :class="{ error: fieldErrors.fecha }"
                :min="minDate" @change="validateField('fecha')">
              <span v-if="fieldErrors.fecha" class="error-message">{{ fieldErrors.fecha }}</span>
            </div>

            <div class="form-group">
              <label class="label-fecha">
                {{ $t('buyPackage.attention') }}
              </label>
            </div>
          </div>

          <!-- Acciones -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? $t('buyPackage.processing') : $t('buyPackage.buy') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              {{ $t('buyPackage.cancel') }}
            </button>
          </div>
        </form>

        <div v-if="resultado" class="resultado" :class="resultado.tipo">
          <h3>{{ resultado.titulo }}</h3>
          <p>{{ resultado.mensaje }}</p>
          <div v-if="resultado.detalles" class="detalles-compra">
            <h4>{{ $t('buyPackage.purchaseDetails') }}</h4>
            <ul>
              <li><strong>{{ $t('buyPackage.purchaseNumber') }}</strong> {{ resultado.detalles.id }}</li>
              <li><strong>{{ $t('buyPackage.name') }}</strong> {{ resultado.detalles.nombre }}</li>
              <li><strong>{{ $t('buyPackage.packageName') }}</strong> {{ resultado.detalles.paquete }}</li>
              <li><strong>{{ $t('buyPackage.treatments') }}</strong> {{ resultado.detalles.tratamientos.join(', ') }}
              </li>
              <li><strong>{{ $t('buyPackage.startDateDetail') }}</strong> {{ resultado.detalles.fechaInicio }}</li>
              <li><strong>{{ $t('buyPackage.price') }}</strong> ${{ resultado.detalles.precio }}</li>
              <li><strong>{{ $t('buyPackage.status') }}</strong> {{ resultado.detalles.estado }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { validators } from '../utils/validators'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ComprarPaquete',
  setup() {
    const { t } = useI18n()
    const store = useAppStore()

    const formData = ref({
      tipoPaquete: store.tipoPaqueteSeleccionado || '',
      paqueteSeleccionado: store.paqueteSeleccionado || null,
      tratamientosPersonalizados: [],
      fecha: ''
    })

    const fieldErrors = ref({})
    const resultado = ref(null)
    const loading = ref(false)

    const tratamientos = computed(() => store.tratamientos || [])
    const paquetes = computed(() => store.paquetes || [])

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
        case 'tipoPaquete':
          isValid = validators.select(value)
          message = isValid ? '' : t('buyPackage.validation.selectPackageType')
          break
        case 'paqueteSeleccionado':
          isValid = formData.value.tipoPaquete !== 'predefinido' || value !== null
          message = isValid ? '' : t('buyPackage.validation.selectPackage')
          break
        case 'tratamientosPersonalizados':
          isValid = formData.value.tipoPaquete !== 'personalizado' || value.length > 0
          message = isValid ? '' : t('buyPackage.validation.selectAtLeastOne')
          break
        case 'fecha':
          isValid = validators.fecha(value)
          message = isValid ? '' : t('buyPackage.validation.invalidDate')
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
      const baseFields = ['tipoPaquete', 'fecha']
      baseFields.forEach(field => validateField(field))

      if (formData.value.tipoPaquete === 'predefinido') {
        validateField('paqueteSeleccionado')
      } else if (formData.value.tipoPaquete === 'personalizado') {
        validateField('tratamientosPersonalizados')
      }

      return Object.keys(fieldErrors.value).length === 0
    }

    const onTipoPaqueteChange = () => {
      formData.value.paqueteSeleccionado = null
      formData.value.tratamientosPersonalizados = []
      // Limpiar errores al cambiar tipo
      fieldErrors.value = {}
    }

    const getTratamientoNombre = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.nombre : 'Tratamiento no encontrado'
    }

    const getTratamientoPrecio = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.precio : 0
    }

    const getTratamientoDuracion = (id) => {
      const tratamiento = tratamientos.value.find(t => t.id === id)
      return tratamiento ? tratamiento.duracion : 0
    }

    const calcularDuracionTotal = (tratamientosIds) => {
      return tratamientosIds.reduce((total, id) => {
        return total + getTratamientoDuracion(id)
      }, 0)
    }

    const calcularPrecioTotal = () => {
      return formData.value.tratamientosPersonalizados.reduce((total, tratamientoId) => {
        return total + getTratamientoPrecio(tratamientoId)
      }, 0)
    }

    const calcularDuracionTotalPersonalizado = () => {
      return formData.value.tratamientosPersonalizados.reduce((total, tratamientoId) => {
        return total + getTratamientoDuracion(tratamientoId)
      }, 0)
    }

    const handleSubmit = async () => {
      // Limpiar resultado anterior
      resultado.value = null

      if (!validateForm()) {
        resultado.value = {
          tipo: 'error',
          titulo: t('buyPackage.validationError'),
          mensaje: t('buyPackage.validationMessage')
        }
        return
      }

      loading.value = true

      try {
        // Obtener datos del usuario del store
        const usuario = store.auth?.user || {}

        let paqueteData = {
          // Datos del usuario desde el store
          nombre: usuario.nombre || '',
          carnet: usuario.carnet || '',
          telefono: usuario.telefono || '',
          email: usuario.email || '',
          observaciones: usuario.observaciones || '',
          fechaInicio: formData.value.fecha
        }

        if (formData.value.tipoPaquete === 'predefinido') {
          // Paquete predefinido
          paqueteData.paqueteId = formData.value.paqueteSeleccionado.id
        } else {
          // Paquete personalizado
          paqueteData.paqueteId = -1 // Indicador de paquete personalizado
          paqueteData.tratamientos = formData.value.tratamientosPersonalizados.map(id => getTratamientoNombre(id))
          paqueteData.precioPersonalizado = calcularPrecioTotal()
        }

        // DEBUG: Verificar datos antes de enviar
        console.log('Datos a enviar a comprarPaquete:', paqueteData)

        const compra = await store.comprarPaquete(paqueteData)

        // DEBUG: Verificar respuesta
        console.log('Respuesta de comprarPaquete:', compra)

        resultado.value = {
          tipo: 'exito',
          titulo: t('buyPackage.success'),
          mensaje: t('buyPackage.successMessage'),
          detalles: {
            id: compra.id,
            nombre: compra.nombre,
            paquete: compra.nombrePaquete,
            tratamientos: compra.tratamientos,
            fechaInicio: compra.fechaInicio,
            estado: compra.estado,
            precio: compra.precioPaquete
          }
        }

        // Resetear formulario después de éxito
        resetForm()

      } catch (error) {
        console.error('Error en handleSubmit:', error)
        resultado.value = {
          tipo: 'error',
          titulo: t('buyPackage.error'),
          mensaje: t('buyPackage.errorMessage') + ': ' + error.message
        }
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      formData.value = {
        tipoPaquete: '',
        paqueteSeleccionado: null,
        tratamientosPersonalizados: [],
        fecha: minDate.value
      }
      fieldErrors.value = {}

      // No limpiar resultado inmediatamente para que se vea el mensaje de éxito
      setTimeout(() => {
        resultado.value = null
      }, 5000)

      // Limpiar selección del store
      if (store.limpiarSeleccionPaquete) {
        store.limpiarSeleccionPaquete()
      }
    }

    onMounted(() => {
      // Inicializar fecha mínima
      if (!formData.value.fecha) {
        formData.value.fecha = minDate.value
      }

      // Limpiar la selección después de usarla
      setTimeout(() => {
        if (store.limpiarSeleccionPaquete) {
          store.limpiarSeleccionPaquete()
        }
      }, 100)
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
      getTratamientoDuracion,
      calcularDuracionTotal,
      calcularPrecioTotal,
      calcularDuracionTotalPersonalizado,
      handleSubmit,
      resetForm,
      t
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
  font-size: 1.8rem;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5a5a5a;
  font-size: 0.95rem;
}

.label-fecha {
  font-weight: 400 !important;
  color: #666 !important;
  font-size: 0.9rem;
  font-style: italic;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
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
  font-size: 0.9rem;
}

.checkbox-item:hover {
  background: #e9ecef;
}

.checkbox-item input {
  width: auto;
  margin-right: 0.5rem;
  transform: scale(1.1);
}

.paquete-info,
.paquete-personalizado-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #a2d2ff;
  font-size: 0.9rem;
}

.paquete-info h4,
.paquete-personalizado-info h4 {
  color: #5a5a5a;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
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
  font-size: 0.9rem;
}

.detalles-compra h4 {
  margin-bottom: 1rem;
  color: #5a5a5a;
  font-size: 1.1rem;
}

.detalles-compra ul {
  list-style: none;
  padding: 0;
}

.detalles-compra li {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 0;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .content-section {
    padding: 1rem 0;
  }

  .form {
    padding: 1.5rem;
    margin: 0 10px;
  }

  .form-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  .form-section h3 {
    font-size: 1.1rem;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .checkbox-item {
    padding: 0.4rem;
    font-size: 0.85rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.8rem;
  }

  .precio-total {
    text-align: center;
    font-size: 1rem;
  }

  .paquete-info,
  .paquete-personalizado-info {
    padding: 0.8rem;
    font-size: 0.85rem;
  }

  .detalles-compra {
    padding: 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .form {
    padding: 1rem;
    margin: 0 5px;
  }

  .page-header h2 {
    font-size: 1.3rem;
  }

  .form-section h3 {
    font-size: 1rem;
  }

  .form-group input,
  .form-group select {
    padding: 0.7rem;
    font-size: 0.9rem;
  }

  .checkbox-item {
    font-size: 0.8rem;
  }

  .precio-total {
    font-size: 0.9rem;
  }
}
</style>
