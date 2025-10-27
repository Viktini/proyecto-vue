// Simulación de servicio para gestión de paquetes
let paquetesComprados = [
  {
    id: 1,
    nombre: "María García",
    carnet: "87654321",
    telefono: "5555678",
    paquete: "Día de Spa Completo",
    tratamientos: ["Masaje Relajante", "Facial Hidratante", "Exfoliación Corporal"],
    fechaInicio: "2025-01-20",
    estado: 'Activo',
    fechaCompra: new Date('2024-12-01')
  }
]

export const paquetesService = {
  async getPaquetesComprados() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...paquetesComprados]
  },

  async getPaquetesPorCarnet(carnet) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return paquetesComprados.filter(paquete => paquete.carnet === carnet)
  },

  async comprarPaquete(paqueteData) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const nuevoPaquete = {
      id: Date.now(),
      ...paqueteData,
      estado: 'Activo',
      fechaCompra: new Date()
    }
    
    paquetesComprados.push(nuevoPaquete)
    return nuevoPaquete
  },

  async cancelarPaquete(id) {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const paqueteIndex = paquetesComprados.findIndex(p => p.id === id)
    if (paqueteIndex !== -1) {
      paquetesComprados[paqueteIndex].estado = 'Cancelado'
      return paquetesComprados[paqueteIndex]
    } else {
      throw new Error('Paquete no encontrado')
    }
  },

  async getEstadisticas() {
    await new Promise(resolve => setTimeout(resolve, 700))
    
    const total = paquetesComprados.length
    const activos = paquetesComprados.filter(p => p.estado === 'Activo').length
    const cancelados = paquetesComprados.filter(p => p.estado === 'Cancelado').length
    
    return {
      total,
      activos,
      cancelados,
      tasaCancelacion: total > 0 ? (cancelados / total) * 100 : 0
    }
  }
}
