import { createApp } from 'vue'

import App from './App.vue'
import i18n from './i18n'
import router from './router'
import '@infinitylib/infinity-theme'
import './css/brand.css'
import './css/layout.css'

createApp(App).use(i18n).use(router).mount('#app')
