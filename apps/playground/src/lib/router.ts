import { createRouter, createWebHistory } from 'mini-router-vue';
import type { App } from 'vue';
import AboutPage from '@/pages/about.vue';
import IndexPage from '@/pages/index.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: IndexPage
        },
        {
            path: '/about',
            component: AboutPage
        }
    ]
});

function setupRouter(app: App) {
    app.use(router);
}

export { setupRouter };
