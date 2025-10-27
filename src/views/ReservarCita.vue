<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>Reservar Cita</h2>
        <p>Complete el formulario para reservar su cita</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="nombre">Nombre Completo *</label>
            <input type="text" id="nombre" v-model="formData.nombre" :class="{ error: fieldErrors.nombre }"
              placeholder="Solo letras (sin números ni símbolos)" @blur="validateField('nombre')">
            <span v-if="fieldErrors.nombre" class="error-message">{{ fieldErrors.nombre }}</span>
          </div>

          <div class="form-group">
            <label for="carnet">Carnet de Identidad *</label>
            <input type="text" id="carnet" v-model="formData.carnet" :class="{ error: fieldErrors.carnet }"
              placeholder="Solo números (máximo once dígitos)" maxlength="11" @blur="validateField('carnet')">
            <span v-if="fieldErrors.carnet" class="error-message">{{ fieldErrors.carnet }}</span>
          </div>

          <div class="form-group">
            <label for="telefono">Teléfono *</label>
            <input type="tel" id="telefono" v-model="formData.telefono" :class="{ error: fieldErrors.telefono }"
              placeholder="8 dígitos" maxlength="8" @blur="validateField('telefono')">
            <span v-if="fieldErrors.telefono" class="error-message">{{ fieldErrors.telefono }}</span>
          </div>

          <div class="form-group">
            <label for="tratamiento">Tratamiento *</label>
            <select id="tratamiento" v-model="formData.tratamiento" :class="{ error: fieldErrors.tratamiento }"
              @change="validateField('tratamiento')">
              <option value="">Seleccione un tratamiento</option>
              <option v-for="tratamiento in tratamientos" :key="tratamiento.id" :value="tratamiento.nombre">
                {{ tratamiento.nombre }} - ${{ tratamiento.precio }} ({{ tratamiento.duracion }} min)
              </option>
            </select>
            <span v-if="fieldErrors.tratamiento" class="error-message">{{ fieldErrors.tratamiento }}</span>
          </div>

          <div class="form-group">
            <label for="fecha">Fecha *</label>
            <input type="date" id="fecha" v-model="formData.fecha" :class="{ error: fieldErrors.fecha }" :min="minDate"
              @change="validateField('fecha')">
            <span v-if="fieldErrors.fecha" class="error-message">{{ fieldErrors.fecha }}</span>
          </div>

          <div class="form-group">
            <label for="hora">Hora *</label>
            <select id="hora" v-model="formData.hora" :class="{ error: fieldErrors.hora }"
              @change="validateField('hora')">
              <option value="">Seleccione una hora</option>
              <option v-for="hora in horasDisponibles" :key="hora" :value="hora">
                {{ hora }}
              </option>
            </select>
            <span v-if="fieldErrors.hora" class="error-message">{{ fieldErrors.hora }}</span>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Reservando...' : 'Reservar Cita' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              Limpiar
            </button>
          </div>
        </form>

        <div v-if="resultado" class="resultado" :class="resultado.tipo">
          <h3>{{ resultado.titulo }}</h3>
          <p>{{ resultado.mensaje }}</p>
          <div v-if="resultado.detalles" class="detalles">
            <h4>Detalles de la reserva:</h4>
            <ul>
              <li><strong>Nombre:</strong> {{ resultado.detalles.nombre }}</li>
              <li><strong>Carnet:</strong> {{ resultado.detalles.carnet }}</li>
              <li><strong>Teléfono:</strong> {{ resultado.detalles.telefono }}</li>
              <li><strong>Tratamiento:</strong> {{ resultado.detalles.tratamiento }}</li>
              <li><strong>Fecha:</strong> {{ resultado.detalles.fecha }}</li>
              <li><strong>Hora:</strong> {{ resultado.detalles.hora }}</li>
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
  name: 'ReservarCita',
  setup() {
    const store = useAppStore()

    const formData = ref({
      nombre: '',
      carnet: '',
      telefono: '',
      tratamiento: '',
      fecha: '',
      hora: ''
    })

    const fieldErrors = ref({})
    const resultado = ref(null)
    const loading = ref(false)

    const tratamientos = computed(() => store.tratamientos) // ← Acceso directo

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
      const fields = ['nombre', 'carnet', 'telefono', 'tratamiento', 'fecha', 'hora']
      fields.forEach(field => validateField(field))
      return Object.keys(fieldErrors.value).length === 0
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
        const cita = await store.reservarCita(formData.value) // ← Sin dispatch

        resultado.value = {
          tipo: 'exito',
          titulo: '¡Cita Reservada Exitosamente!',
          mensaje: 'Su cita ha sido confirmada. Le enviaremos un recordatorio.',
          detalles: cita
        }

        resetForm()
      } catch (error) {
        resultado.value = {
          tipo: 'error',
          titulo: 'Error al Reservar',
          mensaje: 'Ha ocurrido un error al procesar su reserva. Por favor, intente nuevamente.'
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
        tratamiento: '',
        fecha: '',
        hora: ''
      }
      fieldErrors.value = {}
      resultado.value = null
    }

    onMounted(() => {
      // Inicializar fecha mínima
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      formData.value.fecha = tomorrow.toISOString().split('T')[0]
    })

    return {
      formData,
      fieldErrors,
      resultado,
      loading,
      tratamientos,
      minDate,
      horasDisponibles,
      validateField,
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
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.detalles {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 5px;
}

.detalles h4 {
  margin-bottom: 1rem;
  color: #5a5a5a;
}

.detalles ul {
  list-style: none;
}

.detalles li {
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
