import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  // Specify your entry point
  plugins: [react()],
  resolve: {
    alias: {
      // Define an alias for worker files using relative paths
      '/worker/': './src/worker/',
      stream: "stream-browserify",
      Buffer: "buffer",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        })
      ]
    }
  },
  // Add any other configuration options you require
	});
