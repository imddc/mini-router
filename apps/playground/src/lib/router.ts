import { createRouter, createWebHistory } from 'mini-router-vue';
import type { App } from 'vue';
import AboutDetailPage from '@/pages/about/detail.vue';
import AboutPage from '@/pages/about/index.vue';
import ContactPage from '@/pages/contact.vue';
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
        },
        {
            path: '/about/detail',
            component: AboutDetailPage
        },
        {
            path: '/contact/:id/me',
            component: ContactPage
        }
    ]
});

function setupRouter(app: App) {
    app.use(router);
}

export { setupRouter };
