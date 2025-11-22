<template>
  <div>
    <section class="page-header">
      <div class="container">
        <h2>{{ $t('user.title') }}</h2>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <form @submit.prevent="handleSubmit" class="form">
          <!-- Datos Personales -->
          <div class="form-section">
            <h3>{{ $t('user.personalData') }}</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="nombre-paquete">{{ $t('user.fullName') }}</label>
                <input type="text" id="nombre-paquete" v-model="formData.nombre" :class="{ error: fieldErrors.nombre }"
                  :placeholder="$t('user.namePlaceholder')" @blur="validateField('nombre')"
                  @input="filtrarSoloLetras($event, 'nombre')">
                <span v-if="fieldErrors.nombre" class="error-message">{{ fieldErrors.nombre }}</span>
              </div>

              <div class="form-group">
                <label for="carnet-paquete">{{ $t('user.idCard') }}</label>
                <input type="text" id="carnet-paquete" v-model="formData.carnet" :class="{ error: fieldErrors.carnet }"
                  :placeholder="$t('user.idCardPlaceholder')" maxlength="11" @blur="validateField('carnet')"
                  @input="filtrarSoloNumeros($event, 'carnet')">
                <span v-if="fieldErrors.carnet" class="error-message">{{ fieldErrors.carnet }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="telefono-paquete">{{ $t('user.phone') }}</label>
                <input type="tel" id="telefono-paquete" v-model="formData.telefono"
                  :class="{ error: fieldErrors.telefono }" :placeholder="$t('user.phonePlaceholder')" maxlength="8"
                  @blur="validateField('telefono')" @input="filtrarSoloNumeros($event, 'telefono')">
                <span v-if="fieldErrors.telefono" class="error-message">{{ fieldErrors.telefono }}</span>
              </div>

              <div class="form-group">
                <label for="email-paquete">{{ $t('user.email') }}</label>
                <input type="email" id="email-paquete" v-model="formData.email" :class="{ error: fieldErrors.email }"
                  :placeholder="$t('user.emailPlaceholder')" @blur="validateField('email')"
                  @input="filtrarEmail($event)">
                <span v-if="fieldErrors.email" class="error-message">{{ fieldErrors.email }}</span>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="form-section">
            <div class="form-group">
              <label for="observaciones-paquete">{{ $t('user.observations') }}</label>
              <textarea id="observaciones-paquete" v-model="formData.observaciones" rows="3"
                :placeholder="$t('user.observationsPlaceholder')" @input="filtrarTextoObservaciones($event)"></textarea>
            </div>
          </div>

          <!-- Acciones -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? $t('user.updating') : $t('user.updateData') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="resetForm">
              {{ $t('user.clear') }}
            </button>
          </div>
        </form>

        <!-- Mostrar resultado de la operación -->
        <div v-if="resultado" class="resultado" :class="resultado.tipo">
          <h3>{{ resultado.titulo }}</h3>
          <p>{{ resultado.mensaje }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { validators } from '../utils/validators'
import { useI18n } from 'vue-i18n'

export default {
  name: 'TuComponente',
  setup() {
    const { t } = useI18n()
    const store = useAppStore()

    const formData = ref({
      nombre: '',
      carnet: '',
      telefono: '',
      email: '',
      usuario: '',
      contrasenna: '',
      observaciones: ''
    })

    const fieldErrors = ref({})
    const resultado = ref(null)
    const loading = ref(false)

    // Funciones de filtrado
    const filtrarSoloLetras = (event, fieldName) => {
      let valor = event.target.value
      // Permitir solo letras, espacios, vocales con acento y ñ
      valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
      // Limitar a dos espacios consecutivos
      valor = valor.replace(/\s{2,}/g, ' ')
      // Actualizar el valor en el modelo
      formData.value[fieldName] = valor
    }

    const filtrarSoloNumeros = (event, fieldName) => {
      let valor = event.target.value
      // Permitir solo números
      valor = valor.replace(/[^0-9]/g, '')
      // Aplicar límites según el campo
      if (fieldName === 'telefono' && valor.length > 8) {
        valor = valor.substring(0, 8)
      } else if (fieldName === 'carnet' && valor.length > 11) {
        valor = valor.substring(0, 11)
      }
      // Actualizar el valor en el modelo
      formData.value[fieldName] = valor
    }

    const filtrarEmail = (event) => {
      let valor = event.target.value

      // Si el usuario está escribiendo antes del @
      if (!valor.includes('@')) {
        // Permitir solo letras, números, puntos y guiones antes del @
        valor = valor.replace(/[^a-zA-Z0-9._-]/g, '')
      } else {
        // Si ya incluye @, separar en usuario y dominio
        const partes = valor.split('@')
        if (partes.length === 2) {
          const usuario = partes[0].replace(/[^a-zA-Z0-9._-]/g, '')
          let dominio = partes[1]

          // Forzar automáticamente @gmail.com
          if (dominio === '' || dominio.startsWith('gmail.com')) {
            dominio = 'gmail.com'
          } else if (!dominio.startsWith('gmail.com')) {
            // Si el usuario intenta escribir otro dominio, forzar gmail.com
            dominio = 'gmail.com'
          }

          valor = usuario + '@' + dominio
        }
      }

      // Actualizar el valor en el modelo
      formData.value.email = valor
    }

    const filtrarTextoObservaciones = (event) => {
      let valor = event.target.value

      // Permitir letras, números, espacios y signos de puntuación comunes
      valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:!?¡¿()\-_'"@#$%&*+=/\\]/g, '')

      // Limitar espacios consecutivos
      valor = valor.replace(/\s{2,}/g, ' ')

      // Actualizar el valor en el modelo
      formData.value.observaciones = valor
    }

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
      }

      if (isValid) {
        delete fieldErrors.value[field]
      } else {
        fieldErrors.value[field] = message
      }

      return isValid
    }

    const validateForm = () => {
      const baseFields = ['nombre', 'carnet', 'telefono', 'email']
      baseFields.forEach(field => validateField(field))

      return Object.keys(fieldErrors.value).length === 0
    }

    const handleSubmit = async () => {
      if (!validateForm()) {
        resultado.value = {
          tipo: 'error',
          titulo: $t('user.validationError'),
          mensaje: $t('user.validationMessage')
        }
        return
      }

      loading.value = true

      try {
        const datosActualizados = {
          nombre: formData.value.nombre,
          carnet: formData.value.carnet,
          telefono: formData.value.telefono,
          email: formData.value.email,
          usuario: formData.value.usuario,
          observaciones: formData.value.observaciones
        }

        const respuesta = await store.actualizarDatosUsuario(datosActualizados)

        resultado.value = {
          tipo: 'exito',
          titulo: $t('user.success'),
          mensaje: $t('user.successMessage')
        }
      } catch (error) {
        resultado.value = {
          tipo: 'error',
          titulo: $t('user.error'),
          mensaje: $t('user.errorMessage')
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
        usuario: usuario.usuario || '',
        contrasenna: '',
        observaciones: usuario.observaciones || ''
      }
      fieldErrors.value = {}
      resultado.value = null
    }

    onMounted(() => {
      const usuario = store.auth.user || {}

      formData.value = {
        nombre: usuario.nombre || '',
        carnet: usuario.carnet || '',
        telefono: usuario.telefono || '',
        email: usuario.email || '',
        usuario: usuario.usuario || '',
        contrasenna: '',
        observaciones: usuario.observaciones || ''
      }
    })

    return {
      formData,
      fieldErrors,
      resultado,
      loading,
      validateField,
      handleSubmit,
      resetForm,
      filtrarSoloLetras,
      filtrarSoloNumeros,
      filtrarEmail,
      filtrarTextoObservaciones,
      t
    }
  }
}
</script>

<style scoped>
/* Variables fluidas */
:root {
  --spacing-min: 0.5rem;
  --spacing-max: 2rem;
  --font-min: 0.875rem;
  --font-max: 1.125rem;
  --heading-min: 1.5rem;
  --heading-max: 2rem;
}

.page-header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 4vw, 3rem) 0;
  text-align: center;
}

