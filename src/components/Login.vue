<template>
  <div class="login-container">
    <div class="login-form">
      <div class="logo-container">
        <img src="../assets/logo.jpg" alt="Logo Belleza y Relajación" class="logo">
        <h1>Belleza y Relajación</h1>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input type="text" id="username" v-model="loginData.username" :class="{ error: errors.username }"
            placeholder="Ingrese su usuario" required>
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="loginData.password" :class="{ error: errors.password }"
            placeholder="Ingrese su contraseña" required>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading">Iniciando sesión...</span>
            <span v-else>Iniciar Sesión</span>
          </button>
        </div>

        <div v-if="errorMessage" class="resultado error">
          {{ errorMessage }}
        </div>
      </form>

      <div class="demo-accounts">
        <h3>Cuentas de demostración:</h3>
        <div class="account-info">
          <p><strong>Administrador:</strong> usuario: admin, contraseña: admin123</p>
          <p><strong>Cliente:</strong> usuario: cliente, contraseña: cliente123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAppStore } from '@/stores'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()

    const loginData = ref({
      username: '',
      password: ''
    })

    const errors = ref({})
    const errorMessage = ref('')
    const loading = ref(false)

    const validateForm = () => {
      errors.value = {}

      if (!loginData.value.username.trim()) {
        errors.value.username = 'El usuario es requerido'
      }

      if (!loginData.value.password) {
        errors.value.password = 'La contraseña es requerida'
      }

      return Object.keys(errors.value).length === 0
    }

    const handleLogin = async () => {
      if (!validateForm()) return

      loading.value = true
      errorMessage.value = ''

      try {
        await store.login(loginData.value)
        router.push('/')
      } catch (error) {
        errorMessage.value = error.message
      } finally {
        loading.value = false
      }
    }

    return {
      loginData,
      errors,
      errorMessage,
      loading,
      handleLogin
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
  padding: 2rem;
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
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
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

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
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
  margin-top: 2rem;
}

.demo-accounts {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #a2d2ff;
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
}
</style>
