import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import './style.css'
import 'vuetify/styles'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify()

createApp(App).use(router).use(vuetify).mount('#app')
