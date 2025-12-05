import { removeTrailingSlash } from "../location";
import { isBrowser } from "../utils/env";

type HistoryLocation = string

type ValueContainer<T> = { value: T }


function normalizeBase(base?: string): string {
  if (!base) {
    if (isBrowser) {
      // respect <base> 标签
      const baseEl = document.querySelector('base');
      base = (baseEl?.getAttribute('href')) || '/';
      // 去掉完整的 URL 协议和主机部分
      // ^\w+ 协议名 
      // \/\/ 双斜杠 
      // [^/]+ 主机名 可选路径
      base = base.replace(/^\w+:\/\/[^/]+/, '');
    } else {
      base = '/';
    }
  }

  // 确保 base 以斜杠开头，避免 hash 模式下的 file:// 路径问题
  if (base[0] !== '/' && base[0] !== '#') base = '/' + base;

  // 去掉末尾的斜杠，方便后续直接拼接 fullPath
  return removeTrailingSlash(base);
}


export type { HistoryLocation, ValueContainer }
export { normalizeBase };
