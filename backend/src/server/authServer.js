// server/authServer.js
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
const PORT = 5000
const JWT_SECRET = 'tu-clave-secreta-super-segura' // Cambia esto en producción

// Configuración de la base de datos
const pool = new Pool({
  user: 'tu_usuario',
  host: 'localhost',
  database: 'tu_base_datos',
  password: 'tu_contraseña',
  port: 5432,
})

app.use(cors())
app.use(express.json())

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  
  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' })
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido o expirado' })
    }
    req.user = decoded
    next()
  })
}

// LOGIN
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // Buscar usuario usando la función de la BD
    const result = await pool.query('SELECT * FROM buscar_usuario($1)', [username])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    const user = result.rows[0]

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.contrasenna_usuario)
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' })
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        username: user.nom_usuario,
        role: user.rol_usuario
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        username: user.nom_usuario,
        role: user.rol_usuario
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// REGISTRO
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password, role = 'cliente' } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await pool.query('SELECT * FROM buscar_usuario($1)', [username])
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertar usuario usando la función de la BD
    await pool.query('SELECT insertar_usuario($1, $2, $3)', [
      username, 
      hashedPassword, 
      role
    ])

    res.status(201).json({ message: 'Usuario registrado exitosamente' })

  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
})

// VERIFICAR TOKEN
app.get('/auth/verify', verifyToken, (req, res) => {
  res.json({
    user: {
      username: req.user.username,
      role: req.user.role
    }
  })
})

// Ruta protegida de ejemplo
app.get('/auth/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Esta es una ruta protegida',
    user: req.user 
  })
})

app.listen(PORT, () => {
  console.log(`Servidor de autenticación corriendo en puerto ${PORT}`)
})