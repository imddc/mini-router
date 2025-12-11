import type { MatchFunction } from 'path-to-regexp';
import type { App, Component, Ref } from 'vue';
import type { ILibHistory } from './history/html5';

/**
 * @interface IRouteRecord
 * 路由记录接口
 */
export interface IRouteRecord {
    path: string; // 路由的路径模式，例如 '/user/:id'
    name?: string; // 路由的名称
    component: Component; // 路径匹配时要渲染的 Vue 3 组件
    meta?: Record<string, any>; // 元数据
    children?: IRouteRecord[]; // 子路由记录
}

/**
 * @interface IRouteNormalizedRouteRecord
 * 标准化路由记录接口
 */
export interface IRouteNormalizedRouteRecord {
    fullPath: string;
    hash: string;
    meta: Record<string, any>;
    name?: string;
    params: Record<string, string>;
    path: string;
    query: Record<string, string>;
    redirectedFrom?: string;
}

type IMatcherGuard = (to: IRouteNormalizedRouteRecord, from: IRouteNormalizedRouteRecord) => void;

/**
 * @interface IRouteNormalizedRouteRecordMatcher
 * 标准化路由记录匹配器接口
 */
export interface IRouteNormalizedRouteRecordMatcher {
    children: IRouteNormalizedRouteRecordMatcher[];
    components: {
        default: Component | (() => Promise<Component>);
    };
    meta: Record<string, any>;
    name?: string;
    path: string;
    redirect?: string;
    updateGuards: Set<IMatcherGuard>;
    matcher: MatchFunction<Partial<Record<string, string | string[]>>>;
}

/**
 * 路由位置对象 (RouteLocation / Route Object)
 * 这是路由器在运行时生成的、代表当前/目标状态的完整对象。
 * 也是 beforeEach 守卫中 from 和 to 的类型。
 */
export interface IRouteLocation {
    fullPath: string; // 完整的 URL 路径，包含查询参数和哈希值
    path: string; // 匹配的路径，例如 '/user/100'
    name: string | undefined; // 匹配到的路由记录的 name
    params: Record<string, string | string[]>; // 路径参数，如 { id: '100' }
    query: Record<string, string | string[]>; // 查询参数，如 { tab: 'orders' }
    hash: string; // 哈希值 (URL 中的 # 部分)
    matched: IRouteRecord[]; // 匹配到的路由记录（对于嵌套路由很有用，这里简化为单个）
    meta: Record<string, any>; // 匹配到的路由记录的元数据
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
    currentRoute: Ref<IRouteLocation | null>;
    /** 注册的路由配置 */
    routeRecords: IRouteRecord[];
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

/**
 * 守卫的next函数的类型
 * 用于在守卫函数中继续导航流程或触发错误或重定向处理
 */
export type INavigationGuardNext = (value?: boolean | string | IRouteLocation | Error) => void;

/**
 * 导航守卫返回值类型
 * 可以返回 undefined、boolean、string、IRouteLocation 或 Error 类型
 */
export type IGuardReturn = undefined | boolean | string | IRouteLocation | Error;

/**
 * 导航守卫函数类型
 * 用于在路由导航过程中进行自定义逻辑处理
 * @param to 目标路由位置
 * @param from 当前路由位置（如果是初始导航，则为 null）
 * @param next 调用以继续导航流程的函数
 * @returns 可以返回一个值来触发错误或重定向处理
 */
export type INavigationGuard = (
    to: IRouteLocation,
    from: IRouteLocation | null,
    next?: INavigationGuardNext
) => IGuardReturn | Promise<IGuardReturn> | void;
