export const validators = {
  nombre: (value) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value.trim())
  },
  
  carnet: (value) => {
    return /^\d{1,11}$/.test(value.trim())
  },
  
  telefono: (value) => {
    return /^\d{8}$/.test(value.trim())
  },
  
  email: (value) => {
    return /^[^\s@]+@gmail\.com$/.test(value.trim())
  },
  
  fecha: (value) => {
    const fechaIngresada = new Date(value)
    fechaIngresada.setHours(0, 0, 0, 0)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return fechaIngresada > hoy
  },
  
  hora: (value) => {
    return value.trim() !== ''
  },
  
  select: (value) => {
    return value.trim() !== ''
  },
  
  validarDiaDescanso: (fecha) => {
    const fechaSeleccionada = new Date(fecha)
    const diaSemana = fechaSeleccionada.getDay()
    return diaSemana !== 6 // 6 = Domingo
  },
  
  validarHorarioTrabajo: (fecha, hora) => {
    const fechaSeleccionada = new Date(fecha)
    const diaSemana = fechaSeleccionada.getDay()
    
    if (diaSemana === 5) { // Sábado
      return hora >= '10:00' && hora <= '18:00'
    } else if (diaSemana !== 6) { // Lunes a Viernes
      return hora >= '09:00' && hora <= '20:00'
    }
    
    return false
  }
}

export const applyValidationStyle = (element, isValid) => {
  if (!isValid) {
    element.classList.add('error')
  } else {
    element.classList.remove('error')
  }
}
