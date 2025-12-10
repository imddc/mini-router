import type { App, Component, Ref } from 'vue';
import type { ILibHistory } from './history/html5';

/**
 * @interface IRouteRecord
 * 路由记录接口
 */
export interface IRouteRecord {
    path: string;
    name?: string;
    component: object;
    meta?: Record<string, any>;
}

/**
 * @interface IRouteNormalizedRouteRecord
 * 标准化路由记录接口
 */
export interface IRouteNormalizedRouteRecord {
    fullPath: string;
    hash: string;
    matched: string[];
    meta: Record<string, any>;
    name?: string;
    params: Record<string, string>;
    path: string;
    query: Record<string, string>;
    redirectedFrom?: string;
}

/**
 * @interface IRouterOptions
 * 创建路由实例的选项
 */
export interface IRouterOptions {
    history: ILibHistory;
    routes: IRouteRecord[];
}

/**
 * @interface IRouter
 * 路由实例接口 (Router 类对外暴露的 API)
 */
export interface IRouter {
    /** 当前激活的路由路径 (响应式) */
    currentRoute: Ref<IRouteNormalizedRouteRecord | null>;
    /** 注册的路由配置 */
    routes: IRouteRecord[];
    /** 编程式导航方法 */
    push(path: string): void;
    /** 编程式导航方法 */
    replace(path: string): void;
    /** Vue 插件安装方法 */
    install(app: App): void;

    options: IRouterOptions;
}

export type IHistoryLocation = string;

export enum ENavigationDirection {
    back = 'back',
    forward = 'forward',
    unknown = ''
}
