import { defineConfig } from 'vite'
import { resolve } from 'path';
import liveReload from 'vite-plugin-live-reload'

export default defineConfig({
  plugins: [
    liveReload(__dirname + '/resources/views/**/*.php'),
  ],

  resolve: {
    alias: {
      '@styles': resolve(__dirname, 'resources/styles'),
      '@images': resolve(__dirname, 'resources/images'),
      '@fonts': resolve(__dirname, 'resources/fonts'),
      '@scripts': resolve(__dirname, 'resources/scripts'),
    },
  },

  root: 'resources',
  base: resolve(__dirname, 'public'),

  build: {
    outDir: resolve(__dirname, 'public'),
    emptyOutDir: true,

    manifest: 'entrypoints.json',
    target: 'es2018',

    rollupOptions: {
      input: {
        app: resolve(__dirname, 'resources/scripts/app.js'),
        editor: resolve(__dirname, 'resources/scripts/editor.js'),
      },
      output: {
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: '[name].[hash].js',

        assetFileNames: ({name}) => {
          if (/\.(png|jpe?g|gif|svg|ico|webp)$/i.test(name)) {
            return `images/[name].[hash][extname]`;
          }

          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name)) {
            return `fonts/[name].[hash][extname]`;
          }

          return `[name].[hash][extname]`;
        },
      },
    },

    minify: true,
    write: true,
  },

  server: {
    cors: true,
    strictPort: true,
    port: 3000,
    https: false,
    hmr: {
      host: 'localhost',
    },
  },
})
