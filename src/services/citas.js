let citas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    carnet: "12345678",
    telefono: "5551234",
    tratamiento: "Masaje Relajante",
    fecha: "2025-01-20",
    hora: "10:00",
    estado: 'Confirmada',
    fechaCreacion: new Date('2024-12-01')
  }
]

export const citasService = {
  async getCitas() {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...citas]
  },

  async getCitasPorCarnet(carnet) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return citas.filter(cita => cita.carnet === carnet)
  },

  async crearCita(citaData) {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const nuevaCita = {
      id: Date.now(),
      ...citaData,
      estado: 'Confirmada',
      fechaCreacion: new Date()
    }
    
    citas.push(nuevaCita)
    return nuevaCita
  },

  async cancelarCita(id) {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const citaIndex = citas.findIndex(c => c.id === id)
    if (citaIndex !== -1) {
      citas[citaIndex].estado = 'Cancelada'
      return citas[citaIndex]
    } else {
      throw new Error('Cita no encontrada')
    }
  },

  async verificarDisponibilidad(fecha, hora) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const citaExistente = citas.find(cita => 
      cita.fecha === fecha && 
      cita.hora === hora && 
      cita.estado === 'Confirmada'
    )
    
    return {
      disponible: !citaExistente,
      conflicto: citaExistente
    }
  }
}
