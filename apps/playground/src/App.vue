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

        <router-view v-slot="{ Component }">
            <component :is="Component" />
        </router-view>
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
