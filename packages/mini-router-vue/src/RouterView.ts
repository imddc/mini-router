import { defineComponent, h, computed, type Component } from 'vue';
import { useRouter } from './useRouter';
import type { IRouter } from './types';

/**
 * @constant NotFoundView
 * 404 页面组件
 */
const NotFoundView = defineComponent({
  name: 'NotFoundView',
  setup() {
    const router: IRouter = useRouter();
    return () => h(
      'div',
      { class: 'p-6 text-xl text-red-600 bg-red-50 border border-red-200 rounded-lg' },
      `404 - 找不到页面 (${router.currentRoute.value})`
    );
  }
});

/**
 * @constant RouterView
 * 路由出口组件，用于渲染当前路由匹配到的组件
 */
export const RouterView = defineComponent({
  name: 'RouterView',
  setup() {
    // 注入路由实例
    const router: IRouter = useRouter();

    // 查找匹配的组件
    const matchedComponent = computed<Component>(() => {
      const currentPath: string = router.currentRoute.value;
      // 简单的全路径匹配
      const route = router.routes.find(r => r.path === currentPath);

      // 如果找到匹配项，返回组件；否则返回 404 占位符
      return route ? route.component : NotFoundView;
    });

    // 使用 render 函数渲染匹配到的组件
    return () => {
      // 使用 h 函数渲染匹配到的组件
      return h(matchedComponent.value);
    };
  }
});
