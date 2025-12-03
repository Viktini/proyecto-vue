// src/config/configuration.ts
export default () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3001,
    frontendUrl: process.env.FRONTEND_URL,
    
    database: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: '7d',
    },
  });
  
  