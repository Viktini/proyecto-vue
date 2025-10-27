// Simulación de servicio de autenticación
const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'cliente',
    password: 'cliente123', 
    role: 'cliente',
    name: 'Cliente Demo'
  }
]

export const authService = {
  async login(credentials) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = users.find(u => 
      u.username === credentials.username && 
      u.password === credentials.password
    )
    
    if (user) {
      // En una app real, aquí se guardaría el token
      const { password, ...userWithoutPassword } = user
      return {
        success: true,
        user: userWithoutPassword,
        token: 'simulated-jwt-token'
      }
    } else {
      throw new Error('Credenciales inválidas')
    }
  },

  async logout() {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))
    // En una app real, aquí se limpiaría el token
    return { success: true }
  },

  validateToken(token) {
    // Simular validación de token
    return Promise.resolve(true)
  }
}
