// Пример файла vite.config.js для поддержки импорта 3D-моделей
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ react()],
  server: {
    host: '0.0.0.0', 
    port: 5173,       
  },

  assetsInclude: ['**/*.glb', '**/*.gltf'], // Включаем 3D-модели как ассеты
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core': ['three'],
          'drei': ['@react-three/drei']
        }
      }
    }
  }
});