module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/core': './src/core',
            '@/features': './src/features',
            '@/shared': './src/features/Shared',
          },
        },
      ],
      'react-native-worklets/plugin', // DEBE SER EL ÚLTIMO
    ],
  };
};
