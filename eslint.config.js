// @ts-check
const eslint = require('@eslint/js');
const { defineConfig, globalIgnores } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

/**
 * Architecture boundaries from AGENTS.md, enforced by lint instead of documentation alone.
 * Each feature may not import from any other feature.
 */
const FEATURES = ['home', 'goods', 'search', 'cart'];
const featureBoundaries = FEATURES.map((feature) => ({
  files: [`src/app/features/${feature}/**/*.ts`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: FEATURES.filter((f) => f !== feature).flatMap((f) => [`**/${f}`, `**/${f}/**`]),
            message:
              'Features must not import each other. Move shared code to shared/ or data-access/.',
          },
          {
            group: ['**/mocks/**'],
            message: 'Only data-access may read mock fixtures. Go through CatalogApi.',
          },
        ],
      },
    ],
  },
}));

module.exports = defineConfig([
  globalIgnores(['.angular/**', 'dist/**', 'node_modules/**', '.claude/**']),
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
    },
  },
  {
    files: ['src/app/core/**/*.ts', 'src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**'],
              message: 'core/ and shared/ must not depend on features/.',
            },
            {
              group: ['**/mocks/**'],
              message: 'Only data-access may read mock fixtures. Go through CatalogApi.',
            },
          ],
        },
      ],
    },
  },
  ...featureBoundaries,
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
    },
  },
]);
