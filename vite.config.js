import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    allowedHosts: ['tightly-suing-motocross.ngrok-free.dev']
  }
});