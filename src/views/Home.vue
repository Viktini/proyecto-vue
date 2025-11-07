<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h2>{{ $t('home.welcome') }}</h2>
          <p>{{ $t('home.description') }}</p>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid" v-if="isCliente">
          <div class="feature-card">
            <img src="@/assets/camilla.jpg" alt="Camilla de spa" class="feature-image" />
          </div>
          <div class="feature-card">
            <img src="@/assets/piedras.jpg" alt="Masaje con piedras" class="feature-image" />
          </div>
          <div class="feature-card">
            <img src="@/assets/toalla.jpg" alt="Toalla y flores relajantes" class="feature-image" />
          </div>
        </div>

        <div class="features-grid" v-if="isAdmin">
          <div class="feature-card">
            <h3>{{ $t('home.adminPanel') }}</h3>
            <p>{{ $t('home.adminDescription') }}</p>
            <router-link to="/admin" class="btn-link">{{ $t('home.goToPanel') }}</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'Home',
  setup() {
    const store = useAppStore()
    const isCliente = computed(() => store.isCliente)
    const isAdmin = computed(() => store.isAdmin)

    return {
      isCliente,
      isAdmin
    }
    // ✅ NO necesita importar i18n aquí
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
    url('../assets/spa.jpg') no-repeat center center/cover;
  padding: 1rem 0;
  text-align: center;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #5a5a5a;
}

.hero p {
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  color: #666;
}

.features {
  padding: 1rem 0;
  background-color: #f0f8ff;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #5a5a5a;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1rem;
}

.feature-card {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #5a5a5a;
}

.feature-card p {
  margin-bottom: 1.5rem;
  color: #666;
}

.feature-image {
  width: 100%;
  height: auto;
  border-radius: 15px;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
</style>
