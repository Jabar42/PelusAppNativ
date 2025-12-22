const path = require('path');
const webpack = require('webpack');

const projectRoot = process.cwd();

module.exports = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    '../storybook/**/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      fastRefresh: false, // Deshabilitar fastRefresh para evitar errores de source maps
    },
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },
  webpackFinal: async (config) => {
    // CRÍTICO: Configurar watchOptions para evitar que el proceso se cierre por demasiados archivos
    config.watchOptions = {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: false,
    };
    
    // CRÍTICO: Configurar mainFields para resolver correctamente ES modules
    config.resolve.mainFields = ['browser', 'module', 'main'];
    
    // CRÍTICO: Configurar aliases para FORZAR versión web de todas las librerías
    // Esto asegura que react-native-web se use en lugar de react-native
    config.resolve.alias = {
      ...config.resolve.alias,
      // CRÍTICO: Forzar react-native -> react-native-web (MÁXIMA PRIORIDAD)
      'react-native$': 'react-native-web',
      'react-native': 'react-native-web',
      
      // MOCKS ESPECÍFICOS (Usando NormalModuleReplacementPlugin para Auth Store)
      'expo-router': path.resolve(projectRoot, 'storybook/mocks/expoRouter.tsx'),
      
      // Alias de Gluestack UI
      '@gluestack-ui/themed': path.resolve(projectRoot, 'node_modules/@gluestack-ui/themed'),
      '@gluestack-ui/config': path.resolve(projectRoot, 'node_modules/@gluestack-ui/config'),
      
      // Path aliases del proyecto (Generales)
      '@/core': path.resolve(projectRoot, 'src/core'),
      '@/features': path.resolve(projectRoot, 'src/features'),
      '@/shared': path.resolve(projectRoot, 'src/features/Shared'),
    };

    // CRÍTICO: Configurar extensions para preferir versiones web
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.mjs',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ];

    // CRÍTICO: Configurar fallbacks para módulos nativos que no existen en web
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
    };

    // CRÍTICO: react-native-svg ya funciona en web, no necesita alias especial
    // Solo asegurar que se procese correctamente con babel

    // Configurar para procesar TypeScript y JSX en librerías
    if (config.module && config.module.rules) {
      // CRÍTICO: Regla para .mjs y .js con fullySpecified: false (permite resolución de directorios)
      config.module.rules.push({
        test: /\.m?js$/,
        include: [
          path.resolve(projectRoot, 'node_modules/@gluestack-ui'),
          path.resolve(projectRoot, 'node_modules/@gluestack-style'),
        ],
        resolve: {
          fullySpecified: false, // Permite que Webpack busque index.js automáticamente
        },
      });
      
      // Transpilación para Gluestack UI y react-native-svg
      const babelConfigPath = path.resolve(projectRoot, 'babel.config.js');
      config.module.rules.unshift({
        test: /\.(ts|tsx|jsx|js)$/,
        include: [
          path.resolve(projectRoot, 'node_modules/@gluestack-ui'),
          path.resolve(projectRoot, 'node_modules/@gluestack-style'),
          path.resolve(projectRoot, 'node_modules/react-native-svg'),
          path.resolve(projectRoot, 'node_modules/react-native-web'),
          path.resolve(projectRoot, 'node_modules/@expo/vector-icons'),
          path.resolve(projectRoot, 'node_modules/@expo/html-elements'),
          path.resolve(projectRoot, 'node_modules/@react-native/assets-registry'),
          path.resolve(projectRoot, 'src'),
          path.resolve(projectRoot, 'storybook'),
        ],
        exclude: [
          /node_modules\/react-native\//, // Excluir react-native nativo
        ],
        resolve: {
          fullySpecified: false, // Permite resolución de directorios en ES modules
        },
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', { modules: false }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-transform-runtime', {
                  regenerator: true,
                  corejs: false,
                  helpers: false,
                  useESModules: false,
                }],
                ['babel-plugin-react-native-web', {
                  commonjs: false,
                }],
              ],
              // Deshabilitar source maps para evitar errores de react-refresh
              sourceMaps: false,
              compact: false,
            },
          },
        ],
      });
    }

    // CRÍTICO: Plugins de Webpack
    if (!config.plugins) {
      config.plugins = [];
    }

    // Definir __DEV__ para React Native
    const existingDefinePluginIndex = config.plugins.findIndex(
      (plugin) => plugin && plugin.constructor && plugin.constructor.name === 'DefinePlugin'
    );
    
    if (existingDefinePluginIndex !== -1) {
      config.plugins[existingDefinePluginIndex].definitions = {
        ...config.plugins[existingDefinePluginIndex].definitions,
        '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
      };
    } else {
      config.plugins.push(
        new webpack.DefinePlugin({
          '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        })
      );
    }

    // CRÍTICO: Deshabilitar react-refresh-webpack-plugin para evitar errores de source maps
    const refreshPluginIndex = config.plugins.findIndex(
      (plugin) => plugin && plugin.constructor && plugin.constructor.name === 'ReactRefreshPlugin'
    );
    if (refreshPluginIndex !== -1) {
      config.plugins.splice(refreshPluginIndex, 1);
    }
    
    // También remover el loader de react-refresh de las reglas
    config.module.rules.forEach((rule) => {
      if (rule.use) {
        const useArray = Array.isArray(rule.use) ? rule.use : [rule.use];
        rule.use = useArray.filter((use) => {
          if (typeof use === 'object' && use.loader) {
            return !use.loader.includes('react-refresh');
          }
          return true;
        });
      }
    });
    
    // CRÍTICO: NormalModuleReplacementPlugin como respaldo para react-native -> react-native-web
    // Esto asegura que incluso si algún import escapa del alias, se reemplace
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react-native$/,
        'react-native-web'
      ),
      // CRÍTICO: Interceptar transformToRn.js de react-native-svg (problema de ES Modules)
      new webpack.NormalModuleReplacementPlugin(
        /react-native-svg\/lib\/module\/lib\/extract\/transformToRn\.js$/,
        path.resolve(projectRoot, 'storybook/mocks/reactNativeSvgTransformToRn.js')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /react-native-svg\/lib\/module\/lib\/extract\/transformToRn$/,
        path.resolve(projectRoot, 'storybook/mocks/reactNativeSvgTransformToRn.js')
      ),
      // MOCK AGRESIVO PARA AUTH STORE
      new webpack.NormalModuleReplacementPlugin(
        /src\/core\/store\/authStore$/,
        path.resolve(projectRoot, 'storybook/mocks/authStoreMock.ts')
      ),
      new webpack.NormalModuleReplacementPlugin(
        /src\/core\/store\/authStore\.ts$/,
        path.resolve(projectRoot, 'storybook/mocks/authStoreMock.ts')
      ),
      // Interceptar imports relativos desde extractTransform.js
      new webpack.NormalModuleReplacementPlugin(
        /^\.\/transformToRn$/,
        (resource) => {
          // Solo interceptar si viene de react-native-svg/extract
          if (resource.context && resource.context.includes('react-native-svg') && resource.context.includes('extract')) {
            resource.request = path.resolve(projectRoot, 'storybook/mocks/reactNativeSvgTransformToRn.js');
          }
        }
      )
    );

    // CRÍTICO: Configurar stats verbose para ver qué archivo se procesa antes de morir
    config.stats = 'errors-only';
    
    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};






