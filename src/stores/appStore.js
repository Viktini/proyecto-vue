import { defineStore } from 'pinia'

const tratamientos = [
  { id: 1, nombre: "Masaje Relajante", categoria: "Masajes", duracion: 60, precio: 50, descripcion: "Masaje suave para aliviar tensiones" },
  { id: 2, nombre: "Facial Hidratante", categoria: "Faciales", duracion: 45, precio: 40, descripcion: "Hidratación profunda para la piel" },
  { id: 3, nombre: "Manicura Spa", categoria: "Manos y Pies", duracion: 30, precio: 25, descripcion: "Cuidado completo para manos" },
  { id: 4, nombre: "Pedicura Spa", categoria: "Manos y Pies", duracion: 45, precio: 30, descripcion: "Cuidado completo para pies" },
  { id: 5, nombre: "Masaje con Piedras Calientes", categoria: "Masajes", duracion: 75, precio: 70, descripcion: "Terapia con piedras volcánicas calientes" },
  { id: 6, nombre: "Exfoliación Corporal", categoria: "Corporales", duracion: 30, precio: 35, descripcion: "Renovación de la piel con exfoliantes naturales" },

  // NUEVOS TRATAMIENTOS - MASAJES
  { id: 7, nombre: "Masaje Sueco", categoria: "Masajes", duracion: 60, precio: 55, descripcion: "Técnica clásica para relajar músculos" },
  { id: 8, nombre: "Masaje Deportivo", categoria: "Masajes", duracion: 75, precio: 65, descripcion: "Enfocado en atletas y recuperación muscular" },
  { id: 9, nombre: "Masaje con Aromaterapia", categoria: "Masajes", duracion: 60, precio: 60, descripcion: "Combinación de masaje con aceites esenciales" },
  { id: 10, nombre: "Masaje Descontracturante", categoria: "Masajes", duracion: 50, precio: 45, descripcion: "Alivia contracturas y puntos de tensión" },

  // NUEVOS TRATAMIENTOS - FACIALES
  { id: 11, nombre: "Facial Antiedad", categoria: "Faciales", duracion: 60, precio: 75, descripcion: "Tratamiento reafirmante y rejuvenecedor" },
  { id: 12, nombre: "Facial Purificante", categoria: "Faciales", duracion: 50, precio: 55, descripcion: "Limpieza profunda para pieles con impurezas" },
  { id: 13, nombre: "Facial con Vitaminas", categoria: "Faciales", duracion: 45, precio: 60, descripcion: "Cóctel de vitaminas para revitalizar la piel" },

  // NUEVOS TRATAMIENTOS - CORPORALES
  { id: 14, nombre: "Wrapping Corporal", categoria: "Corporales", duracion: 90, precio: 85, descripcion: "Tratamiento reductor y detoxificante" },
  { id: 15, nombre: "Fangoterapia", categoria: "Corporales", duracion: 60, precio: 70, descripcion: "Aplicación de lodos naturales mineralizados" },
  { id: 16, nombre: "Depilación con Cera", categoria: "Corporales", duracion: 45, precio: 35, descripcion: "Depilación profesional suave y duradera" },

  // NUEVOS TRATAMIENTOS - MANOS Y PIES
  { id: 17, nombre: "Uñas Esculpidas", categoria: "Manos y Pies", duracion: 90, precio: 80, descripcion: "Extensiones de uñas con acrílico o gel" },
  { id: 18, nombre: "Spa de Manos Premium", categoria: "Manos y Pies", duracion: 60, precio: 45, descripcion: "Tratamiento completo con parafina" },

  // NUEVOS TRATAMIENTOS - ESPECIALES
  { id: 19, nombre: "Reflexología Podal", categoria: "Especiales", duracion: 50, precio: 40, descripcion: "Terapia de puntos reflejos en los pies" },
  { id: 20, nombre: "Drenaje Linfático", categoria: "Especiales", duracion: 60, precio: 65, descripcion: "Técnica para eliminar toxinas y líquidos" },
  { id: 21, nombre: "Reiki", categoria: "Especiales", duracion: 45, precio: 50, descripcion: "Terapia energética para equilibrio espiritual" },
  { id: 22, nombre: "Acupuntura Facial", categoria: "Especiales", duracion: 60, precio: 90, descripcion: "Técnica milenaria para rejuvenecimiento" }
]

