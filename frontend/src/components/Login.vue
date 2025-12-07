<!-- Login.vue - VERSIÓN CORREGIDA -->
<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo-container">
        <img src="../assets/logo.jpg" alt="Logo Belleza y Relajación" class="logo">
        <h1>Belleza y Relajación</h1>
      </div>

      <div class="mode-selector">
        <button @click="toggleMode(false)" :class="{ active: !isRegisterMode }" class="mode-btn">
          Iniciar Sesión
        </button>
        <button @click="toggleMode(true)" :class="{ active: isRegisterMode }" class="mode-btn">
          Registrarse
        </button>
      </div>

      <form @submit.prevent="isRegisterMode ? handleRegister() : handleLogin()">
        <div v-if="isRegisterMode" class="form-group">
          <label for="carnet">Carnet de Identidad</label>
          <input type="text" id="carnet" v-model="formData.carnet" @input="filterCarnetInput" maxlength="11" :class="{
            error: showValidationErrors && (errors.carnet || !formData.carnet),
            'empty-field': showValidationErrors && !formData.carnet
          }" placeholder="Ingrese 11 dígitos numéricos" required>
          <span v-if="showValidationErrors && errors.carnet" class="error-message">{{ errors.carnet }}</span>
          <span v-else-if="showValidationErrors && !formData.carnet" class="error-message">
            El carnet de identidad es requerido
          </span>
          <span class="hint">Debe contener exactamente 11 dígitos numéricos</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRouter } from 'vue-router'

// ✅ DEFINIR appStore aquí
const appStore = useAppStore()
const router = useRouter()

// Estado reactivo
const isRegisterMode = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showValidationErrors = ref(false)

// Datos del formulario
const formData = ref({
  carnet: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({})

// ✅ FUNCIÓN: Cambiar modo
const toggleMode = (registerMode) => {
  if (isRegisterMode.value === registerMode) return

  isRegisterMode.value = registerMode
  formData.value = { carnet: '', username: '', password: '', confirmPassword: '' }
  errors.value = {}
  errorMessage.value = ''
  successMessage.value = ''
  showValidationErrors.value = false
}

// ✅ FUNCIÓN: Filtrar carnet (solo números)
const filterCarnetInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length > 11) {
    value = value.slice(0, 11)
  }
  formData.value.carnet = value
}

// ✅ FUNCIÓN: Validación
const validateField = (fieldName) => {
  const value = formData.value[fieldName]
  const trimmedValue = typeof value === 'string' ? value.trim() : value

  switch (fieldName) {
    case 'carnet':
      if (!value) {
        errors.value.carnet = 'El carnet de identidad es requerido'
      } else if (!/^\d+$/.test(value)) {
        errors.value.carnet = 'El carnet solo debe contener números'
      } else if (value.length !== 11) {
        errors.value.carnet = 'El carnet debe tener exactamente 11 dígitos'
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
  showValidationErrors.value = true

  if (isRegisterMode.value) validateField('carnet')
  validateField('username')
  validateField('password')
  if (isRegisterMode.value) validateField('confirmPassword')

  return Object.keys(errors.value).length === 0
}

// ✅ FUNCIÓN: Login CORREGIDA (appStore ahora está definido)
const handleLogin = async () => {
  if (!validateForm()) {
    scrollToFirstError()
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    console.log('📤 Iniciando login...')

    // ✅ AHORA appStore está definido
    await appStore.login({
      username: formData.value.username,
      password: formData.value.password
    })

    console.log('✅ Login exitoso')
    successMessage.value = '¡Inicio de sesión exitoso!'

    // Redirigir después de 1 segundo
    setTimeout(() => {
      router.push('/home')
    }, 1000)

  } catch (error) {
    console.error('❌ Error en login:', error)
    errorMessage.value = error.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}

// ✅ FUNCIÓN: Register CORREGIDA
const handleRegister = async () => {
  if (!validateForm()) {
    scrollToFirstError()
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    console.log('📤 Registrando...')

    // ✅ AHORA appStore está definido
    await appStore.register({
      carnet: formData.value.carnet,
      username: formData.value.username,
      password: formData.value.password
    })

    console.log('✅ Registro exitoso')
    successMessage.value = '¡Registro exitoso! Redirigiendo...'

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      router.push('/home')
    }, 1500)

  } catch (error) {
    console.error('❌ Error en registro:', error)
    errorMessage.value = error.message || 'Error al registrar usuario'
  } finally {
    loading.value = false
  }
}

const scrollToFirstError = () => {
  setTimeout(() => {
    const firstErrorInput = document.querySelector('.form-group input.error')
    if (firstErrorInput) {
      firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstErrorInput.focus()
    }
  }, 100)
}
</script> Datos inválidos en localStorage, limpiando...
App.vue:25 🚀 App montada - Verificando sesión...
index.js:83 🛡️ Router guard - Verificando ruta: /home
index.js:89 👤 Usuario en localStorage: No autenticado
index.js:111 🚫 No autenticado - Redirigiendo a login
index.js:83 🛡️ Router guard - Verificando ruta: /login
index.js:89 👤 Usuario en localStorage: No autenticado
App.vue:38 ✅ Sesión verificada, usuario autenticado
Login.vue:210 📤 Iniciando login...
appStore.js:84 📤 Enviando login: {username: 'yan', password: 'yan123'}
appStore.js:102 ✅ Login exitoso: {message: 'Login successful', usuario: {…}}
Login.vue:218 ✅ Login exitoso
index.js:83 🛡️ Router guard - Verificando ruta: /home
index.js:89 👤 Usuario en localStorage: undefined
index.js:139 ✅ Acceso permitido a: /home
Home.vue:87 🏠 Home - Montando componente
Home.vue:92 ✅ Home - Usuario cargado: Proxy(Object) {}
Home.vue:98 ✅ Store sincronizado con localStorage

<style scoped>
/* Aplicar Arial a todos los textos */
.login-container,
.login-form,
.logo-container h1,
.mode-btn,
.form-group label,
.form-group input,
.form-group span,
.btn,
.resultado,
.hint,
.error-message {
  font-family: Arial, sans-serif;
}

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
  font-family: Arial, sans-serif;
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
  font-family: Arial, sans-serif;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
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
  font-family: Arial, sans-serif;
}

/* ✅ NUEVO ESTILO PARA HINT/TEXTO DE AYUDA */
.hint {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  padding-left: 0.25rem;
  font-family: Arial, sans-serif;
}

/* ✅ ESTILO MEJORADO PARA INPUT DE CARNET */
.form-group input[maxlength="11"] {
  letter-spacing: 0.5px;
  font-size: 1.1rem;
  font-family: Arial, sans-serif;
  /* Misma fuente que los demás */
}

/* Estilo para el placeholder del carnet */
.form-group input[placeholder*="dígitos"]::placeholder {
  font-size: 0.9rem;
  color: #999;
  font-family: Arial, sans-serif;
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
  font-family: Arial, sans-serif;
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
  font-family: Arial, sans-serif;
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
  font-family: Arial, sans-serif;
}

.demo-accounts h3 {
  margin-bottom: 1rem;
  color: #5a5a5a;
  font-size: 1rem;
  font-family: Arial, sans-serif;
}

.account-info p {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.4;
  font-family: Arial, sans-serif;
}

/* Nota en las cuentas demo */
.demo-accounts .note {
  font-style: italic;
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  border-top: 1px solid #eee;
  padding-top: 0.5rem;
  font-family: Arial, sans-serif;
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