import { createApp } from 'vue'
import App from './App.vue'

// UnoCSS
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

// Iconify
import { Icon } from '@iconify/vue'

const app = createApp(App)

// 注册 Iconify 图标组件
app.component('Icon', Icon)

app.mount('#app')