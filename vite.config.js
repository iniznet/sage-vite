import { unlink } from 'fs';
import { resolve } from 'path';
import pluginManifest from 'rollup-plugin-output-manifest'
import pluginDevManifest from 'vite-plugin-dev-manifest';
import liveReload from 'vite-plugin-live-reload'
import { defineConfig } from 'vite'

const { default: outputManifest } = pluginManifest
const { default: devManifest } = pluginDevManifest

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  if (isDev) {
    cleanup()
  }

  return {
    plugins: [
      devManifest(),
      liveReload(resolve(__dirname, 'resources/views/**/*.php')),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, 'resources'),
        '@styles': resolve(__dirname, 'resources/styles'),
        '@scripts': resolve(__dirname, 'resources/scripts'),
        '@images': resolve(__dirname, 'resources/images'),
        '@fonts': resolve(__dirname, 'resources/fonts'),
      },
    },

    base: './',
    publicDir: '',

    build: {
      manifest: isDev ? true : false,
      assetsDir: '',
      emptyOutDir: true,
      outDir: resolve(__dirname, 'public'),

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
        plugins: [
          outputManifest({
            fileName: 'manifest.json',
            generate: (KeyValueDecorator, seed, opt) => chunks =>
              chunks.reduce((manifest, { name, fileName }) => {
                // remove any extension except .js
                const cleanedName = name.replace(/(?<=.)\.(?!js)[^.]+$/, '')

                return name ? {
                  ...manifest,
                  ...KeyValueDecorator(cleanedName, fileName, opt)
                } : manifest
            }, seed)
          }),

          outputManifest({
            fileName: 'entrypoints.json',
            nameWithExt: true,
            filter: bundle => {
              const { fileName } = bundle
              return fileName.endsWith('.js') || fileName.endsWith('.css')
            },
            generate: seed => chunks =>
              chunks.reduce((manifest, { name, fileName }) => {
                const result = {}
                const cleanedName = name.replace(/.css$/, '')

                const js = manifest[cleanedName]?.js || []
                const css = manifest[cleanedName]?.css || []
                const dependencies = manifest[cleanedName]?.dependencies || []

                const entry = { js, css, dependencies }

                fileName.endsWith('.js') && js.push(fileName)
                fileName.endsWith('.css') && css.push(fileName)

                result[cleanedName] = entry

                return {
                    ...manifest,
                    ...result
                }
            }, seed)
          }),
        ]
      },

      minify: true,
      write: true,
    },

    server: {
      host: 'localhost',
      port: 5173,
      https: false,
      strictPort: true,
      origin: 'http://localhost:5173',
      fs: {
        strict: true,
        allow: [
          'node_modules',
          'resources',
        ]
      },
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  }
})

function cleanup() {
  unlink('public', (err) => {
    console.log(`[vite] Cleanup public dir: ${err ? err : 'success'}`);
  });
}
