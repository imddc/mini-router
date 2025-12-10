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

        <section class="rounded-md bg-gray-200">
            <h2>
                render 1
            </h2>
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </section>

        <section class="rounded-md bg-gray-200 mt-4">
            <h2>
                render 2 empty
            </h2>
            <router-view></router-view>
        </section>
    </div>
</template>

<script setup lang="ts">
const links = [
    {
        path: '/',
        label: 'index'
    },
    {
        path: '/about',
        label: 'about'
    }
];
</script>
