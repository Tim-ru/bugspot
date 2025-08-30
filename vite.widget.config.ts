import { defineConfig } from 'vite';

export default defineConfig({
  root: 'widget',
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'BugSpot',
      fileName: 'widget',
      formats: ['iife']
    },
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'widget.js',
        assetFileNames: 'widget.[ext]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});