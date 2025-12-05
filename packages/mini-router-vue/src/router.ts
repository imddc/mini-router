import { onUnmounted, ref } from 'vue';
import type { App, Ref } from 'vue'
import type { IRouter, IRouteConfig, IRouterOptions } from './types.ts';

/**
 * @constant ROUTER_KEY
 * 路由注册的 Symbol Key，用于 provide/inject
 */
export const ROUTER_KEY = Symbol('router');

/**
 * @function getCurrentHash
 * 获取当前 URL 中的 Hash 路径
 * @returns {string} 路由路径 (例如: '/home')
 */
const getCurrentHash = (): string => {
  // 假设在 JSDOM 或 Node 环境下 window.location 可能不存在
  if (typeof window === 'undefined') return '/';
  // 去除 # 符号，并确保至少返回 '/'
  return window.location.hash.slice(1) || '/';
};

/**
 * @class Router
 * 路由状态管理器和 API 实现
 */
class Router implements IRouter {
  public currentRoute: Ref<string>;
  public routes: IRouteConfig[];
  private hashChangeHandler: () => void;

  /**
   * @param {Ref<string>} currentRoute 当前路由路径
   * @param {IRouteConfig[]} routes 路由配置数组
   */
  constructor(currentRoute: Ref<string>, routes: IRouteConfig[]) {
    this.currentRoute = currentRoute;
    this.routes = routes;

    this.hashChangeHandler = (): void => {
      this.currentRoute.value = getCurrentHash();
    };
  }

  /**
   * @function push
   * 导航到新路径 (Hash 模式)
   * @param {string} path 目标路径
   */
  public push(path: string): void {
    if (typeof window !== 'undefined') {
      window.location.hash = path;
    }
  }

  /**
   * @function install
   * 供 Vue 应用使用的安装方法
   * @param {App} app Vue 应用实例
   */
  public install(app: App): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', this.hashChangeHandler);
    }

    // 确保在应用卸载时移除事件监听器
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', this.hashChangeHandler);
      }
    });

    // 将路由实例提供 (provide) 给所有组件
    app.provide(ROUTER_KEY, this);
  }
}

/**
 * @function createRouter
 * 创建 Mini Vue Router 实例
 * @param {IRouterOptions} options 路由配置
 * @returns {IRouter} 路由实例
 */
export function createRouter(options: IRouterOptions): IRouter {
  // 维护当前路由路径 (基于 Hash 模式)
  const currentRoute = ref<string>(getCurrentHash());

  // 创建路由实例
  const router = new Router(currentRoute, options.routes);

  // 统一具名导出
  return router;
}

// 统一具名导出
export { Router };
