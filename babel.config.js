module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: [
        'react-native-paper/babel',
        'date-fns',
        'transform-react-remove-prop-types',
        'transform-remove-console',
      ],
    },
  },
};