.page-header h2 {
  color: #5a5a5a;
  margin-bottom: 0.5rem;
  font-size: clamp(var(--heading-min), 5vw, var(--heading-max));
}

.content-section {
  padding: clamp(1rem, 3vw, 2rem) 0;
}

.form {
  max-width: min(800px, 95vw);
  margin: 0 auto;
  background: white;
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: clamp(1rem, 3vw, 2rem);
  padding-bottom: clamp(0.75rem, 2vw, 1.5rem);
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  color: #5a5a5a;
  margin-bottom: clamp(0.5rem, 1.5vw, 1rem);
  font-size: clamp(1rem, 3vw, 1.2rem);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(0.5rem, 2vw, 1rem);
}

.form-group {
  margin-bottom: clamp(0.75rem, 2vw, 1.5rem);
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5a5a5a;
  font-size: clamp(var(--font-min), 2vw, var(--font-max));
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: clamp(0.6rem, 2vw, 0.8rem);
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: clamp(var(--font-min), 2vw, 1rem);
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
  font-size: clamp(var(--font-min), 2vw, var(--font-max));
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
  transform: translateY(-2px);
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
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: 5px;
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

/* Ajustes específicos para móviles muy pequeños */
@media (max-width: 360px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .btn {
    min-width: 100%;
  }
}
</style>