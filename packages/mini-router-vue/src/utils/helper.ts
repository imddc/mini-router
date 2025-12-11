import { removeTrailingSlash } from '../location';
import type { IGuardReturn, INavigationGuard, INavigationGuardNext, IRouteLocation, IRouteRecord } from '../types';
import { isPromise } from '.';
import { matchRecords } from './match';

// 默认的 404 路由位置对象
const NOT_FOUND_ROUTE: IRouteLocation = {
    fullPath: '/404',
    path: '/404',
    name: undefined,
    params: {},
    query: {},
    hash: '',
    matched: [],
    component: null,
    meta: {}
};

/**
 * @description 创建路由位置对象
 * @param path 路由路径
 * @param record 路由记录
 * @returns 路由位置对象
 */
function matchRouteLocation(path: string, records: IRouteRecord[]): IRouteLocation {
    const url = new URL(path, window.location.origin);
    const cleanPath = removeTrailingSlash(url.pathname);

    const matchedResult = matchRecords(cleanPath, records);

    if (!matchedResult) {
        return NOT_FOUND_ROUTE;
    }

    const { record: matchedRecord, params: pathParams } = matchedResult;

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    return buildRouteLocation(matchedRecord, pathParams, query, url.hash);
}

/**
 * @description 构建路由位置对象
 * @param record 路由记录
 * @returns 路由位置对象
 */
function buildRouteLocation(
    record: IRouteRecord,
    params: Record<string, string> = {},
    query: Record<string, string> = {},
    hash: string = ''
): IRouteLocation {
    return {
        params,
        query,
        hash: hash,
        fullPath: record.path,
        path: record.path,
        name: record.name,
        matched: [],
        component: record.component,
        meta: record.meta || {}
    };
}

/**
 * @description 执行导航守卫队列
 * 每个守卫都有机会修改目标路由位置或中断导航。
 * @param guards 导航守卫队列
 * @param to 目标路由位置
 * @param from  当前路由位置或 null
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

export { matchRouteLocation, buildRouteLocation, runGuardQueue };
