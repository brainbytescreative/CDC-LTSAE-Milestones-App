module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules/'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-native/no-inline-styles': 'off',
    'react/jsx-no-literals': 2,
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react-native/no-unused-styles': 1,
    'no-use-before-define': 'off',
  },
};
