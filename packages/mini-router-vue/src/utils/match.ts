import { match } from 'path-to-regexp';
import type { IRouteRecord } from '../types';

/**
 * 路由匹配结果的结构 (IRouteMatchResult)
 */
export interface IRouteMatchResult {
    record: IRouteRecord;
    params: Record<string, string>;
}

/**
 * 核心匹配函数：使用 path-to-regexp 模拟逻辑进行路由匹配。
 * 该函数负责遍历路由记录，并调用 match 匹配器。
 * * @param path 要匹配的实际 URL 路径 (例如: /user/123)
 * @param records 路由配置记录数组
 * @returns 匹配结果 (包含路由记录和提取的参数) 或 null
 */
function matchRecords(path: string, records: IRouteRecord[]): IRouteMatchResult | null {
    // 确保路径以 / 开头，并且清理末尾斜杠
    const cleanPath = path.replace(/\/$/, '') || '/';

    // 遍历所有路由配置，尝试匹配
    for (const record of records) {
        // 1. 严格按照 path-to-regexp 签名：创建匹配器 (match(path))
        const pathMatcher = match(record.path);

        // 2. 执行匹配器，传入实际路径 (matcher(pathname))
        const matchResult = pathMatcher(cleanPath);

        if (matchResult) {
            // 匹配成功，返回结果
            return {
                record: record,
                // 将 path-to-regexp 提取的参数赋值给结果
                params: matchResult.params as Record<string, string>
            };
        }
    }

    // 如果所有路由都没有匹配成功
    return null;
}

function getCleanPath(path: string): string {
    // 去掉末尾的斜杠，如果结果为空则返回根路径 '/'
    return path.replace(/\/$/, '') || '/';
}

export { matchRecords, getCleanPath };
