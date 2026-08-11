const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'src/generated', 'eslint.config.js', 'jest.config.js'],
  },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
  }
);