// PAQUETES AMPLIADOS
const paquetes = [
  {
    id: 1,
    nombre: "Día de Spa Completo",
    precio: 120,
    descripcion: "Experiencia completa de bienestar",
    tratamientos: [1, 2, 6],
    duracionTotal: 135,
    categoria: "Premium",
    popular: true
  },
  {
    id: 2,
    nombre: "Relajación Total",
    precio: 90,
    descripcion: "Ideal para liberar tensiones",
    tratamientos: [1, 5],
    duracionTotal: 135,
    categoria: "Relajación",
    popular: false
  },
  {
    id: 3,
    nombre: "Belleza Express",
    precio: 60,
    descripcion: "Cuidado rápido y efectivo",
    tratamientos: [3, 4],
    duracionTotal: 75,
    categoria: "Belleza",
    popular: true
  },
  // NUEVOS PAQUETES - MASAJES
  {
    id: 4,
    nombre: "Terapia de Masajes Intensiva",
    precio: 150,
    descripcion: "Combinación de técnicas avanzadas de masaje",
    tratamientos: [5, 7, 10],
    duracionTotal: 185,
    categoria: "Masajes",
    popular: true
  },
  {
    id: 5,
    nombre: "Masajes Deportivos Premium",
    precio: 110,
    descripcion: "Especial para atletas y personas activas",
    tratamientos: [8, 20],
    duracionTotal: 135,
    categoria: "Deportivo",
    popular: false
  },
  // NUEVOS PAQUETES - FACIALES
  {
    id: 6,
    nombre: "Tratamiento Facial Completo",
    precio: 130,
    descripcion: "Rejuvenecimiento y cuidado facial integral",
    tratamientos: [11, 12, 13],
    duracionTotal: 155,
    categoria: "Facial",
    popular: true
  },
  {
    id: 7,
    nombre: "Facial Antiedad Premium",
    precio: 95,
    descripcion: "Enfoque especializado en rejuvenecimiento",
    tratamientos: [11, 22],
    duracionTotal: 120,
    categoria: "Antiedad",
    popular: false
  },
  // NUEVOS PAQUETES - CORPORALES
  {
    id: 8,
    nombre: "Spa Corporal Detox",
    precio: 140,
    descripcion: "Desintoxicación y renovación corporal",
    tratamientos: [14, 15, 20],
    duracionTotal: 210,
    categoria: "Corporal",
    popular: true
  },
  {
    id: 9,
    nombre: "Depilación y Cuidado Corporal",
    precio: 75,
    descripcion: "Depilación profesional con tratamiento de piel",
    tratamientos: [16, 6],
    duracionTotal: 75,
    categoria: "Corporal",
    popular: false
  },
  // NUEVOS PAQUETES - MANOS Y PIES
  {
    id: 10,
    nombre: "Spa de Manos y Pies Premium",
    precio: 85,
    descripcion: "Cuidado integral para manos y pies",
    tratamientos: [3, 4, 18],
    duracionTotal: 135,
    categoria: "Manos y Pies",
    popular: true
  },
  {
    id: 11,
    nombre: "Uñas Perfectas",
    precio: 100,
    descripcion: "Tratamiento completo de uñas esculpidas",
    tratamientos: [17, 3],
    duracionTotal: 120,
    categoria: "Uñas",
    popular: false
  },
  // NUEVOS PAQUETES - ESPECIALES
  {
    id: 12,
    nombre: "Terapias Alternativas",
    precio: 120,
    descripcion: "Combinación de terapias energéticas y reflejas",
    tratamientos: [19, 21, 20],
    duracionTotal: 155,
    categoria: "Especial",
    popular: true
  },
  {
    id: 13,
    nombre: "Rejuvenecimiento Integral",
    precio: 180,
    descripcion: "Lo mejor para rejuvenecimiento facial y corporal",
    tratamientos: [11, 22, 14, 20],
    duracionTotal: 240,
    categoria: "Premium",
    popular: true
  },
  // NUEVOS PAQUETES - ECONÓMICOS
  {
    id: 14,
    nombre: "Spa Express",
    precio: 70,
    descripcion: "Tratamientos rápidos para días ocupados",
    tratamientos: [1, 3],
    duracionTotal: 90,
    categoria: "Express",
    popular: true
  },
  {
    id: 15,
    nombre: "Bienestar Básico",
    precio: 55,
    descripcion: "Cuidado esencial para el bienestar diario",
    tratamientos: [2, 4],
    duracionTotal: 90,
    categoria: "Básico",
    popular: false
  },
  // NUEVOS PAQUETES - DE LUJO
  {
    id: 16,
    nombre: "Experiencia de Lujo Total",
    precio: 250,
    descripcion: "La máxima experiencia de spa y bienestar",
    tratamientos: [5, 11, 14, 17, 21],
    duracionTotal: 330,
    categoria: "Lujo",
    popular: true
  },
  {
    id: 17,
    nombre: "Día de Reina",
    precio: 200,
    descripcion: "Tratamientos exclusivos para consentirse",
    tratamientos: [9, 13, 18, 19],
    duracionTotal: 255,
    categoria: "Femenino",
    popular: true
  },
  {
    id: 18,
    nombre: "Día de Rey",
    precio: 190,
    descripcion: "Cuidado masculino especializado",
    tratamientos: [8, 12, 16, 10],
    duracionTotal: 230,
    categoria: "Masculino",
    popular: false
  },
  // NUEVOS PAQUETES - TEMPORADA
  {
    id: 19,
    nombre: "Pre-Vacaciones",
    precio: 160,
    descripcion: "Prepárate para las vacaciones",
    tratamientos: [6, 16, 2, 4],
    duracionTotal: 210,
    categoria: "Temporal",
    popular: true
  },
  {
    id: 20,
    nombre: "Post-Vacaciones",
    precio: 140,
    descripcion: "Recuperación después de las vacaciones",
    tratamientos: [1, 20, 12],
    duracionTotal: 170,
    categoria: "Temporal",
    popular: false
  }
]

