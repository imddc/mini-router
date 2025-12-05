import { stripBase } from '../location';
import type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  RouterHistory
} from '../types';
import { assign } from '../utils';
import { normalizeBase, type ValueContainer } from './common';

type PopStateListener = (this: Window, ev: PopStateEvent) => any;

interface StateEntry extends HistoryState {
  back: HistoryLocation | null;
  current: HistoryLocation;
  forward: HistoryLocation | null;
  position: number;
  replaced: boolean;
}

const createBaseLocation = () => location.protocol + '//' + location.host;

function createHref(base: string, to: HistoryLocation) {
  return base + to;
}

/**
 * 从 window.location 对象创建一个标准化的 history location
 *
 * @param base - 路由的基础路径
 * @param location {Location} - window.location 对象
 * @returns 标准化的 history location 字符串
 */
function createCurrentLocation(base: string, location: Location) {
  // 解构出 location 中的 pathname、search 和 hash
  const { pathname, search, hash } = location;

  // 检查 base 中是否包含 '#'，用于判断是否存在 hash 模式
  const hashPos = base.indexOf('#');

  if (hashPos > -1) {
    // 如果 hash 中包含 base 的 hash 部分，则 slicePos 为 base 的 hash 长度，否则为 1
    const slicePos = hash.includes(base.slice(hashPos))
      ? base.slice(hashPos).length
      : 1;
    // 从 hash 中提取路径部分
    let pathFromHash = hash.slice(slicePos);
    // 如果提取出的路径以 '/' 开头，则确保前面只有一个 '/'
    if (pathFromHash[0] === '/') {
      pathFromHash = '/' + pathFromHash;
    }
    // 返回去除 base 后的路径
    return stripBase(pathFromHash, '');
  }
  // 如果 base 中不包含 '#'，则直接拼接 pathname（去除 base）、search 和 hash
  const path = stripBase(pathname, base);
  return path + search + hash;
}

function useHistoryStateNavigation(base: string) {
  const state = {
    value: {
      back: null,
      current: '',
      forward: null,
      position: 0,
      replaced: false,
    }
  }

  const location = {
    value: ''
  }

  const replace = (to: HistoryLocation, state?: HistoryState) => {
    history.replaceState(state, '', createHref(base, to));
  }


  return {
    state,
    location,
    replace
  }
}

function useHistoryListeners(
  base: string,
  historyState: ValueContainer<StateEntry>,
  currentLocation: ValueContainer<HistoryLocation>,
  replace: RouterHistory['replace']
) {

  function pauseListeners() {

  }

  return {
    pauseListeners
  }
}

/**
 * 创建一个 HTML5 历史记录对象，用于单页应用程序的路由导航。
 *
 * @param base - 路由的基础路径
 */
function createWebHistory(base?: string): RouterHistory {
  base = normalizeBase(base);

  const historyNavigation = useHistoryStateNavigation(base);
  const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace
  );

  function go(delta: number, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners();
    history.go(delta);
  }

  const routerHistory: RouterHistory = assign(
    {
      // it's overridden right after
      location: '',
      base,
      go,
    },

    historyNavigation,
    historyListeners
  );

  Object.defineProperty(routerHistory, 'location', {
    enumerable: true,
    get: () => historyNavigation.location.value
  });

  Object.defineProperty(routerHistory, 'state', {
    enumerable: true,
    get: () => historyNavigation.state.value
  });

  return routerHistory;
}

export { createWebHistory };
