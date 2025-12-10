import { defineComponent, h, inject } from 'vue';
import { ROUTER_KEY } from '../history/common';
import { warn } from '../warn';

const RouterLink = defineComponent({
    props: {
        to: {
            type: String,
            required: true
        }
    },
    setup(props, { slots }) {
        const router = inject(ROUTER_KEY);
        if (!router) {
            warn('请确保 mini-router-vue 已安装');
        }

        return () =>
            h(
                'a',
                {
                    onClick: (e: Event) => {
                        e.preventDefault();
                        router?.push(props.to);
                    }
                },
                slots.default?.()
            );
    }
});

export { RouterLink };
