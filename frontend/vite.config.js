import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/TFG/', // 👈 muy importante para GitHub Pages
  plugins: [react(), tailwindcss()],
})