import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default withVueTs(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.ai/**', '.agents/**'],
  },
  js.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  pluginVueA11y.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: ['src/components/ui/label/Label.vue', 'src/components/ui/field/Field.vue'],
    rules: {
      'vuejs-accessibility/label-has-for': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
)
