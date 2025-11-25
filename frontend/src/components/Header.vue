<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <!-- Logo y título a la izquierda -->
        <div class="logo-container">
          <img src="../assets/logo.jpg" alt="Logo" class="logo">
          <h1>{{ $t('header.title') }}</h1>
        </div>

        <!-- Navegación al centro -->
        <nav class="nav">
          <ul>
            <li><router-link to="/home">{{ $t('header.home') }}</router-link></li>
            <li><router-link to="/tratamientos">{{ $t('header.treatments') }}</router-link></li>
            <li><router-link to="/paquetes">{{ $t('header.packages') }}</router-link></li>
            <li v-if="isCliente">
              <router-link to="/mis-reservas">{{ $t('header.MyReservations') }}</router-link>
            </li>

            <!-- Eliminamos el enlace de usuario del menú principal -->
            <li v-if="isAdmin">
              <router-link to="/admin">{{ $t('header.adminPanel') }}</router-link>
            </li>
          </ul>
        </nav>

        <!-- Selector de idioma, usuario y logout a la derecha -->
        <div class="header-right">
          <div class="actions-container">
            <!-- Selector de idioma -->
            <div class="language-selector">
              <select v-model="currentLang" @change="changeLanguage($event.target.value)">
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>

            <!-- Botón de usuario (solo para clientes) -->
            <button v-if="isCliente" @click="irAUsuario" class="user-btn">
              <svg class="user-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="currentColor" />
              </svg>
              <span class="user-text">{{ $t('header.user') }}</span>
            </button>

            <!-- Botón de cerrar sesión -->
            <button @click="logout" class="logout-btn">
              <svg class="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"
                  fill="currentColor" />
              </svg>
              <span class="logout-text">{{ $t('auth.logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useI18nComposable } from '@/composables/useI18n'

export default {
  name: 'Header',
  setup() {
    const store = useAppStore()
    const router = useRouter()
    const { changeLanguage, currentLanguage } = useI18nComposable()

    const currentLang = ref(currentLanguage())

    const isAdmin = computed(() => store.isAdmin)
    const isCliente = computed(() => store.isCliente)

    const logout = () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        store.logout()
        router.push('/login')
      }
    }

    const irAUsuario = () => {
      router.push('/datos-usuario')
    }

    onMounted(() => {
      currentLang.value = currentLanguage()
    })

    return {
      isAdmin,
      isCliente,
      logout,
      irAUsuario,
      changeLanguage,
      currentLang
    }
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.container {
  width: 95%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 15px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* Logo y título - más compacto */
.logo-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.logo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.header h1 {
  color: #5a5a5a;
  font-size: 1.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* Navegación - más compacta */
.nav {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.3rem;
  flex-wrap: nowrap;
  overflow: hidden;
}

.nav li {
  margin: 0;
  flex-shrink: 1;
  min-width: 0;
}

.nav a {
  text-decoration: none;
  color: #5a5a5a;
  font-weight: 500;
  padding: 0.4rem 0.6rem;
  transition: color 0.3s;
  position: relative;
  white-space: nowrap;
  display: block;
  border-radius: 4px;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav a:hover,
.nav a.active {
  color: #ff6b95;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav a.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff6b95;
}

/* Sección derecha (idioma, usuario y logout) - más compacta */
.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.actions-container {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.language-selector select {
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  min-width: 65px;
}

.language-selector select:focus {
  outline: none;
  border-color: #a2d2ff;
}

/* Botón de usuario */
.user-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.user-btn:hover {
  background: #45a049;
}

.user-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.user-text {
  font-size: 0.85rem;
}

/* Botón de cerrar sesión - más compacto */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.3s ease;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #ff5252;
}

.logout-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.logout-text {
  font-size: 0.85rem;
}

/* Responsive - puntos de quiebre ajustados */
@media (max-width: 1200px) {
  .container {
    width: 98%;
  }

  .header h1 {
    font-size: 1.3rem;
  }

  .nav a {
    font-size: 0.8rem;
    padding: 0.35rem 0.5rem;
  }
}

@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    order: 3;
    width: 100%;
  }

  .header-right {
    order: 2;
  }

  .nav ul {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.2rem;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0.8rem 0;
  }

  .container {
    width: 100%;
    padding: 0 10px;
  }

  .logo {
    width: 45px;
    height: 45px;
    margin-right: 10px;
  }

  .header h1 {
    font-size: 1.2rem;
  }

  .nav ul {
    gap: 0.15rem;
  }

  .nav a {
    padding: 0.3rem 0.4rem;
    font-size: 0.75rem;
  }

  .actions-container {
    gap: 0.6rem;
  }

  .language-selector select {
    padding: 0.35rem;
    font-size: 0.75rem;
    min-width: 55px;
  }

  .user-btn,
  .logout-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
    gap: 0.3rem;
  }

  .user-icon,
  .logout-icon {
    width: 14px;
    height: 14px;
  }

  .user-text,
  .logout-text {
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .nav a {
    font-size: 0.7rem;
    padding: 0.25rem 0.3rem;
  }

  .user-text,
  .logout-text {
    display: none;
  }

  .user-btn,
  .logout-btn {
    padding: 0.3rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 0.6rem 0;
  }

  .logo {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }

  .header h1 {
    font-size: 1.1rem;
  }

  .nav ul {
    gap: 0.1rem;
  }

  .nav a {
    padding: 0.2rem 0.25rem;
    font-size: 0.65rem;
  }

  .actions-container {
    gap: 0.4rem;
  }

  .language-selector select {
    padding: 0.3rem;
    font-size: 0.7rem;
    min-width: 50px;
  }

  .user-btn,
  .logout-btn {
    padding: 0.25rem;
    font-size: 0.7rem;
  }

  .user-icon,
  .logout-icon {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 360px) {
  .nav ul {
    flex-direction: column;
    gap: 0.3rem;
  }

  .nav a {
    text-align: center;
    padding: 0.4rem;
    font-size: 0.7rem;
  }

  .actions-container {
    flex-direction: column;
    gap: 0.3rem;
  }

  .user-btn,
  .logout-btn {
    justify-content: center;
    width: 100%;
    padding: 0.4rem;
  }
}
</style>