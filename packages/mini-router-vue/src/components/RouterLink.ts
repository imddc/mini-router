import { computed, defineComponent, h, inject } from 'vue';
import { ROUTER_KEY } from '../history/common';
import { warn } from '../warn';

const RouterLink = defineComponent(
    (props, { slots }) => {
        const router = inject(ROUTER_KEY);

        const activeClass = props.activeClass;
        const isActive = computed(() => router?.currentRoute.value?.path === props.to);

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
                    },
                    class: {
                        [activeClass]: isActive.value
                    }
                },
                slots.default?.()
            );
    },
    {
        props: {
            to: {
                type: String,
                required: true
            },
            activeClass: {
                type: String,
                default: 'router-link-active'
            }
        }
    }
);

export { RouterLink };
