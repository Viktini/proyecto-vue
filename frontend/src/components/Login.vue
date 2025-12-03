<!-- Login.vue - VERSIÓN COMPLETA CORREGIDA -->
<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo-container">
        <img src="../assets/logo.jpg" alt="Logo Belleza y Relajación" class="logo">
        <h1>Belleza y Relajación</h1>
      </div>

      <!-- Selector de modo (Login/Registro) -->
      <div class="mode-selector">
        <button @click="toggleMode(false)" :class="{ active: !isRegisterMode }" class="mode-btn">
          Iniciar Sesión
        </button>
        <button @click="toggleMode(true)" :class="{ active: isRegisterMode }" class="mode-btn">
          Registrarse
        </button>
      </div>

      <form @submit.prevent="isRegisterMode ? handleRegister() : handleLogin()">
        <!-- Campos para registro -->
        <div v-if="isRegisterMode" class="form-group">
          <label for="fullName">Nombre Completo *</label>
          <input type="text" id="fullName" v-model="formData.fullName" :class="{
            error: showValidationErrors && (errors.fullName || !formData.fullName),
            'empty-field': showValidationErrors && !formData.fullName
          }" placeholder="Ingrese su nombre completo" required>
          <span v-if="showValidationErrors && errors.fullName" class="error-message">{{ errors.fullName }}</span>
          <span v-else-if="showValidationErrors && !formData.fullName" class="error-message">
            El nombre completo es requerido
          </span>
        </div>

        <div v-if="isRegisterMode" class="form-group">
          <label for="gmail">Gmail *</label>
          <input type="email" id="gmail" v-model="formData.gmail" :class="{
            error: showValidationErrors && (errors.gmail || !formData.gmail),
            'empty-field': showValidationErrors && !formData.gmail
          }" placeholder="ejemplo@gmail.com" required>
          <span v-if="showValidationErrors && errors.gmail" class="error-message">{{ errors.gmail }}</span>
          <span v-else-if="showValidationErrors && !formData.gmail" class="error-message">
            El gmail es requerido
          </span>
        </div>

        <div class="form-group">
          <label for="username">{{ isRegisterMode ? 'Nombre de Usuario *' : 'Usuario o Gmail *' }}</label>
          <input type="text" id="username" v-model="formData.username" :class="{
            error: showValidationErrors && (errors.username || !formData.username?.trim()),
            'empty-field': showValidationErrors && !formData.username?.trim()
          }" :placeholder="isRegisterMode ? 'Elija un nombre de usuario' : 'Ingrese su usuario o gmail'" required>
          <span v-if="showValidationErrors && errors.username" class="error-message">{{ errors.username }}</span>
          <span v-else-if="showValidationErrors && !formData.username?.trim()" class="error-message">
            {{ isRegisterMode ? 'El nombre de usuario es requerido' : 'Usuario o gmail es requerido' }}
          </span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <input type="password" id="password" v-model="formData.password" :class="{
            error: showValidationErrors && (errors.password || !formData.password),
            'empty-field': showValidationErrors && !formData.password
          }" :placeholder="isRegisterMode ? 'Mínimo 6 caracteres con mayúsculas y números' : 'Ingrese su contraseña'"
            required>
          <span v-if="showValidationErrors && errors.password" class="error-message">{{ errors.password }}</span>
          <span v-else-if="showValidationErrors && !formData.password" class="error-message">
            La contraseña es requerida
          </span>
          <small v-if="isRegisterMode" class="password-hint">
            La contraseña debe contener al menos una mayúscula, una minúscula y un número
          </small>
        </div>

        <!-- Campo adicional para registro -->
        <div v-if="isRegisterMode" class="form-group">
          <label for="confirmPassword">Confirmar Contraseña *</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" :class="{
            error: showValidationErrors && (errors.confirmPassword || !formData.confirmPassword),
            'empty-field': showValidationErrors && !formData.confirmPassword
          }" placeholder="Confirme su contraseña" required>
          <span v-if="showValidationErrors && errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </span>
          <span v-else-if="showValidationErrors && !formData.confirmPassword" class="error-message">
            Confirmar contraseña es requerido
          </span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">
              <span class="loading-spinner"></span>
              {{ isRegisterMode ? 'Registrando...' : 'Iniciando sesión...' }}
            </span>
            <span v-else>{{ isRegisterMode ? 'Registrarse' : 'Iniciar Sesión' }}</span>
          </button>
        </div>

        <div v-if="errorMessage" class="resultado error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="resultado success">
          {{ successMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api'

export default {
  name: 'Login',

  setup() {
    const router = useRouter()

    // Variables reactivas
    const isRegisterMode = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const showValidationErrors = ref(false)

    // Usar reactive para el objeto formData
    const formData = reactive({
      fullName: '',
      gmail: '',
      username: '',
      password: '',
      confirmPassword: ''
    })

    // Usar reactive para errors
    const errors = reactive({})

    onMounted(() => {
      // Si el usuario ya está autenticado, redirigir a home
      if (authAPI.isAuthenticated()) {
        const user = authAPI.getCurrentUser()
        if (user && user.rol_usuario === 'admin') {
          router.push('/admin')
        } else {
          router.push('/home')
        }
      }
    })

    // ✅ FUNCIÓN: Validar campo individual
    const validateField = (fieldName) => {
      const value = formData[fieldName]
      const trimmedValue = typeof value === 'string' ? value.trim() : value

      switch (fieldName) {
        case 'fullName':
          if (!trimmedValue) {
            errors.fullName = 'El nombre completo es requerido'
          } else if (trimmedValue.length < 2) {
            errors.fullName = 'El nombre debe tener al menos 2 caracteres'
          } else if (trimmedValue.length > 100) {
            errors.fullName = 'El nombre no puede tener más de 100 caracteres'
          } else {
            delete errors.fullName
          }
          break

        case 'gmail':
          if (!trimmedValue) {
            errors.gmail = 'El gmail es requerido'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
            errors.gmail = 'Ingrese un gmail válido'
          } else {
            delete errors.gmail
          }
          break

        case 'username':
          if (!trimmedValue) {
            errors.username = isRegisterMode.value
              ? 'El nombre de usuario es requerido'
              : 'Usuario o gmail es requerido'
          } else if (isRegisterMode.value && trimmedValue.length < 3) {
            errors.username = 'El usuario debe tener al menos 3 caracteres'
          } else if (isRegisterMode.value && trimmedValue.length > 50) {
            errors.username = 'El usuario no puede tener más de 50 caracteres'
          } else if (isRegisterMode.value && !/^[a-zA-Z0-9_]+$/.test(trimmedValue)) {
            errors.username = 'El usuario solo puede contener letras, números y guiones bajos'
          } else {
            delete errors.username
          }
          break

        case 'password':
          if (!value) {
            errors.password = 'La contraseña es requerida'
          } else if (value.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres'
          } else if (isRegisterMode.value && !/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
            errors.password = 'Debe contener mayúsculas, minúsculas y números'
          } else if (value.length > 100) {
            errors.password = 'La contraseña no puede tener más de 100 caracteres'
          } else {
            delete errors.password
          }
          break

        case 'confirmPassword':
          if (!value) {
            errors.confirmPassword = 'Confirme su contraseña'
          } else if (formData.password !== value) {
            errors.confirmPassword = 'Las contraseñas no coinciden'
          } else {
            delete errors.confirmPassword
          }
          break
      }
    }

    const validateForm = () => {
      // Limpiar errores anteriores
      Object.keys(errors).forEach(key => delete errors[key])
      showValidationErrors.value = true

      // Validar todos los campos
      if (isRegisterMode.value) {
        validateField('fullName')
        validateField('gmail')
      }
      validateField('username')
      validateField('password')
      if (isRegisterMode.value) {
        validateField('confirmPassword')
      }

      return Object.keys(errors).length === 0
    }

    // ✅ FUNCIÓN: Login
    const handleLogin = async () => {
      if (!validateForm()) {
        scrollToFirstError()
        return
      }

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        console.log('🔐 Intentando login con:', {
          usernameOrEmail: formData.username,
          password: formData.password
        })

        const response = await fetch('http://localhost:3001/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            usernameOrEmail: formData.username,
            password: formData.password
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          console.log('✅ Login exitoso:', result)

          // Guardar token y usuario
          if (result.data.access_token) {
            localStorage.setItem('token', result.data.access_token)
            localStorage.setItem('user', JSON.stringify(result.data.user))

            successMessage.value = '¡Inicio de sesión exitoso! Redirigiendo...'

            setTimeout(() => {
              const userRole = result.data.user?.role || 'cliente'
              if (userRole === 'admin') {
                router.push('/admin')
              } else {
                router.push('/home')
              }
            }, 1000)
          }
        } else {
          throw new Error(result.message || `Error ${response.status}: ${result.error}`)
        }

      } catch (error) {
        console.error('❌ Error en login:', error)

        if (error.message.includes('Failed to fetch')) {
          errorMessage.value = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:3001'
        } else if (error.message.includes('401') || error.message.includes('INVALID_CREDENTIALS')) {
          errorMessage.value = 'Credenciales incorrectas'
        } else if (error.message.includes('404')) {
          errorMessage.value = 'Ruta no encontrada. Verifica la URL del backend'
        } else {
          errorMessage.value = `Error: ${error.message || 'Desconocido'}`
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ FUNCIÓN: Registro
    const handleRegister = async () => {
      if (!validateForm()) {
        scrollToFirstError()
        return
      }

      // Validar confirmación de contraseña
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
        scrollToFirstError()
        return
      }

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const registerData = {
          fullName: formData.fullName,
          gmail: formData.gmail,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }

        console.log('📤 Enviando registro...', registerData)

        const response = await fetch('http://localhost:3001/api/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'http://localhost:3000' // Añade esto
          },
          mode: 'cors', // Añade esto
          credentials: 'omit', // Cambia a 'omit' en lugar de 'include'
          body: JSON.stringify(registerData)
        })

        const result = await response.json()

        if (response.ok && result.success) {
          console.log('✅ Registro exitoso:', result)

          successMessage.value = '¡Registro exitoso! Ahora puede iniciar sesión con sus credenciales.'

          // Limpiar formulario
          Object.assign(formData, {
            fullName: '',
            gmail: '',
            username: '',
            password: '',
            confirmPassword: ''
          })
          showValidationErrors.value = false

          // Cambiar a modo login después de 3 segundos
          setTimeout(() => {
            isRegisterMode.value = false
            successMessage.value = ''
          }, 3000)

        } else {
          throw new Error(result.message || `Error ${response.status}: ${result.error}`)
        }

      } catch (error) {
        console.error('❌ Error en registro:', error)

        if (error.message.includes('Failed to fetch')) {
          errorMessage.value = 'No se puede conectar al servidor. Verifica que el backend esté corriendo'
        } else if (error.message.includes('Conflict') || error.message.includes('ya está registrado')) {
          errorMessage.value = 'El gmail o nombre de usuario ya está registrado'
        } else if (error.message.includes('Bad Request') || error.message.includes('no coinciden')) {
          errorMessage.value = 'Las contraseñas no coinciden'
        } else {
          errorMessage.value = `Error: ${error.message || 'Desconocido'}`
        }
      } finally {
        loading.value = false
      }
    }

    // ✅ FUNCIÓN: Scroll al primer campo con error
    const scrollToFirstError = () => {
      setTimeout(() => {
        const firstErrorInput = document.querySelector('.form-group input.error')
        if (firstErrorInput) {
          firstErrorInput.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
          firstErrorInput.focus()
        }
      }, 100)
    }

    // ✅ FUNCIÓN: Cambiar entre modo login y registro
    const toggleMode = (mode) => {
      isRegisterMode.value = mode
      errorMessage.value = ''
      successMessage.value = ''
      showValidationErrors.value = false

      // Resetear errores
      Object.keys(errors).forEach(key => delete errors[key])

      // Limpiar formulario
      Object.assign(formData, {
        fullName: '',
        gmail: '',
        username: '',
        password: '',
        confirmPassword: ''
      })
    }

    // ✅ Retornar TODAS las variables y funciones que usa el template
    return {
      // Variables reactivas
      isRegisterMode,
      showValidationErrors,
      formData,
      errors,
      errorMessage,
      successMessage,
      loading,

      // Funciones
      handleLogin,
      handleRegister,
      toggleMode
    }
  }
}
</script>

