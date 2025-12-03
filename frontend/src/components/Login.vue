<!-- Login.vue - VERSIÓN CON VALIDACIÓN SOLO AL PRESIONAR BOTÓN -->
<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo-container">
        <img src="../assets/logo.jpg" alt="Logo Belleza y Relajación" class="logo">
        <h1>Belleza y Relajación</h1>
      </div>

      <!-- Selector de modo (Login/Registro) -->
      <div class="mode-selector">
        <button @click="isRegisterMode = false" :class="{ active: !isRegisterMode }" class="mode-btn">
          Iniciar Sesión
        </button>
        <button @click="isRegisterMode = true" :class="{ active: isRegisterMode }" class="mode-btn">
          Registrarse
        </button>
      </div>

      <form @submit.prevent="isRegisterMode ? handleRegister() : handleLogin()">
        <!-- ✅ NUEVO CAMPO: Carnet de Identidad (solo en registro) -->
        <div v-if="isRegisterMode" class="form-group">
          <label for="carnet">Carnet de Identidad</label>
          <input type="number" id="carnet" v-model="formData.carnet" :class="{
            error: showValidationErrors && (errors.carnet || !formData.carnet),
            'empty-field': showValidationErrors && !formData.carnet
          }" placeholder="Ingrese su carnet de identidad" required>
          <span v-if="showValidationErrors && errors.carnet" class="error-message">{{ errors.carnet }}</span>
          <span v-else-if="showValidationErrors && !formData.carnet" class="error-message">
            El carnet de identidad es requerido
          </span>
        </div>

        <div class="form-group">
          <label for="username">Usuario</label>
          <input type="text" id="username" v-model="formData.username" :class="{
            error: showValidationErrors && (errors.username || !formData.username.trim()),
            'empty-field': showValidationErrors && !formData.username.trim()
          }" placeholder="Ingrese su usuario" required>
          <span v-if="showValidationErrors && errors.username" class="error-message">{{ errors.username }}</span>
          <span v-else-if="showValidationErrors && !formData.username.trim()" class="error-message">
            El usuario es requerido
          </span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="formData.password" :class="{
            error: showValidationErrors && (errors.password || !formData.password),
            'empty-field': showValidationErrors && !formData.password
          }" placeholder="Ingrese su contraseña" required>
          <span v-if="showValidationErrors && errors.password" class="error-message">{{ errors.password }}</span>
          <span v-else-if="showValidationErrors && !formData.password" class="error-message">
            La contraseña es requerida
          </span>
        </div>

        <!-- Campo adicional para registro -->
        <div v-if="isRegisterMode" class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" :class="{
            error: showValidationErrors && (errors.confirmPassword || !formData.confirmPassword),
            'empty-field': showValidationErrors && !formData.confirmPassword
          }" placeholder="Confirme su contraseña" required>
          <span v-if="showValidationErrors && errors.confirmPassword" class="error-message">{{ errors.confirmPassword
            }}</span>
          <span v-else-if="showValidationErrors && !formData.confirmPassword" class="error-message">
            Confirmar contraseña es requerido
          </span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">{{ isRegisterMode ? 'Registrando...' : 'Iniciando sesión...' }}</span>
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

      <div class="demo-accounts">
        <h3>Cuentas de demostración:</h3>
        <div class="account-info">
          <p><strong>Administrador:</strong> carnet: 12345678, usuario: admin, contraseña: admin123</p>
          <p><strong>Cliente:</strong> carnet: 87654321, usuario: cliente, contraseña: cliente123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'vue-router'
import { useI18nComposable } from '@/composables/useI18n'

