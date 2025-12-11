import type { App, Ref } from 'vue';
import { readonly, shallowRef } from 'vue';
import { RouterLink } from './components/RouterLink';
import { RouterView } from './components/RouterView';
import { ROUTER_KEY } from './history/common';
import type { ILibHistory } from './history/html5';
import type { INavigationGuard, IRouteLocation, IRouter, IRouterOptions } from './types';
import { createRouteLocation, runGuardQueue } from './utils/helper';
import { warn } from './utils/warn';

class LibRouter implements IRouter {
    options: IRouterOptions;
    public currentRoute: Ref<IRouteLocation | null> = shallowRef(null);
    private routeRecords: IRouteLocation[];
    private history: ILibHistory;

    private beforeGuards: INavigationGuard[] = [];

    // todo: 导航故障 似乎是一个新的话题，先不做
    // private afterGuards: INavigationGuard[] = [];

    constructor(options: IRouterOptions) {
        this.options = options;
        this.history = options.history;
        this.routeRecords = this.buildRouteRecords();

        this.history.listen((toPath) => {
            this.navigate(toPath);
        });

        this.navigate(this.history.currentPath);
    }

    /**
     * @description 返回一个路由地址的规范化版本。
     * 同时包含一个包含任何现有 base 的 href 属性。
     * 默认情况下，用于 router.currentRoute 的 currentLocation 应该在特别高阶的用例下才会被覆写。
     * @param path
     * @returns
     */
    private resolveRoute(path: string): IRouteLocation {
        // todo: beforeResolve 守卫
        // 添加一个导航守卫，它会在导航将要被解析之前被执行。此时所有组件都已经获取完毕，且其它导航守卫也都已经完成调用。返回一个用来移除该守卫的函数。

        const resolvedRoute = this.resolve(path);
        return resolvedRoute;
    }

    /**
     * @description 导航到指定的路由路径。
     * 触发 前置守卫 和 后置守卫
     * @param toPath 目标路由路径
     * @returns void
     */
    private async navigate(toPath: string) {
        // 1. 获取 From 和 To 的 RouteLocation 对象
        const fromRoute = this.currentRoute.value;
        const toRoute = this.resolveRoute(toPath);

        // 如果目标路由与当前路由相同，并且路径完全一致 (避免重复导航)
        if (fromRoute?.fullPath === toRoute.fullPath) {
            console.log('[MiniRouter] 路由路径相同，无需导航。');
            return;
        }

        // 2. 执行全局 beforeEach 守卫队列
        try {
            const finalRoute = await runGuardQueue(this.beforeGuards, toRoute, fromRoute);
            this.currentRoute.value = finalRoute;
            console.log(`[MiniRouter] 导航成功: from=${fromRoute?.fullPath}, to=${toRoute.fullPath}`);
        } catch (result) {
            if (result === false) {
                // 导航中断 (next(false))，停留在原地
                warn(`[MiniRouter] 导航中断: ${fromRoute?.fullPath}`);
            } else if (typeof result === 'string' || (result as IRouteLocation)?.path) {
                // 重定向 (next('/new') 或 next({}))
                console.log(
                    `[MiniRouter] 重定向到: ${typeof result === 'string' ? result : (result as IRouteLocation).path}`
                );
                this.push(typeof result === 'string' ? result : (result as IRouteLocation).path);
            } else if (result instanceof Error) {
                // 发生错误
                console.error('[MiniRouter] 导航错误:', result);
                // 实际的 vue-router 还会调用 onError 钩子
            } else {
                console.error('[MiniRouter] 未知导航错误:', result);
            }
        }

        // todo: afterEach 守卫
        // 添加一个导航钩子，它会在每次导航之后被执行。返回一个用来移除该钩子的函数。
    }

    /**
     * @description 构建路由记录列表。
     * @returns 路由记录列表
     */
    private buildRouteRecords() {
        return this.options.routes.map((r) => createRouteLocation(r.path, this.options.routes));
    }

    /**
     * @description 导航到指定的路由路径。
     * @param path 目标路由路径
     */
    push(path: string): void {
        this.history.push(path);
    }

    /**
     * @description 用新路由替换当前路由。
     * @param path 目标路由路径
     */
    replace(path: string): void {
        this.history.replace(path);
    }

    /**
     * @description 解析一个路由地址，返回一个包含路由信息的对象。
     * @param path 路由路径
     * @returns 路由信息对象
     */
    resolve(path: string): IRouteLocation {
        const resolvedResult = createRouteLocation(path, this.options.routes);
        return resolvedResult;
    }

    /**
     * @description 返回当前路由记录列表。
     * @returns
     */
    getRoutes() {
        return this.routeRecords;
    }

    /**
     * @description 添加一个前置守卫。
     * @param guard 前置守卫函数
     */
    beforeEach(guard: INavigationGuard): void {
        this.beforeGuards.push(guard);
    }

    /**
     * @description 安装 Vue 插件。
     * @param app Vue 应用实例
     */
    install(app: App): void {
        // 1. 提供全局的 $router
        app.config.globalProperties.$router = this;
        // 2. 提供全局的 $route 只读
        app.config.globalProperties.$route = readonly(this.currentRoute);
        // 3. 提供 router 实例
        app.provide(ROUTER_KEY, this);
        // 4. 提供全局组件
        app.component('RouterView', RouterView);
        app.component('RouterLink', RouterLink);
    }
}

/**
 * @description 创建一个新的路由实例。
 * @param options 路由配置选项
 * @returns 路由实例
 */
function createRouter(options: IRouterOptions) {
    return new LibRouter(options);
}

export { LibRouter, createRouter };
