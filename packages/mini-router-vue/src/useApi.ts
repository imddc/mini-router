import { inject } from 'vue';
import { ROUTER_KEY } from './history/common';
import type { IRouter } from './types';

/**
 * @function useRouter
 * 获取路由实例
 */
function useRouter(): IRouter {
    const router = inject<IRouter>(ROUTER_KEY);
    if (!router) {
        throw new Error('useRouter 必须在安装路由后，在组件的 setup 函数中调用。');
    }
    return router;
}

/**
 * @function useRoute
 * 获取当前路由实例
 */
function useRoute() {
    const router = inject<IRouter>(ROUTER_KEY);
    if (!router) {
        throw new Error('useRoute 必须在安装路由后，在组件的 setup 函数中调用。');
    }
    return router.currentRoute;
}

export { useRouter, useRoute };
