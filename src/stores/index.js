import { defineStore } from 'pinia'

// Datos de ejemplo
const tratamientos = [
  { id: 1, nombre: "Masaje Relajante", categoria: "Masajes", duracion: 60, precio: 50, descripcion: "Masaje suave para aliviar tensiones" },
  { id: 2, nombre: "Facial Hidratante", categoria: "Faciales", duracion: 45, precio: 40, descripcion: "Hidratación profunda para la piel" },
  { id: 3, nombre: "Manicura Spa", categoria: "Manos y Pies", duracion: 30, precio: 25, descripcion: "Cuidado completo para manos" },
  { id: 4, nombre: "Pedicura Spa", categoria: "Manos y Pies", duracion: 45, precio: 30, descripcion: "Cuidado completo para pies" },
  { id: 5, nombre: "Masaje con Piedras Calientes", categoria: "Masajes", duracion: 75, precio: 70, descripcion: "Terapia con piedras volcánicas calientes" },
  { id: 6, nombre: "Exfoliación Corporal", categoria: "Corporales", duracion: 30, precio: 35, descripcion: "Renovación de la piel con exfoliantes naturales" }
]

const paquetes = [
  {
    id: 1,
    nombre: "Día de Spa Completo",
    precio: 120,
    descripcion: "Experiencia completa de bienestar",
    tratamientos: [1, 2, 6]
  },
  {
    id: 2,
    nombre: "Relajación Total",
    precio: 90,
    descripcion: "Ideal para liberar tensiones",
    tratamientos: [1, 5]
  },
  {
    id: 3,
    nombre: "Belleza Express",
    precio: 60,
    descripcion: "Cuidado rápido y efectivo",
    tratamientos: [3, 4]
  }
]

