import { createApp } from 'vue';
import './style.css';
import 'mini-router-vue/style.css';
import App from './App.vue';
import { setupRouter } from './lib/router';

const app = createApp(App);
setupRouter(app);
app.mount('#app');
