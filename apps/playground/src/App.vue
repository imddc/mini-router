<template>
    <div>
        <header>
            <nav>
                <ul>
                    <li v-for="link in links" :key="link.path">
                        <router-link :to="link.path">{{ link.label }}</router-link>
                    </li>
                </ul>
            </nav>
        </header>

        <router-view />
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
