<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('reserve.title') }}</h2>
        <p>{{ $t('reserve.subtitle') }}</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="tratamiento">{{ $t('reserve.treatment') }}</label>
            <select id="tratamiento" v-model="formData.tratamiento" :class="{ error: fieldErrors.tratamiento }"
              @change="validateField('tratamiento')">
              <option value="">{{ $t('reserve.selectTreatment') }}</option>
              <option v-for="tratamiento in tratamientosDisponibles" :key="tratamiento.id" :value="tratamiento.nombre">
                {{ tratamiento.nombre }} - ${{ tratamiento.precio }} ({{ tratamiento.duracion }} min)
              </option>
            </select>
            <span v-if="fieldErrors.tratamiento" class="error-message">
              {{ fieldErrors.tratamiento }}
            </span>
          </div>

          <div class="form-group">
            <label for="fecha">{{ $t('reserve.date') }}</label>
            <input type="date" id="fecha" v-model="formData.fecha" :class="{ error: fieldErrors.fecha }" :min="minDate"
              @change="validateField('fecha'); actualizarHorasDisponibles()">
            <span v-if="fieldErrors.fecha" class="error-message">{{ fieldErrors.fecha }}</span>
          </div>

          <div class="form-group">
            <label for="hora">{{ $t('reserve.time') }}</label>
            <select id="hora" v-model="formData.hora" :class="{ error: fieldErrors.hora }"
              @change="validateField('hora')">
              <option value="">{{ $t('reserve.selectTime') }}</option>
              <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                {{ hora }}
              </option>
            </select>
            <span v-if="fieldErrors.hora" class="error-message">{{ fieldErrors.hora }}</span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? $t('reserve.reserving') : $t('reserve.reserve') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              {{ $t('reserve.clear') }}
            </button>
          </div>
        </form>

        <div v-if="resultado" class="resultado" :class="resultado.tipo">
          <h3>{{ resultado.titulo }}</h3>
          <p>{{ resultado.mensaje }}</p>
          <div v-if="resultado.detalles" class="detalles">
            <h4>{{ $t('reserve.reservationDetails') }}</h4>
            <ul>
              <li><strong>{{ $t('reserve.treatment') }}:</strong> {{ resultado.detalles.tratamiento }}</li>
              <li><strong>{{ $t('reserve.date') }}:</strong> {{ resultado.detalles.fecha }}</li>
              <li><strong>{{ $t('reserve.time') }}:</strong> {{ resultado.detalles.hora }}</li>
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
  name: 'ReservarCita',
  setup() {
    const { t } = useI18n()
    const store = useAppStore()

    const formData = ref({
      // Datos del usuario autenticado
      nombre: store.auth.user?.nombre || '',
      carnet: store.auth.user?.carnet || '',
      telefono: store.auth.user?.telefono || '',
      email: store.auth.user?.email || '',
      // Tratamiento - se preselecciona con el del store o queda vacío
      tratamiento: store.tratamientoSeleccionado?.nombre || '',
      fecha: '',
      hora: ''
    })

    const fieldErrors = ref({})
    const resultado = ref(null)
    const loading = ref(false)

    // Todos los tratamientos disponibles
    const tratamientosDisponibles = computed(() => store.tratamientos || [])

    const minDate = computed(() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const horasDisponibles = computed(() => {
      if (!formData.value.fecha) return []

      const fecha = new Date(formData.value.fecha)
      const diaSemana = fecha.getDay()
      let horas = []

      if (diaSemana === 5) { // Sábado
        for (let i = 10; i <= 18; i++) {
          horas.push(`${i.toString().padStart(2, '0')}:00`)
        }
      } else if (diaSemana !== 6) { // Lunes a Viernes
        for (let i = 9; i <= 20; i++) {
          horas.push(`${i.toString().padStart(2, '0')}:00`)
        }
      }

      return horas
    })

    const validateField = (field) => {
      const value = formData.value[field]
      let isValid = true
      let message = ''

      switch (field) {
        case 'tratamiento':
          isValid = validators.select(value)
          message = isValid ? '' : 'Seleccione un tratamiento'
          break
        case 'fecha':
          isValid = validators.fecha(value) && validators.validarDiaDescanso(value)
          message = isValid ? '' : 'Fecha inválida o domingo (cerrado)'
          break
        case 'hora':
          isValid = validators.hora(value) && validators.validarHorarioTrabajo(formData.value.fecha, value)
          message = isValid ? '' : 'Hora inválida o fuera del horario laboral'
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
      const fields = ['tratamiento', 'fecha', 'hora']
      fields.forEach(field => validateField(field))
      return Object.keys(fieldErrors.value).length === 0
    }

    const actualizarHorasDisponibles = () => {
      // Forzar la actualización de las horas disponibles cuando cambia la fecha
      formData.value.hora = ''
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        resultado.value = {
          tipo: 'error',
          titulo: t('reserve.validationError'), // CORREGIDO: usar t() en lugar de $t
          mensaje: t('reserve.validationMessage') // CORREGIDO: usar t() en lugar de $t
        }
        return
      }

      loading.value = true

      try {
        // Crear objeto completo con todos los datos
        const citaCompleta = {
          ...formData.value,
          estado: 'Confirmada',
          fechaReserva: new Date().toISOString()
        }

        const cita = await store.reservarCita(citaCompleta)

        resultado.value = {
          tipo: 'exito',
          titulo: t('reserve.success'), // CORREGIDO: usar t() en lugar de $t
          mensaje: t('reserve.successMessage'), // CORREGIDO: usar t() en lugar de $t
          detalles: cita
        }

        resetForm()
      } catch (error) {
        resultado.value = {
          tipo: 'error',
          titulo: t('reserve.error'), // CORREGIDO: usar t() en lugar de $t
          mensaje: t('reserve.errorMessage') // CORREGIDO: usar t() en lugar de $t
        }
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      const usuario = store.auth.user || {}

      formData.value = {
        nombre: usuario.nombre || '',
        carnet: usuario.carnet || '',
        telefono: usuario.telefono || '',
        email: usuario.email || '',
        tratamiento: '', // Limpiar el tratamiento al resetear
        fecha: minDate.value, // Mantener la fecha mínima
        hora: ''
      }

      fieldErrors.value = {}
      // NO limpiar resultado aquí para que se muestre el mensaje de éxito
    }

    onMounted(() => {
      // Inicializar fecha mínima
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      formData.value.fecha = tomorrow.toISOString().split('T')[0]

      // Cargar datos del usuario si están disponibles
      const usuario = store.auth.user || {}
      if (usuario.nombre) {
        formData.value.nombre = usuario.nombre
        formData.value.carnet = usuario.carnet
        formData.value.telefono = usuario.telefono
        formData.value.email = usuario.email
      }

      // Limpiar la selección del tratamiento después de usarla
      // para que no se mantenga en futuras visitas
      setTimeout(() => {
        store.tratamientoSeleccionado = null
      }, 100)
    })

    return {
      formData,
      fieldErrors,
      resultado,
      loading,
      minDate,
      horasDisponibles,
      tratamientosDisponibles,
      validateField,
      handleSubmit,
      resetForm,
      actualizarHorasDisponibles,
      t
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
  font-size: clamp(1.5rem, 5vw, 2rem);
}

.content-section {
  padding: clamp(1rem, 3vw, 2rem) 0;
}

.form {
  max-width: min(600px, 95vw);
  margin: 0 auto;
  background: white;
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5a5a5a;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: clamp(0.6rem, 2vw, 0.8rem);
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
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

.form-actions {
  display: flex;
  gap: clamp(0.5rem, 2vw, 1rem);
  justify-content: center;
  margin-top: clamp(1rem, 3vw, 2rem);
  flex-wrap: wrap;
}

.btn {
  padding: clamp(0.6rem, 2vw, 0.8rem) clamp(1rem, 3vw, 1.5rem);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 600;
  transition: all 0.3s;
  min-width: max-content;
  flex: 1;
  max-width: 200px;
}

.btn-primary {
  background: #ff6b95;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #e55a82;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.resultado {
  margin-top: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

.resultado.exito {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.resultado.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.detalles {
  margin-top: clamp(0.75rem, 2vw, 1rem);
  padding: clamp(0.75rem, 2vw, 1rem);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
}

.detalles h4 {
  margin-bottom: clamp(0.75rem, 2vw, 1rem);
  color: #5a5a5a;
  font-size: clamp(1rem, 3vw, 1.1rem);
}

.detalles ul {
  list-style: none;
}

.detalles li {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

@media (max-width: 360px) {
  .form-actions {
    flex-direction: column;
  }

  .btn {
    min-width: 100%;
  }
}
</style>