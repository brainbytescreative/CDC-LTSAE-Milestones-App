module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: ['react-native-paper/babel', 'date-fns', 'transform-remove-console', 'babel-plugin-lodash'],
    },
  },
};
