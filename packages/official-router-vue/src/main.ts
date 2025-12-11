import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

const app = createApp(App);

const h5history = createWebHistory(import.meta.env.BASE_URL);
export const router = createRouter({
    history: h5history,
    routes: [
        { path: '/', component: () => import('./pages/index.vue') },
        { path: '/about', component: () => import('./pages/about.vue') }
    ]
});

console.log('history => ', h5history);

router.beforeEach((to, from) => {
    console.log('beforeEach', to, from);
});

console.log('router => ', router);

console.log('routes => ', router.getRoutes());

console.log('router currentRoute => ', router.currentRoute);

app.use(router);

app.mount('#app');

console.log('-----------------------');

const route = {
    path: '/about',
    component: () => import('./pages/about.vue')
};
const routeLocation = router.resolve(route);

console.log('resolved route location => ', routeLocation);
