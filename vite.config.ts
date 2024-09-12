import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import fs from 'node:fs';
import path from 'path';
import { PluginOption, UserConfig, defineConfig, loadEnv } from 'vite';

/* See https://github.com/mswjs/msw/discussions/712 */
function excludeMSWPlugin(): PluginOption {
  return {
    name: 'exclude-msw',
    apply: 'build',
    renderStart(outputOptions) {
      const outDir = outputOptions.dir;
      const msWorker = path.resolve(outDir || '', 'mockServiceWorker.js');
      fs.rm(msWorker, () => console.log(`Deleted ${msWorker}`));
    },
  };
}

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

// Obtain default coverage config from vitest when not building for production
// (to avoid importing vitest during build as its a dev dependency)
let vitestDefaultExclude: string[] = [];
let vitestCoverageConfigDefaultsExclude: string[] = [];
if (process.env.NODE_ENV !== 'production') {
  await import('vitest/config').then((vitestConfig) => {
    vitestDefaultExclude = vitestConfig.defaultExclude;
    vitestCoverageConfigDefaultsExclude =
      vitestConfig.coverageConfigDefaults.exclude;
  });
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Whether to output build files in a way SciGateway can load (the default for production unless e2e testing)
  const buildLibrary =
    env.NODE_ENV === 'production' && env.VITE_APP_BUILD_STANDALONE !== 'true';

  // Whether to exclude MSW from the build
  const excludeMSW = env.VITE_APP_INCLUDE_MSW !== 'true';

  const plugins: PluginOption[] = [react()];

  // Allow hot reloading of json files in public folder when in development
  if (env.NODE_ENV === 'development') plugins.push(jsonHMR());

  const config: UserConfig = {
    plugins: plugins,
    server: {
      port: 3000,
      // Don't open by default as Dockerfile wont run as it can't find a display
      open: false,
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

  const rollupExternals: string[] = [];

  // Exclude msw if necessary
  if (excludeMSW) {
    plugins.push(excludeMSWPlugin());
    rollupExternals.push('msw');
  }

  if (buildLibrary) {
    // Config for deployment in SciGateway
    config.build = {
      lib: {
        // We use `umd` here as `es` causes some import statements to leak into the main.js, breaking the build
        // removing this entirely uses a default of both, which for build results in `umd` taking precedence but when
        // using --watch, `es` appears to replace it intermittently. Hopefully this can be fixed in the future and we
        // can use `es` instead.
        formats: ['umd'],
        entry: 'src/main.tsx',
        name: 'operationsgateway',
      },
      rollupOptions: {
        external: ['react', 'react-dom'].concat(rollupExternals),
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
      rollupOptions: {
        input: ['src/main.tsx', './index.html'],
        // Don't make react/react-dom external as not a library here, so have to bundle
        external: rollupExternals,
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
        preserveEntrySignatures: 'strict',
      },
    };
  }

  // Use browserslist config
  config.build.target = browserslistToEsbuild();

  return {
    ...config,
    test: {
      globals: true,
      environment: 'jsdom',
      globalSetup: './globalSetup.js',
      setupFiles: ['src/setupTests.ts'],
      exclude: [...vitestDefaultExclude, 'e2e/**'],
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
        exclude: [
          ...vitestCoverageConfigDefaultsExclude,
          'public/*',
          'server/*',
          'playwright.config.ts',
          // Leave handlers to show up unused code
          'src/mocks/browser.ts',
          'src/mocks/server.ts',
          'src/vite-env.d.ts',
          'src/main.tsx',
        ],
      },
    },
  };
});
