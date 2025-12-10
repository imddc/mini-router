import type { App, Ref } from 'vue';
import { readonly, shallowRef } from 'vue';
import { RouterLink } from './components/RouterLink';
import { RouterView } from './components/RouterView';
import { ROUTER_KEY } from './history/common';
import type { ILibHistory } from './history/html5';
import type { INavigationGuard, IRouteLocation, IRouteRecord, IRouter, IRouterOptions } from './types';
import { matchRecords } from './utils/match';

// 默认的 404 路由位置对象
const NOT_FOUND_ROUTE: IRouteLocation = {
    fullPath: '/404',
    path: '/404',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    matched: [],
    meta: {}
};

/**
 * @description 创建路由位置对象
 * @param path 路由路径
 * @param record 路由记录
 * @returns 路由位置对象
 */
function createRouteLocation(path: string, records: IRouteRecord[]): IRouteLocation {
    const url = new URL(path, window.location.origin);
    const cleanPath = url.pathname.replace(/\/$/, '') || '/';

    const matchedResult = matchRecords(cleanPath, records);

    if (!matchedResult) {
        return NOT_FOUND_ROUTE;
    }

    const { record: matchedRecord, params: pathParams } = matchedResult;

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    const routeLocation: IRouteLocation = {
        fullPath: path,
        path: cleanPath,
        params: pathParams,
        query,
        hash: url.hash,
        name: matchedRecord.name,
        matched: [matchedRecord],
        meta: matchedRecord.meta || {}
    };

    return routeLocation;
}

/**
 * 执行导航守卫
 * 一个递归/迭代的异步链式调用
 */
function runGuardQueue(
    guards: INavigationGuard[],
    to: IRouteLocation,
    from: IRouteLocation | null,
    onSuccess: (finalRoute: IRouteLocation) => void,
    onErrorOrRedirect: (result: boolean | string | IRouteLocation | Error) => void
) {
    let step = 0;

    function nextGuard() {
        if (step >= guards.length) {
            onSuccess(to);
            return;
        }

        const guard = guards[step++];
        /**
         * 执行下一个守卫
         * @param result 守卫函数的返回值
         * @returns
         */
        const next = (result?: boolean | string | IRouteLocation | Error) => {
            if (typeof result !== 'undefined') {
                onErrorOrRedirect(result);
                return;
            }
            nextGuard();
        };

        try {
            guard(to, from, next);
        } catch (err) {
            // @ts-expect-error non
            onErrorOrRedirect(err);
        }
    }

    nextGuard();
}

class LibRouter implements IRouter {
    options: IRouterOptions;
    public currentRoute: Ref<IRouteLocation | null> = shallowRef(null);
    public routeRecords: IRouteRecord[];
    private history: ILibHistory;

    private beforeGuards: INavigationGuard[] = [];

    constructor(options: IRouterOptions) {
        this.options = options;
        this.history = options.history;
        this.routeRecords = options.routes;

        this.history.listen((toPath) => {
            this.navigate(toPath);
        });

        this.navigate(this.history.currentPath);
    }

    // 路由切换的核心函数：执行匹配、更新状态、并返回新的 IRouteLocation
    private resolveRoute(path: string): IRouteLocation {
        // 1. 生成新的 IRouteLocation 对象
        const newRoute = createRouteLocation(path, this.routeRecords);
        return newRoute;
    }

    // 导航的核心逻辑，负责所有状态的更新
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
        runGuardQueue(
            this.beforeGuards,
            toRoute,
            fromRoute,
            // 守卫队列通过 (onSuccess)
            (finalRoute) => {
                // 3. 守卫全部通过，更新 currentRoute 状态，触发 RouterView 重新渲染
                // 3. 更新 currentRoute 状态，触发 RouterView 重新渲染
                this.currentRoute.value = finalRoute;
                console.log(`[MiniRouter] 导航成功: from=${fromRoute?.fullPath}, to=${toRoute.fullPath}`);
            },
            // 守卫队列失败、中断或重定向 (onErrorOrRedirect)
            (result) => {
                if (result === false) {
                    // 导航中断 (next(false))，停留在原地
                    console.warn(`[MiniRouter] Navigation interrupted by guard: ${fromRoute?.fullPath}`);
                } else if (typeof result === 'string' || (result as IRouteLocation)?.path) {
                    // 重定向 (next('/new') 或 next({}))
                    console.log(
                        `[MiniRouter] Redirecting to: ${typeof result === 'string' ? result : (result as IRouteLocation).path}`
                    );
                    this.push(typeof result === 'string' ? result : (result as IRouteLocation).path);
                } else if (result instanceof Error) {
                    // 发生错误
                    console.error('[MiniRouter] Navigation error:', result);
                    // 实际的 vue-router 还会调用 onError 钩子
                } else {
                    console.error('[MiniRouter] Navigation error:', result);
                }
            }
        );

        // 2. (这里可以插入 Navigation Guards: beforeEach, beforeResolve, afterEach)
        // 假设 beforeEach 守卫已通过...
    }

    push(path: string): void {
        this.history.push(path);
    }

    replace(path: string): void {
        this.history.replace(path);
    }

    getRoutes() {
        return this.routeRecords;
    }

    beforeEach(guard: INavigationGuard): void {
        this.beforeGuards.push(guard);
    }

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

function createRouter(options: IRouterOptions) {
    return new LibRouter(options);
}

export { LibRouter, createRouter };