<style scoped>
/* Estilos completos */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 1rem;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo-container {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  width: 180px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 1rem;
  object-fit: cover;
}

.mode-selector {
  display: flex;
  margin-bottom: 1.5rem;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.mode-btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.mode-btn.active {
  background: #a2d2ff;
  color: white;
}

.mode-btn:hover:not(.active) {
  background: #e9ecef;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5a5a5a;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #a2d2ff;
  box-shadow: 0 0 0 3px rgba(162, 210, 255, 0.2);
}

.form-group input.error,
.form-group input.empty-field {
  border-color: #ff6b6b;
  background-color: #fff5f5;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.form-group input.error:focus,
.form-group input.empty-field:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

.form-group input.empty-field {
  animation: shake 0.5s ease-in-out;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
  font-weight: 500;
  padding-left: 0.25rem;
}

.password-hint {
  display: block;
  margin-top: 5px;
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

.form-actions {
  margin-top: 2rem;
}

.btn {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary {
  background: #a2d2ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #89c2ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.resultado {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 5px;
  text-align: center;
  font-weight: 600;
}

.resultado.error {
  background: #ffe6e6;
  color: #d63031;
  border: 1px solid #ff6b6b;
}

.resultado.success {
  background: #e6f7e6;
  color: #27ae60;
  border: 1px solid #2ecc71;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .login-form {
    padding: 1.5rem;
    margin: 0;
  }

  .logo {
    width: 150px;
    height: 80px;
  }

  .form-group input {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .login-form {
    padding: 1rem;
  }

  .logo {
    width: 120px;
    height: 70px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-group input {
    padding: 0.6rem;
  }
}
</style>