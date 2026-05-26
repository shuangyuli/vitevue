import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { vEchartsResize } from './directives/echarts-resize'

const app = createApp(App)
app.use(createPinia())
app.use(ElementPlus)
app.use(router)
app.directive('echarts-resize', vEchartsResize)
app.mount('#app')
