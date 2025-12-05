import type { App, Component, Ref } from 'vue';

/**
 * @interface IRouteConfig
 * 路由配置接口
 */
export interface IRouteConfig {
  /** 路由路径，例如 '/' 或 '/about' */
  path: string;
  /** 匹配路径后渲染的组件 */
  component: Component;
  /** 路由名称，可选 */
  name?: string;
}

/**
 * @interface IRouterOptions
 * 创建路由实例的选项
 */
export interface IRouterOptions {
  routes: IRouteConfig[];
}

/**
 * @interface IRouter
 * 路由实例接口 (Router 类对外暴露的 API)
 */
export interface IRouter {
  /** 当前激活的路由路径 (响应式) */
  currentRoute: Ref<string>;
  /** 注册的路由配置 */
  routes: IRouteConfig[];
  /** 编程式导航方法 */
  push(path: string): void;
  /** Vue 插件安装方法 */
  install(app: App): void;
}
