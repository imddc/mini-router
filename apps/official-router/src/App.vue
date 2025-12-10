<script setup lang="ts">
import { getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router'
import { router } from './main';

const ins = getCurrentInstance()
const routerHook = useRouter()

console.log('routerHook same as router', routerHook === router, router === ins?.proxy?.$router)

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
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </section>
    </div>
</template>

<style scoped></style>
