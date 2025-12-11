<template>
    <div class="container mx-auto">
        <header>
            <nav>
                <ul class="tabs tabs-lift tabs-xs">
                    <li v-for="link in links" :key="link.path" class="tab">
                        <router-link :to="link.path">{{ link.label }}</router-link>
                    </li>
                </ul>
            </nav>
        </header>

        <section class="rounded-md p-4">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { useRouter } from 'mini-router-vue';

    const router = useRouter();

    console.log('router records => ', router.routeRecords);

    console.log('current router', router.currentRoute);

    const links = [
        {
            path: '/',
            label: 'index'
        },
        {
            path: '/about',
            label: 'about'
        },
        {
            path: '/about/detail',
            label: 'about detail'
        },
        {
            path: '/contact/123/me?a=1&b=2#hhh',
            label: 'contact'
        }
    ];
</script>
