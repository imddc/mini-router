import type { App, Ref } from 'vue';
import { readonly, shallowRef } from 'vue';
import { RouterLink } from './components/RouterLink';
import { RouterView } from './components/RouterView';
import { ROUTER_KEY } from './history/common';
import type { ILibHistory } from './history/html5';
import type { IRouteNormalizedRouteRecord, IRouteRecord, IRouter, IRouterOptions } from './types';

class LibRouter implements IRouter {
    options: IRouterOptions;
    public currentRoute: Ref<IRouteNormalizedRouteRecord | null> = shallowRef(null);
    public routes: IRouteRecord[];
    private history: ILibHistory;

    constructor(options: IRouterOptions) {
        this.options = options;
        this.routes = options.routes;
        this.history = options.history;

        this.history.listen((to, from) => {
            const target = this.matchRoute(to);
            this.currentRoute.value = target;

            console.log(`[mini-router] Navigated from ${from} to ${to}`);
            console.log('Matched Route Record', target);
        });

        const initialPath = this.history.currentPath;
        this.currentRoute.value = this.matchRoute(initialPath);
    }

    /**
     * todo:  将路由组信息和解析后的path信息组合
     * @description 匹配路由记录
     * @param path 路由路径
     * @returns 匹配的路由记录
     */
    private matchRoute(path: string): IRouteNormalizedRouteRecord | null {
        const matchedPath = this.routes.find((record) => record.path === path) ?? null;
        const result = { ...matchedPath } as IRouteNormalizedRouteRecord;

        return result;
    }

    push(path: string): void {
        this.history.push(path);
    }

    replace(path: string): void {
        this.history.replace(path);
    }

    getRoutes() {
        return this.routes;
    }

    install(app: App): void {
        // 1. 提供全局的 $router
        app.config.globalProperties.$router = this;
        // 2. 提供全局的 $route 只读
        app.config.globalProperties.$route = readonly(this.currentRoute);
        // 3. 提供 router 实例
        app.provide(ROUTER_KEY, this);
        // todo 4. 提供全局组件
        app.component('RouterView', RouterView);
        app.component('RouterLink', RouterLink);
    }
}

function createRouter(options: IRouterOptions) {
    return new LibRouter(options);
}

export { LibRouter, createRouter };
