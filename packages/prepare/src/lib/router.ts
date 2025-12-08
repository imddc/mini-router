import { type ILibHistory, LibHistory } from './history';

const ROUTER_KEY = Symbol.for('ROUTER_KEY');

interface ILibRouter {
  options: IRouterOptions;
  currentRoute: IRouteRecord | null;
  push(path: string): void;
  replace(path: string): void;
}

interface IRouteRecord {
  path: string;
  name?: string;
  component: object;
  meta?: Record<string, any>;
}

interface IRouterOptions {
  history: ILibHistory;
  routes: IRouteRecord[];
}

class LibRouter implements ILibRouter {
  public options: IRouterOptions;
  public currentRoute: IRouteRecord | null;
  private routeRecords: IRouteRecord[];
  private history: ILibHistory;

  /**
   * @description 匹配路由记录
   * @param path 路由路径
   * @returns 匹配的路由记录
   */
  private matchRoute(path: string) {
    return this.routeRecords.find((record) => record.path === path) ?? null;
  }

  constructor(options: IRouterOptions) {
    this.options = options;
    this.routeRecords = options.routes;
    this.history = options.history;

    this.history.listen((toPath, fromPath) => {
      const matchedRecord = this.matchRoute(toPath);

      const currentRoute = matchedRecord;

      console.log(`[mini-router] Navigated from ${fromPath} to ${toPath}`);
      console.log('Matched Route Record', currentRoute);
    });

    const initialPath = this.history.currentPath;
    this.currentRoute = this.matchRoute(initialPath);
  }

  push(url: string) {
    this.history.push(url);
  }

  replace(path: string): void {
    this.history.replace(path);
  }
}

function createRouter(options: IRouterOptions) {
  return new LibRouter(options);
}

function createWebHistory() {
  return new LibHistory();
}

export {
  type ILibRouter,
  ROUTER_KEY,
  LibRouter,
  createRouter,
  createWebHistory
};
