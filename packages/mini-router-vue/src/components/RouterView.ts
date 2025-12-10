import { computed, defineComponent, h, inject, watchEffect } from 'vue';
import { ROUTER_KEY } from '../history/common';

const RouterView = defineComponent(
    (_, { slots }) => {
        const router = inject(ROUTER_KEY);
        if (!router) {
            console.error('RouterView 组件必须在 Router 组件内部使用');
            return () => h('template', {}, []);
        }

        const currentRoute = computed(() => router.currentRoute.value);

        watchEffect(() => {
            console.log('currentRoute.value?.component => ', currentRoute.value?.component);
        });

        return () => {
            return slots.default?.({
                Component: currentRoute.value?.component
            });
        };
    },
    {
        props: {},
        slots: {}
    }
);

export { RouterView };
