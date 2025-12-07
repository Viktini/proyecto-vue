const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // Configuración del servidor de desarrollo
  devServer: {
    port: 8080,
    open: true, // Abre automáticamente el navegador
    hot: true,  // Recarga en caliente
    historyApiFallback: true // Para SPA routing
  },
  
  // Configuración de construcción
  configureWebpack: {
    devtool: 'source-map'
  },
  
  // Opciones para CSS
  css: {
    sourceMap: true
  },
  
  // Configuración de PWA (opcional)
  pwa: {
    name: 'Belleza y Relajación',
    themeColor: '#ff6b95',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black'
  }
})
