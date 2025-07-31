import { createApp } from 'vue'

import router from './router'
import errorAlertPlugin from './errorAlertPlugin'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

import App from './App.vue'
import './style.css'

const vuetify = createVuetify({})

createApp(App).use(router).use(vuetify).use(errorAlertPlugin).mount('#app')
