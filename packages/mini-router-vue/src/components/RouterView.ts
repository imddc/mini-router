import { computed, defineComponent, Fragment, h, inject, type Slot } from 'vue';
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
        return () => h(Fragment, {}, []);
    }

    const currentRoute = computed(() => router.currentRoute.value);
    const slotContent = computed(() => normalizeSlot(slots.default, { Component: currentRoute.value?.component }));

    const hasDefaultSlot = computed(() => !!slots.default);

    /**
     * done: 如何让 router-view 组件 既能直接渲染 又能使用插槽？
     * <slot :Component="Component">
     *   {{ slots.default({Component}) }}
     * </slot>
     */
    return () => (hasDefaultSlot.value ? slotContent.value : h(currentRoute.value?.component ?? ''));
});

export { RouterView };
