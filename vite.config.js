import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Expose x-total-count so the browser can read it from res.headers
        configure: (proxy /*, options */) => {
          proxy.on('proxyRes', (proxyRes) => {
            const prev = proxyRes.headers['access-control-expose-headers'];
            proxyRes.headers['access-control-expose-headers'] = prev
              ? `${prev}, x-total-count`
              : 'x-total-count';
          });
        },
      },
    },
  },
});
