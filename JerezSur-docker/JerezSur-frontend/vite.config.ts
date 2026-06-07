import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    // Aumenta el umbral de aviso para chunks que incluyen librerías de terceros
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Divide el bundle en chunks lógicos para que el navegador cachee las librerías
        // independientemente del código de la aplicación
        manualChunks: {
          // React runtime — cambia muy poco: se cachea durante meses
          'vendor-react': ['react', 'react-dom'],
          // Router — cambia poco
          'vendor-router': ['react-router-dom'],
          // Auth de Google — solo se carga en páginas de login
          'vendor-auth': ['@react-oauth/google'],
          // Iconos — librería grande, mejor separada
          'vendor-icons': ['lucide-react'],
          // Cliente HTTP — pequeño pero frecuentemente actualizado
          'vendor-http': ['axios'],
        },
      },
    },
    // Objetivo moderno: reduce polyfills innecesarios
    target: 'es2020',
    // Assets pequeños se incrustan como base64 para ahorrar una petición HTTP
    assetsInlineLimit: 4096,
  },
})
