/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { msw } from 'msw/vite';
import {
  PluginOption,
  UserConfig,
  defineConfig,
  esmExternalRequirePlugin,
  loadEnv,
} from 'vite';

/* See https://stackoverflow.com/questions/69626090/how-to-watch-public-directory-in-vite-project-for-hot-reload allows
   hot reloading when json files are modified in the public folder*/
function jsonHMR(): PluginOption {
  return {
    name: 'json-hmr',
    enforce: 'post',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.json')) {
        console.log('reloading json file...');

        server.ws.send({
          type: 'full-reload',
          path: '*',
        });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Whether to output build files in a way SciGateway can load (the default for production unless e2e testing)
  const buildLibrary =
    env.NODE_ENV === 'production' && env.VITE_APP_BUILD_STANDALONE !== 'true';

  const plugins: PluginOption[] = [react(), msw()];

  // Allow hot reloading of json files in public folder when in development
  if (env.NODE_ENV === 'development') plugins.push(jsonHMR());

  const config: UserConfig = {
    plugins: plugins,
    server: {
      port: 3000,
    },
    preview: {
      port: 5001,
    },
    define: {
      // See https://vitejs.dev/guide/build.html#library-mode
      // we need to replace here as the build in library mode won't
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
  };

  if (buildLibrary) {
    plugins.push(
      esmExternalRequirePlugin({
        external: ['react', 'react-dom'],
      })
    );
    // Config for deployment in SciGateway
    config.build = {
      lib: {
        formats: ['umd'],
        entry: 'src/main.tsx',
        name: 'operationsgateway',
      },
      rolldownOptions: {
        input: 'src/main.tsx',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].chunk.js',
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    };
  } else {
    // Config for stand alone deployment e.g. for cypress
    config.build = {
      rolldownOptions: {
        input: ['src/main.tsx', './index.html'],
        // Don't make react/react-dom external as not a library here, so have to bundle
        preserveEntrySignatures: 'strict',
      },
    };
  }

  config.build.target = 'baseline-widely-available';

  return {
    ...config,
    test: {
      globals: true,
      environment: 'jsdom',
      globalSetup: './globalSetup.js',
      setupFiles: ['src/setupTests.ts'],
      dir: './src',
      coverage: {
        reporter: [
          // Default
          'text',
          'html',
          'clover',
          'json',
          // Extra for VSCode extension
          ['lcov', { outputFile: 'lcov.info', silent: true }],
        ],
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: [
          // Leave non-browser handlers to show up unused code
          'src/mocks/browserHandlers.ts',
          'src/mocks/*.json',
          '*.d.ts',
          'src/main.tsx',
          'src/testUtils.tsx',
        ],
      },
    },
  };
});
