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
      fastRefresh: false,
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
    // Configuración simplificada - solo lo esencial
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'react-native': 'react-native-web',
      '@/core': path.resolve(projectRoot, 'src/core'),
      '@/features': path.resolve(projectRoot, 'src/features'),
      '@/shared': path.resolve(projectRoot, 'src/features/Shared'),
      'expo-router': path.resolve(projectRoot, 'storybook/mocks/expoRouter.tsx'),
      '@/core/store/authStore': path.resolve(projectRoot, 'storybook/mocks/authStoreMock.ts'),
    };

    config.resolve.extensions = [
      '.web.tsx', '.web.ts', '.web.jsx', '.web.js',
      '.tsx', '.ts', '.jsx', '.js', '.json',
    ];

    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
    };

    // Transpilación mínima
    if (config.module && config.module.rules) {
      config.module.rules.unshift({
        test: /\.(ts|tsx|jsx|js)$/,
        include: [
          path.resolve(projectRoot, 'node_modules/@gluestack-ui'),
          path.resolve(projectRoot, 'node_modules/@gluestack-style'),
          path.resolve(projectRoot, 'node_modules/react-native-svg'),
          path.resolve(projectRoot, 'node_modules/react-native-web'),
          path.resolve(projectRoot, 'node_modules/@expo/html-elements'),
          path.resolve(projectRoot, 'src'),
          path.resolve(projectRoot, 'storybook'),
        ],
        exclude: [/node_modules\/react-native\//],
        use: [{
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
              ['babel-plugin-react-native-web', { commonjs: false }],
            ],
            sourceMaps: false,
          },
        }],
      });
    }

    // Plugins mínimos
    if (!config.plugins) {
      config.plugins = [];
    }

    // Definir __DEV__
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

    // NormalModuleReplacementPlugin para react-native
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^react-native$/,
        'react-native-web'
      )
    );

    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};






