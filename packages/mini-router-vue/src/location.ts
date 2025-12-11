/**
 * 以不区分大小写的方式从 location.pathname 的开头移除 base。
 *
 * @param pathname - location.pathname
 * @param base - 要移除的 base
 */
function stripBase(pathname: string, base: string): string {
    // 没有 base 或者 pathname 开头不包含 base（忽略大小写）
    if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase())) return pathname;
    return pathname.slice(base.length) || '/';
}

// 匹配路径末尾的斜杠
const TRAILING_SLASH_RE = /\/$/;

/**
 * 移除路径末尾的斜杠
 * @param path - 要移除斜杠的路径
 * @returns 移除末尾斜杠后的路径
 */
function removeTrailingSlash(path: string) {
    return path.replace(TRAILING_SLASH_RE, '');
}

export { stripBase, removeTrailingSlash };
