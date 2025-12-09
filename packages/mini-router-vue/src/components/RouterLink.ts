import { defineComponent, h } from 'vue';

const RouterLink = defineComponent({
    setup(props, { slots }) {
        console.log('props => ', props);
        return () => h('a', {}, slots.default?.());
    }
});

export { RouterLink };
