import { fileURLToPath } from 'node:url';
import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

// Next.js permite JSX dentro de archivos .js; Vite solo lo detecta en .jsx.
// Este plugin transforma el JSX de los .js del proyecto antes que el resto.
const jsxInJs = {
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    if (!/[\\/]src[\\/].*\.js$/.test(id) || id.includes('node_modules')) return null;
    const result = await transformWithOxc(code, id.replace(/\.js$/, '.jsx'), { jsx: { runtime: 'automatic' } });
    return { code: result.code, map: result.map };
  },
};

export default defineConfig({
  plugins: [jsxInJs, react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/{unit,components,api}/**/*.test.{js,jsx}'],
    css: false,
    restoreMocks: true,
  },
});
