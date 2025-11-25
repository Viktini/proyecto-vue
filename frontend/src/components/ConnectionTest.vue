<!-- frontend/src/components/ConnectionTest.vue -->
<template>
    <div class="connection-test">
      <div class="vue-header">
        <h1>🖖 Vue.js + NestJS + PostgreSQL</h1>
        <p>Prueba de Conexión Full Stack</p>
      </div>
      
      <!-- Estado de Conexión -->
      <div class="status-card" :class="connectionClass">
        <h2>🔗 Estado de la Conexión</h2>
        <p class="status-message">{{ backendStatus }}</p>
        <div class="connection-info">
          <span>Backend: http://localhost:5000</span>
          <span>Frontend: http://localhost:3000</span>
        </div>
        <button @click="testConnection" class="btn-test">
          🔄 Probar Conexión
        </button>
      </div>
  
      <!-- Pruebas Interactivas -->
      <div class="tests-grid">
        <!-- Test de Mensaje -->
        <div class="test-card">
          <h3>💬 Enviar Mensaje de Prueba</h3>
          <div class="input-group">
            <input
              v-model="testMessage"
              placeholder="Escribe un mensaje para NestJS..."
              @keyup.enter="handleSendMessage"
            />
            <button @click="handleSendMessage" :disabled="!testMessage">
              📨 Enviar
            </button>
          </div>
        </div>
  
        <!-- Gestión de Usuarios -->
        <div class="test-card">
          <h3>👥 Gestión de Usuarios</h3>
          
          <form @submit.prevent="handleCreateUser" class="user-form">
            <input v-model="newUser.name" placeholder="Nombre" required />
            <input v-model="newUser.lastName" placeholder="Apellido" required />
            <input v-model="newUser.email" type="email" placeholder="Email" required />
            <button type="submit" class="btn-success">
              ➕ Crear Usuario
            </button>
          </form>
  
          <button @click="handleGetUsers" class="btn-primary">
            📋 Obtener Usuarios
          </button>
  
          <div v-if="users.length > 0" class="users-list">
            <h4>Usuarios en PostgreSQL:</h4>
            <div v-for="user in users" :key="user.id" class="user-item">
              <strong>{{ user.name }} {{ user.last_name }}</strong>
              <span>{{ user.email }}</span>
              <small>Creado: {{ formatDate(user.created_at) }}</small>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Respuesta del Backend -->
      <div v-if="response" class="response-card">
        <h3>📦 Respuesta del Backend NestJS</h3>
        <pre>{{ formattedResponse }}</pre>
      </div>
  
      <!-- Logs de Consola -->
      <div class="console-card">
        <h3>📝 Logs de Comunicación</h3>
        <p>Revisa la consola del navegador para ver la comunicación en tiempo real entre Vue.js y NestJS</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed } from 'vue';
  import { testBackendConnection, sendTestMessage, getUsers, createUser } from '../services/api';
  
  export default {
    name: 'ConnectionTest',
    setup() {
      const backendStatus = ref('⏳ Probando conexión con NestJS...');
      const testMessage = ref('');
      const response = ref(null);
      const users = ref([]);
      const newUser = ref({
        name: '',
        lastName: '',
        email: ''
      });
  
      const connectionClass = computed(() => {
        if (backendStatus.value.includes('✅')) return 'connected';
        if (backendStatus.value.includes('❌')) return 'error';
        return 'connecting';
      });
  
      const formattedResponse = computed(() => {
        return JSON.stringify(response.value, null, 2);
      });
  
      const testConnection = async () => {
        try {
          backendStatus.value = '🔄 Conectando con NestJS...';
          const health = await testBackendConnection();
          backendStatus.value = `✅ ${health.status}`;
          response.value = health;
        } catch (error) {
          backendStatus.value = '❌ Error de conexión';
          response.value = { error: error.message };
        }
      };
  
      const handleSendMessage = async () => {
        if (!testMessage.value) return;
        
        try {
          const result = await sendTestMessage(testMessage.value);
          response.value = result;
          testMessage.value = '';
        } catch (error) {
          response.value = { error: error.message };
        }
      };
  
      const handleGetUsers = async () => {
        try {
          const usersData = await getUsers();
          users.value = usersData;
          response.value = { 
            message: `✅ Se obtuvieron ${usersData.length} usuarios de PostgreSQL`,
            count: usersData.length
          };
        } catch (error) {
          response.value = { error: error.message };
        }
      };
  
      const handleCreateUser = async () => {
        try {
          const createdUser = await createUser(newUser.value);
          response.value = { 
            message: '✅ Usuario creado exitosamente en PostgreSQL', 
            user: createdUser 
          };
          newUser.value = { name: '', lastName: '', email: '' };
          await handleGetUsers(); // Actualizar lista
        } catch (error) {
          response.value = { error: error.message };
        }
      };
  
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-ES');
      };
  
      // Probar conexión al cargar el componente
      testConnection();
  
      return {
        backendStatus,
        testMessage,
        response,
        users,
        newUser,
        connectionClass,
        formattedResponse,
        testConnection,
        handleSendMessage,
        handleGetUsers,
        handleCreateUser,
        formatDate
      };
    }
  };
  </script>
  
  <style scoped>
  .connection-test {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .vue-header {
    text-align: center;
    margin-bottom: 2rem;
    background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
  }
  
  .vue-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .status-card {
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
  }
  
  .status-card.connected {
    background: #e8f5e8;
    border-left: 4px solid #42b883;
  }
  
  .status-card.connecting {
    background: #fff3cd;
    border-left: 4px solid #ffc107;
  }
  
  .status-card.error {
    background: #f8d7da;
    border-left: 4px solid #dc3545;
  }
  
  .status-message {
    font-size: 1.2rem;
    font-weight: bold;
    margin: 1rem 0;
  }
  
  .connection-info {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    font-family: monospace;
    background: rgba(0,0,0,0.05);
    padding: 0.5rem;
    border-radius: 6px;
  }
  
  .tests-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .test-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border: 1px solid #e1e5e9;
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  
  .input-group input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  .user-form {
    margin: 1rem 0;
  }
  
  .user-form input {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .btn-test {
    background: #007bff;
    color: white;
  }
  
  .btn-primary {
    background: #6c757d;
    color: white;
    width: 100%;
    margin: 0.5rem 0;
  }
  
  .btn-success {
    background: #42b883;
    color: white;
    width: 100%;
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .users-list {
    margin-top: 1rem;
  }
  
  .user-item {
    background: #f8f9fa;
    padding: 1rem;
    margin: 0.5rem 0;
    border-radius: 6px;
    border-left: 3px solid #42b883;
  }
  
  .user-item strong {
    display: block;
    color: #2c3e50;
  }
  
  .response-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin: 1rem 0;
  }
  
  .response-card pre {
    background: white;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
  }
  
  .console-card {
    background: #2c3e50;
    color: white;
    padding: 1rem;
    border-radius: 6px;
    font-family: monospace;
  }
  </style>