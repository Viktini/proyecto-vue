// database.ts - CORREGIDO
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Inukibunti.0',
  database: process.env.DB_NAME || 'SPA',
  port: parseInt(process.env.DB_PORT) || 5432,
});

// Probar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL - Base de datos: SPA');
});

pool.on('error', (err) => {
  console.error('❌ Error de conexión PostgreSQL:', err);
});

// Función para probar conexión al iniciar
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL verificada correctamente');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    return false;
  }
};