export default {
  name: 'Login',
  setup() {
    const store = useAppStore()
    const router = useRouter()
    const { t, changeLanguage, currentLanguage } = useI18nComposable()

    const currentLang = ref(currentLanguage())
    const isRegisterMode = ref(false)
    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const showValidationErrors = ref(false) // ✅ CONTROLAR CUÁNDO MOSTRAR ERRORES

    const formData = ref({
      carnet: '',
      username: '',
      password: '',
      confirmPassword: ''
    })

    const errors = ref({})

    onMounted(() => {
      const savedLang = localStorage.getItem('preferred-language')
      if (savedLang) {
        currentLang.value = savedLang
        changeLanguage(savedLang)
      }
    })

    // ✅ FUNCIÓN: Validar campo individual
    const validateField = (fieldName) => {
      const value = formData.value[fieldName]
      const trimmedValue = typeof value === 'string' ? value.trim() : value

      switch (fieldName) {
        case 'carnet':
          if (!value) {
            errors.value.carnet = 'El carnet de identidad es requerido'
          } else if (value.toString().length < 6) {
            errors.value.carnet = 'El carnet debe tener al menos 6 dígitos'
          } else {
            delete errors.value.carnet
          }
          break

        case 'username':
          if (!trimmedValue) {
            errors.value.username = 'El usuario es requerido'
          } else if (trimmedValue.length < 3) {
            errors.value.username = 'El usuario debe tener al menos 3 caracteres'
          } else {
            delete errors.value.username
          }
          break

        case 'password':
          if (!value) {
            errors.value.password = 'La contraseña es requerida'
          } else if (value.length < 6) {
            errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
          } else {
            delete errors.value.password
          }
          break

        case 'confirmPassword':
          if (!value) {
            errors.value.confirmPassword = 'Confirme su contraseña'
          } else if (formData.value.password !== value) {
            errors.value.confirmPassword = 'Las contraseñas no coinciden'
          } else {
            delete errors.value.confirmPassword
          }
          break
      }
    }

    const validateForm = () => {
      errors.value = {}
      showValidationErrors.value = true // ✅ ACTIVAR VISUALIZACIÓN DE ERRORES

      // Validar todos los campos
      if (isRegisterMode.value) {
        validateField('carnet')
      }
      validateField('username')
      validateField('password')
      if (isRegisterMode.value) {
        validateField('confirmPassword')
      }

      return Object.keys(errors.value).length === 0
    }

    const handleLogin = async () => {
      // ✅ SOLO VALIDAR CUANDO SE PRESIONA EL BOTÓN
      if (!validateForm()) {
        // Scroll al primer campo con error
        scrollToFirstError()
        return
      }

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const loginData = {
          nom_usuario: formData.value.username,
          contrasenna_usuario: formData.value.password
        }

        console.log('📤 Enviando login:', loginData)

        const response = await fetch('http://localhost:5000/api/usuarios/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData)
        })

        if (!response.ok) {
          // ✅ MENSAJE GENERAL DE ERROR POR SEGURIDAD
          throw new Error('Credenciales incorrectas. Verifique su usuario y contraseña.')
        }

        const result = await response.json()
        console.log('✅ Login exitoso - Respuesta completa:', result)

        if (!result.usuario) {
          throw new Error('No se recibió información del usuario')
        }

        console.log('👤 Usuario recibido:', result.usuario)
        console.log('🔑 Rol del usuario:', result.usuario.rol_usuario)

        // Guardar en store/localStorage
        localStorage.setItem('user', JSON.stringify(result.usuario))
        localStorage.setItem('token', result.token || 'token-temporal')

        // ✅ REDIRECCIÓN A HOME PARA TODOS LOS USUARIOS
        console.log('🔄 Redirigiendo a HOME para todos los usuarios...')

        setTimeout(() => {
          console.log('🚀 Redirigiendo a /home')
          window.location.href = '/home'
        }, 100)

      } catch (error) {
        console.error('❌ Error en login:', error)
        // ✅ SIEMPRE MOSTRAR EL MISMO MENSAJE GENERAL POR SEGURIDAD
        errorMessage.value = 'Credenciales incorrectas. Verifique su usuario y contraseña.'
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      // ✅ SOLO VALIDAR CUANDO SE PRESIONA EL BOTÓN
      if (!validateForm()) {
        // Scroll al primer campo con error
        scrollToFirstError()
        return
      }

      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        const registerData = {
          id_usuario: parseInt(formData.value.carnet),
          username: formData.value.username,
          password: formData.value.password
        }

        console.log('📤 Enviando registro con carnet:', registerData)

        await store.register(registerData)
        successMessage.value = '¡Registro exitoso! Ahora puede iniciar sesión.'

        // Limpiar formulario y cambiar a modo login
        formData.value = {
          carnet: '',
          username: '',
          password: '',
          confirmPassword: ''
        }
        showValidationErrors.value = false // ✅ Resetear errores visuales

        setTimeout(() => {
          isRegisterMode.value = false
          successMessage.value = ''
        }, 3000)
      } catch (error) {
        console.error('❌ Error en registro:', error)
        // ✅ EN REGISTRO SÍ PODEMOS MOSTRAR MENSAJES ESPECÍFICOS
        errorMessage.value = error.response?.data?.message ||
          error.message ||
          'Error al registrar usuario. Intente nuevamente.'
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

    return {
      formData,
      errors,
      errorMessage,
      successMessage,
      loading,
      isRegisterMode,
      showValidationErrors,
      handleLogin,
      handleRegister,
      t,
      changeLanguage,
      currentLang
    }
  }
}
</script>

<style scoped>
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

/* ✅ ESTILOS MEJORADOS PARA CAMPOS CON ERROR */
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

/* ✅ EFECTO DE VIBRACIÓN PARA CAMPOS VACÍOS */
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

.demo-accounts {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #a2d2ff;
  font-size: 0.9rem;
}

.demo-accounts h3 {
  margin-bottom: 1rem;
  color: #5a5a5a;
  font-size: 1rem;
}

.account-info p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
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

  .demo-accounts {
    padding: 0.8rem;
    font-size: 0.85rem;
  }

  .account-info p {
    font-size: 0.8rem;
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