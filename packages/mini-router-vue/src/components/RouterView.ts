import { computed, defineComponent, h, inject, type Slot } from 'vue';
import { ROUTER_KEY } from '../history/common';

function normalizeSlot(slot: Slot | undefined, data: any) {
    if (!slot) return null;
    const slotContent = slot(data);
    return slotContent.length === 1 ? slotContent[0] : slotContent;
}

const RouterView = defineComponent((_, { slots }) => {
    const router = inject(ROUTER_KEY);
    if (!router) {
        console.error('RouterView 组件必须在 Router 组件内部使用');
        return () => h('template', {}, []);
    }

    const currentRoute = computed(() => router.currentRoute.value);

    return () => normalizeSlot(slots.default, { Component: currentRoute.value?.component });
});

export { RouterView };