// Datos predeterminados para restaurar
const citasPredeterminadas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    carnet: "12345678901",
    telefono: "5551234",
    tratamiento: "Masaje Relajante",
    fecha: "2025-01-20",
    hora: "10:00",
    estado: 'Confirmada'
  },
  {
    id: 2,
    nombre: "María García",
    carnet: "8765432101",
    telefono: "5555678",
    tratamiento: "Facial Hidratante",
    fecha: "2025-01-21",
    hora: "14:30",
    estado: 'Confirmada'
  }
]

const paquetesCompradosPredeterminados = [
  {
    id: 1,
    nombre: "María García",
    carnet: "8765432101",
    telefono: "5555678",
    paquete: "Día de Spa Completo",
    tratamientos: ["Masaje Relajante", "Facial Hidratante", "Exfoliación Corporal"],
    fechaInicio: "2025-01-20",
    estado: 'Activo'
  },
  {
    id: 2,
    nombre: "Carlos López",
    carnet: "1122334455",
    telefono: "5559012",
    paquete: "Terapia de Masajes Intensiva",
    tratamientos: ["Masaje con Piedras Calientes", "Masaje Sueco", "Masaje Descontracturante"],
    fechaInicio: "2025-01-22",
    estado: 'Activo'
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    carnet: "6677889900",
    telefono: "5553456",
    paquete: "Tratamiento Facial Completo",
    tratamientos: ["Facial Antiedad", "Facial Purificante", "Facial con Vitaminas"],
    fechaInicio: "2025-01-18",
    estado: 'Cancelado'
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
    tratamientoSeleccionado: null,
    paqueteSeleccionado: null,
    tipoPaqueteSeleccionado: null,
    paquetes: paquetes,
    citas: JSON.parse(JSON.stringify(citasPredeterminadas)), // Deep copy
    paquetesComprados: JSON.parse(JSON.stringify(paquetesCompradosPredeterminados)) // Deep copy
  }),

  getters: {
    isAdmin: (state) => state.auth.role === 'admin',
    isCliente: (state) => state.auth.role === 'cliente',
    citasPorCarnet: (state) => (carnet) => {
      return state.citas.filter(cita => cita.carnet === carnet)
    },
    paquetesPorCarnet: (state) => (carnet) => state.paquetesComprados.filter(paquete => paquete.carnet === carnet),

    // Nuevos getters para paquetes
    paquetesPorCategoria: (state) => (categoria) => {
      return state.paquetes.filter(paquete => paquete.categoria === categoria)
    },
    paquetesPopulares: (state) => {
      return state.paquetes.filter(paquete => paquete.popular)
    },
    paquetesPorPrecio: (state) => (min, max) => {
      return state.paquetes.filter(paquete => paquete.precio >= min && paquete.precio <= max)
    },
    categoriasPaquetes: (state) => {
      const categorias = [...new Set(state.paquetes.map(p => p.categoria))]
      return categorias.sort()
    },

    // Getters útiles mantenidos
    citasConfirmadas: (state) => state.citas.filter(cita => cita.estado === 'Confirmada'),
    paquetesActivos: (state) => state.paquetesComprados.filter(paquete => paquete.estado === 'Activo'),
    totalCitas: (state) => state.citas.length,
    totalPaquetesComprados: (state) => state.paquetesComprados.length,

    // Nuevo getter para estadísticas
    estadisticasPaquetes: (state) => {
      const total = state.paquetes.length
      const categorias = state.categoriasPaquetes.length
      const precioMin = Math.min(...state.paquetes.map(p => p.precio))
      const precioMax = Math.max(...state.paquetes.map(p => p.precio))
      const populares = state.paquetesPopulares.length

      return {
        total,
        categorias,
        precioMin,
        precioMax,
        populares,
        rangoPrecio: `$${precioMin} - $${precioMax}`
      }
    }
  },

  actions: {
    async login(credentials) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { username, password } = credentials

          if (username === 'admin' && password === 'admin123') {
            this.auth.isAuthenticated = true
            this.auth.user = {
              nombre: 'Administrador General',
              carnet: '00000000000',
              telefono: '55500000',
              email: 'admin@gmail.com',
              usuario: 'admin',
              contrasenna: 'admin123',
              observaciones: 'Acceso completo al sistema'
            }
            this.auth.role = 'admin'
            resolve({
              user: this.auth.user,
              role: 'admin',
              message: 'Login exitoso como administrador'
            })

          } else if (username === 'cliente' && password === 'cliente123') {
            this.auth.isAuthenticated = true
            this.auth.user = {
              nombre: 'Juan',
              carnet: '12345678901',
              telefono: '55512345',
              email: 'cliente@gmail.com',
              usuario: 'cliente',
              contrasenna: 'cliente123',
              observaciones: ''
            }
            this.auth.role = 'cliente'
            resolve({
              user: this.auth.user,
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
      // Restaurar citas a los valores predeterminados usando deep copy
      this.citas = JSON.parse(JSON.stringify(citasPredeterminadas))

      // Restaurar paquetes comprados a los valores predeterminados usando deep copy
      this.paquetesComprados = JSON.parse(JSON.stringify(paquetesCompradosPredeterminados))

      // Limpiar datos de autenticación
      this.auth.isAuthenticated = false
      this.auth.user = null
      this.auth.role = null

      // Limpiar selecciones
      this.tratamientoSeleccionado = null
      this.paqueteSeleccionado = null
      this.tipoPaqueteSeleccionado = null

      console.log('Datos restaurados a valores predeterminados:')
      console.log('Citas:', this.citas)
      console.log('Paquetes comprados:', this.paquetesComprados)
    },

    async reservarCita(citaData) {
      return new Promise((resolve) => {
        // Usar un ID único basado en timestamp para evitar conflictos
        const nuevaCita = {
          id: Date.now() + Math.floor(Math.random() * 1000), // ID más único
          ...citaData,
          estado: 'Confirmada',
          fechaReserva: new Date().toISOString()
        }
        this.citas.push(nuevaCita)
        resolve(nuevaCita)
      })
    },

    async cancelarCita(id) {
      return new Promise((resolve, reject) => {
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
          reject(new Error('Cita no encontrada'))
        }
      })
    },

    async comprarPaquete(paqueteData) {
      return new Promise((resolve, reject) => {
        try {
          console.log('Comprando paquete con datos:', paqueteData)

          // Validar datos requeridos
          if (!paqueteData.nombre || !paqueteData.carnet) {
            reject(new Error('Datos del cliente son requeridos'))
            return
          }

          let paqueteInfo = null
          let nombresTratamientos = []
          let precioTotal = 0
          let nombrePaquete = ''
          let descripcionPaquete = ''

          // Determinar si es paquete predefinido o personalizado
          if (paqueteData.paqueteId && paqueteData.paqueteId !== -1) {
            // Paquete predefinido
            paqueteInfo = this.paquetes.find(p => p.id === paqueteData.paqueteId)
            if (!paqueteInfo) {
              reject(new Error('Paquete no encontrado'))
              return
            }
            nombresTratamientos = paqueteInfo.tratamientos.map(id => {
              const tratamiento = this.tratamientos.find(t => t.id === id)
              return tratamiento ? tratamiento.nombre : `Tratamiento ${id}`
            })
            precioTotal = paqueteInfo.precio
            nombrePaquete = paqueteInfo.nombre
            descripcionPaquete = paqueteInfo.descripcion
          } else {
            // Paquete personalizado
            nombresTratamientos = paqueteData.tratamientos || []
            precioTotal = paqueteData.precioPersonalizado || 0
            nombrePaquete = 'Paquete Personalizado'
            descripcionPaquete = 'Paquete creado con tratamientos seleccionados por el cliente'
          }

          console.log('Información del paquete procesada:', {
            paqueteInfo,
            nombresTratamientos,
            precioTotal,
            nombrePaquete
          })

          // CORRECCIÓN: Generar ID basado en los paquetes del usuario específico
          const carnetUsuario = paqueteData.carnet

          // Obtener todos los paquetes del usuario (activos e inactivos)
          const paquetesDelUsuario = this.paquetesComprados.filter(p => p.carnet === carnetUsuario)

          // Calcular el nuevo ID
          let nuevoId
          if (paquetesDelUsuario.length === 0) {
            // Si el usuario no tiene paquetes, empieza con ID 1
            nuevoId = 1
          } else {
            // Si ya tiene paquetes, toma el máximo ID y le suma 1
            const maxId = Math.max(...paquetesDelUsuario.map(p => p.id))
            nuevoId = maxId + 1
          }

          console.log('Generando nuevo ID para usuario:', carnetUsuario)
          console.log('Paquetes del usuario:', paquetesDelUsuario.length)
          console.log('Nuevo ID:', nuevoId)

          // Crear el nuevo paquete comprado
          const nuevoPaquete = {
            id: nuevoId,
            nombre: paqueteData.nombre,
            carnet: paqueteData.carnet,
            telefono: paqueteData.telefono || '',
            email: paqueteData.email || '',
            observaciones: paqueteData.observaciones || '',
            paqueteId: paqueteData.paqueteId || -1,
            nombrePaquete: nombrePaquete,
            descripcionPaquete: descripcionPaquete,
            precioPaquete: precioTotal,
            tratamientos: nombresTratamientos,
            estado: 'Activo',
            fechaCompra: new Date().toISOString(),
            fechaInicio: paqueteData.fechaInicio || new Date().toISOString().split('T')[0]
          }

          console.log('Nuevo paquete a agregar:', nuevoPaquete)

          this.paquetesComprados.push(nuevoPaquete)

          console.log('Paquetes comprados actualizados:', this.paquetesComprados)

          resolve(nuevoPaquete)
        } catch (error) {
          console.error('Error en comprarPaquete:', error)
          reject(error)
        }
      })
    },

    limpiarSeleccionPaquete() {
      this.paqueteSeleccionado = null
      this.tipoPaqueteSeleccionado = null
    },

    async cancelarPaquete(id) {
      return new Promise((resolve, reject) => {
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
          reject(new Error('Paquete no encontrado'))
        }
      })
    },

    seleccionarTratamiento(tratamiento) {
      this.tratamientoSeleccionado = tratamiento
    },

    // Nuevo método para seleccionar paquete
    seleccionarPaquete(paquete) {
      this.paqueteSeleccionado = paquete
    },

    async actualizarDatosUsuario(datosActualizados) {
      return new Promise((resolve) => {
        const carnetAnterior = this.auth.user?.carnet
        const nuevoCarnet = datosActualizados.carnet

        // 1. Actualizar los datos del usuario en el store
        this.auth.user = {
          ...this.auth.user,
          ...datosActualizados
        }

        // 2. Actualizar todas las citas del usuario
        if (carnetAnterior && carnetAnterior !== nuevoCarnet) {
          // Si cambió el carnet, actualizar por carnet anterior
          this.citas.forEach(cita => {
            if (cita.carnet === carnetAnterior) {
              cita.nombre = datosActualizados.nombre
              cita.carnet = nuevoCarnet
              cita.telefono = datosActualizados.telefono
              cita.email = datosActualizados.email
            }
          })
        } else {
          // Si no cambió el carnet, actualizar por carnet actual
          this.citas.forEach(cita => {
            if (cita.carnet === nuevoCarnet) {
              cita.nombre = datosActualizados.nombre
              cita.telefono = datosActualizados.telefono
              cita.email = datosActualizados.email
            }
          })
        }

        // 3. Actualizar todos los paquetes del usuario
        if (carnetAnterior && carnetAnterior !== nuevoCarnet) {
          // Si cambió el carnet, actualizar por carnet anterior
          this.paquetesComprados.forEach(paquete => {
            if (paquete.carnet === carnetAnterior) {
              paquete.nombre = datosActualizados.nombre
              paquete.carnet = nuevoCarnet
              paquete.telefono = datosActualizados.telefono
              paquete.email = datosActualizados.email
            }
          })
        } else {
          // Si no cambió el carnet, actualizar por carnet actual
          this.paquetesComprados.forEach(paquete => {
            if (paquete.carnet === nuevoCarnet) {
              paquete.nombre = datosActualizados.nombre
              paquete.telefono = datosActualizados.telefono
              paquete.email = datosActualizados.email
            }
          })
        }

        resolve({
          success: true,
          message: 'Datos actualizados correctamente en todas sus reservas y paquetes',
          user: this.auth.user
        })
      })
    }
  }
})