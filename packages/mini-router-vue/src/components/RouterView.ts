import { defineComponent, h } from 'vue';

const RouterView = defineComponent({
    setup(_, { slots }) {
        return () => h('template', {}, [slots.defaults?.()]);
    }
});

export { RouterView };
