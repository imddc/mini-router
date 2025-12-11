<template>
    <div>contact page</div>

    <div>
        <div>params: {{ route.params.id }}</div>

        <div>query: {{ route.query }}</div>

        <div>hash: {{ route.hash }}</div>
    </div>
</template>

<script setup lang="ts">
    import { useRoute } from 'mini-router-vue';

    const route = useRoute();
</script>

<style scoped></style>
