import type { App, Ref } from 'vue';
import { readonly, shallowRef } from 'vue';
import { RouterLink } from './components/RouterLink';
import { RouterView } from './components/RouterView';
import { ROUTER_KEY } from './history/common';
import type { ILibHistory } from './history/html5';
import type { IRouteLocation, IRouteRecord, IRouter, IRouterOptions } from './types';
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

class LibRouter implements IRouter {
    options: IRouterOptions;
    public currentRoute: Ref<IRouteLocation | null> = shallowRef(null);
    public routeRecords: IRouteRecord[];
    private history: ILibHistory;

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

        console.log('beforeEach => ', fromRoute, toRoute);

        // 2. (这里可以插入 Navigation Guards: beforeEach, beforeResolve, afterEach)
        // 假设 beforeEach 守卫已通过...

        // 3. 更新 currentRoute 状态，触发 RouterView 重新渲染
        this.currentRoute.value = toRoute;

        console.log(`[MiniRouter] 导航成功: from=${fromRoute?.fullPath}, to=${toRoute.fullPath}`);
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