export const useAppStore = defineStore('app', {
  state: () => ({
    auth: {
      isAuthenticated: false,
      user: null,
      role: null
    },
    tratamientos: tratamientos,
    paquetes: paquetes,
    citas: [
      {
        id: 1,
        nombre: "Juan Pérez",
        carnet: "12345678",
        telefono: "555-1234",
        tratamiento: "Masaje Relajante",
        fecha: "2025-01-20",
        hora: "10:00",
        estado: 'Confirmada'
      }
    ],
    paquetesComprados: [
      {
        id: 1,
        nombre: "María García",
        carnet: "87654321",
        telefono: "555-5678",
        paquete: "Día de Spa Completo",
        tratamientos: ["Masaje Relajante", "Facial Hidratante", "Exfoliación Corporal"],
        fechaInicio: "2025-01-20",
        estado: 'Activo'
      }
    ]
  }),

  getters: {
    isAdmin: (state) => state.auth.role === 'admin',
    isCliente: (state) => state.auth.role === 'cliente',
    citasPorCarnet: (state) => (carnet) => state.citas.filter(cita => cita.carnet === carnet),
    paquetesPorCarnet: (state) => (carnet) => state.paquetesComprados.filter(paquete => paquete.carnet === carnet),

    // Getters adicionales útiles
    citasConfirmadas: (state) => state.citas.filter(cita => cita.estado === 'Confirmada'),
    citasCanceladas: (state) => state.citas.filter(cita => cita.estado === 'Cancelada'),
    paquetesActivos: (state) => state.paquetesComprados.filter(paquete => paquete.estado === 'Activo'),
    paquetesCancelados: (state) => state.paquetesComprados.filter(paquete => paquete.estado === 'Cancelado'),

    // Estadísticas
    totalCitas: (state) => state.citas.length,
    totalPaquetesComprados: (state) => state.paquetesComprados.length,
    citasHoy: (state) => {
      const hoy = new Date().toISOString().split('T')[0]
      return state.citas.filter(cita => cita.fecha === hoy && cita.estado === 'Confirmada')
    }
  },

  actions: {
    login(credentials) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { username, password } = credentials

          if (username === 'admin' && password === 'admin123') {
            this.auth.isAuthenticated = true
            this.auth.user = username
            this.auth.role = 'admin'
            resolve({
              user: username,
              role: 'admin',
              message: 'Login exitoso como administrador'
            })
          } else if (username === 'cliente' && password === 'cliente123') {
            this.auth.isAuthenticated = true
            this.auth.user = username
            this.auth.role = 'cliente'
            resolve({
              user: username,
              role: 'cliente',
              message: 'Login exitoso como cliente'
            })
          } else {
            reject(new Error('Credenciales inválidas. Use admin/admin123 o cliente/cliente123'))
          }
        }, 1000)
      })
    },

    logout() {
      this.auth.isAuthenticated = false
      this.auth.user = null
      this.auth.role = null
    },

    reservarCita(citaData) {
      return new Promise((resolve) => {
        const nuevaCita = {
          id: Date.now(),
          ...citaData,
          estado: 'Confirmada',
          fechaReserva: new Date().toISOString()
        }
        this.citas.push(nuevaCita)
        resolve(nuevaCita)
      })
    },

    cancelarCita(id) {
      return new Promise((resolve) => {
        const cita = this.citas.find(c => c.id === id)
        if (cita) {
          cita.estado = 'Cancelada'
          cita.fechaCancelacion = new Date().toISOString()
          resolve({
            success: true,
            message: 'Cita cancelada exitosamente',
            cita
          })
        } else {
          resolve({
            success: false,
            message: 'Cita no encontrada'
          })
        }
      })
    },

    comprarPaquete(paqueteData) {
      return new Promise((resolve) => {
        const nuevoPaquete = {
          id: Date.now(),
          ...paqueteData,
          estado: 'Activo',
          fechaCompra: new Date().toISOString()
        }
        this.paquetesComprados.push(nuevoPaquete)
        resolve(nuevoPaquete)
      })
    },

    cancelarPaquete(id) {
      return new Promise((resolve) => {
        const paquete = this.paquetesComprados.find(p => p.id === id)
        if (paquete) {
          paquete.estado = 'Cancelado'
          paquete.fechaCancelacion = new Date().toISOString()
          resolve({
            success: true,
            message: 'Paquete cancelado exitosamente',
            paquete
          })
        } else {
          resolve({
            success: false,
            message: 'Paquete no encontrado'
          })
        }
      })
    },

    // Acciones adicionales para gestión de datos
    agregarTratamiento(tratamiento) {
      const nuevoTratamiento = {
        id: Math.max(...this.tratamientos.map(t => t.id)) + 1,
        ...tratamiento
      }
      this.tratamientos.push(nuevoTratamiento)
      return nuevoTratamiento
    },

    agregarPaquete(paquete) {
      const nuevoPaquete = {
        id: Math.max(...this.paquetes.map(p => p.id)) + 1,
        ...paquete
      }
      this.paquetes.push(nuevoPaquete)
      return nuevoPaquete
    },

    // Limpiar datos (útil para testing)
    limpiarDatos() {
      this.citas = []
      this.paquetesComprados = []
    },

    // Cargar datos de ejemplo
    cargarDatosEjemplo() {
      this.citas = [
        {
          id: 1,
          nombre: "Juan Pérez",
          carnet: "12345678",
          telefono: "555-1234",
          tratamiento: "Masaje Relajante",
          fecha: "2025-01-20",
          hora: "10:00",
          estado: 'Confirmada'
        }
      ]
      this.paquetesComprados = [
        {
          id: 1,
          nombre: "María García",
          carnet: "87654321",
          telefono: "555-5678",
          paquete: "Día de Spa Completo",
          tratamientos: ["Masaje Relajante", "Facial Hidratante", "Exfoliación Corporal"],
          fechaInicio: "2025-01-20",
          estado: 'Activo'
        }
      ]
    },

    // Busquedas avanzadas
    buscarCitasPorFecha(fecha) {
      return this.citas.filter(cita => cita.fecha === fecha)
    },

    buscarPaquetesPorEstado(estado) {
      return this.paquetesComprados.filter(paquete => paquete.estado === estado)
    },

    // Obtener tratamiento por ID
    getTratamientoById(id) {
      return this.tratamientos.find(t => t.id === id)
    },

    // Obtener paquete por ID
    getPaqueteById(id) {
      return this.paquetes.find(p => p.id === id)
    }
  }
})

// Exportación por defecto para compatibilidad
export default useAppStore