import type { App, Ref } from 'vue';
import { readonly, shallowRef } from 'vue';
import { RouterLink } from './components/RouterLink';
import { RouterView } from './components/RouterView';
import { ROUTER_KEY } from './history/common';
import type { ILibHistory } from './history/html5';
import type {
    IGuardReturn,
    INavigationGuard,
    INavigationGuardNext,
    IRouteLocation,
    IRouteRecord,
    IRouter,
    IRouterOptions
} from './types';
import { isPromise } from './utils';
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
 * @return Promise 返回一个promise，成功是resolve(finalRoute), 失败时 reject(result)
 */
function runGuardQueue(
    guards: INavigationGuard[],
    to: IRouteLocation,
    from: IRouteLocation | null
): Promise<IRouteLocation> {
    return new Promise((resolve, reject) => {
        let step = 0;

        // 递归执行下一个守卫
        function nextGuard() {
            if (step >= guards.length) {
                resolve(to);
                return;
            }

            const guard = guards[step++];
            let isNextCalled = false;

            // 只能被调用一次
            const next: INavigationGuardNext = (result) => {
                if (isNextCalled) {
                    console.error('[MiniRouter] next 在同一个守卫中只能被调用一次');
                    return;
                }
                isNextCalled = true;
                if (typeof result !== 'undefined') {
                    reject(result);
                    return;
                }

                nextGuard();
            };

            try {
                // 得到当前守卫的返回值
                const guardResult = guard(to, from, next);

                // promise 分支
                if (isPromise(guardResult as Promise<IGuardReturn>)) {
                    (guardResult as Promise<IGuardReturn>)
                        .then((resolvedValue) => {
                            if (!isNextCalled) {
                                next(resolvedValue);
                            }
                        })
                        .catch((error) => {
                            if (!isNextCalled) {
                                next(error);
                            }
                        });
                }
                // 处理同步返回值
                else if (guardResult !== undefined) {
                    if (!isNextCalled) {
                        next(guardResult as IGuardReturn);
                    }
                }
                // 如果守卫是同步的，且没有返回值，也没有调用next(), 则停留在原地
                else if (!isNextCalled) {
                    next();
                }
            } catch (err) {
                if (!isNextCalled) {
                    next(err as Error);
                }
            }
        }

        nextGuard();
    });
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
        try {
            const finalRoute = await runGuardQueue(this.beforeGuards, toRoute, fromRoute);
            this.currentRoute.value = finalRoute;
            console.log(`[MiniRouter] 导航成功: from=${fromRoute?.fullPath}, to=${toRoute.fullPath}`);
        } catch (result) {
            if (result === false) {
                // 导航中断 (next(false))，停留在原地
                console.warn(`[MiniRouter] 导航中断: ${fromRoute?.fullPath}`);
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
