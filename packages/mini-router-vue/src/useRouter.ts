import { inject } from 'vue';
import { ROUTER_KEY } from './router';
import type { IRouter } from './types';

/**
 * @function useRouter
 * Composition API Hook，用于在组件中获取路由实例
 * @returns {IRouter} 路由实例
 */
export function useRouter(): IRouter {
  const router = inject<IRouter>(ROUTER_KEY);
  if (!router) {
    throw new Error('useRouter must be called within a component setup function after the router has been installed.');
  }
  return router;
}
