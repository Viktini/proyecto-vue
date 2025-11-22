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
  padding: clamp(1rem, 4vw, 3rem) 0;
  text-align: center;
}

.hero h2 {
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  color: #5a5a5a;
}

.hero p {
  font-size: clamp(1rem, 3vw, 1.2rem);
  max-width: min(800px, 90vw);
  margin: 0 auto clamp(1rem, 4vw, 2rem);
  color: #666;
  line-height: 1.6;
}

.features {
  padding: clamp(1rem, 4vw, 3rem) 0;
  background-color: #f0f8ff;
}

.features h2 {
  text-align: center;
  margin-bottom: clamp(1rem, 4vw, 2rem);
  color: #5a5a5a;
  font-size: clamp(1.5rem, 5vw, 2rem);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.feature-card {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: clamp(1rem, 3vw, 2rem);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: min(200px, 40vw);
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  color: #5a5a5a;
  font-size: clamp(1.1rem, 3vw, 1.3rem);
}

.feature-card p {
  margin-bottom: clamp(1rem, 3vw, 1.5rem);
  color: #666;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  line-height: 1.5;
}

.feature-image {
  width: 100%;
  height: auto;
  border-radius: 15px;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-height: min(300px, 50vw);
}

.btn-link {
  display: inline-block;
  padding: clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  background: #ff6b95;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
}

.btn-link:hover {
  background: #e55a82;
  transform: translateY(-2px);
}

/* Ajuste para una sola tarjeta en admin */
.features-grid:has(.feature-card:only-child) {
  grid-template-columns: minmax(auto, 600px);
  justify-content: center;
}
</style>