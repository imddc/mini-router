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
  history: 'hash' | 'history';
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

export type HistoryLocation = string;

/**
 * Allowed arrays for history.state.
 *
 * @internal
 */
export interface HistoryStateArray extends Array<HistoryStateValue> { }

/**
 * Allowed variables in HTML5 history state. Note that pushState clones the state
 * passed and does not accept everything: e.g.: it doesn't accept symbols, nor
 * functions as values. It also ignores Symbols as keys.
 *
 * @internal
 */
export type HistoryStateValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | HistoryState
  | HistoryStateArray;

export interface HistoryState {
  [x: number]: HistoryStateValue;
  [x: string]: HistoryStateValue;
}

export enum NavigationDirection {
  back = 'back',
  forward = 'forward',
  unknown = '',
}

export interface NavigationInformation {
  type: NavigationType
  direction: NavigationDirection
  delta: number
}


export type NavigationCallback = (
  to: HistoryLocation,
  from: HistoryLocation,
  information: NavigationInformation
) => void;

/**
 * Interface implemented by History implementations that can be passed to the
 * router as {@link Router.history}
 *
 * @alpha
 */
export interface RouterHistory {
  /**
   * Base path that is prepended to every url. This allows hosting an SPA at a
   * sub-folder of a domain like `example.com/sub-folder` by having a `base` of
   * `/sub-folder`
   */
  readonly base: string;
  /**
   * Current History location
   */
  readonly location: HistoryLocation;
  /**
   * Current History state
   */
  readonly state: HistoryState;
  // readonly location: ValueContainer<HistoryLocationNormalized>

  /**
   * Navigates to a location. In the case of an HTML5 History implementation,
   * this will call `history.pushState` to effectively change the URL.
   *
   * @param to - location to push
   * @param data - optional {@link HistoryState} to be associated with the
   * navigation entry
   */
  push(to: HistoryLocation, data?: HistoryState): void;
  /**
   * Same as {@link RouterHistory.push} but performs a `history.replaceState`
   * instead of `history.pushState`
   *
   * @param to - location to set
   * @param data - optional {@link HistoryState} to be associated with the
   * navigation entry
   */
  replace(to: HistoryLocation, data?: HistoryState): void;

  /**
   * Traverses history in a given direction.
   *
   * @example
   * ```js
   * myHistory.go(-1) // equivalent to window.history.back()
   * myHistory.go(1) // equivalent to window.history.forward()
   * ```
   *
   * @param delta - distance to travel. If delta is \< 0, it will go back,
   * if it's \> 0, it will go forward by that amount of entries.
   * @param triggerListeners - whether this should trigger listeners attached to
   * the history
   */
  go(delta: number, triggerListeners?: boolean): void;

  /**
   * Attach a listener to the History implementation that is triggered when the
   * navigation is triggered from outside (like the Browser back and forward
   * buttons) or when passing `true` to {@link RouterHistory.back} and
   * {@link RouterHistory.forward}
   *
   * @param callback - listener to attach
   * @returns a callback to remove the listener
   */
  listen(callback: NavigationCallback): () => void;

  /**
   * Generates the corresponding href to be used in an anchor tag.
   *
   * @param location - history location that should create an href
   */
  createHref(location: HistoryLocation): string;

  /**
   * Clears any event listener attached by the history implementation.
   */
  destroy(): void;
}
