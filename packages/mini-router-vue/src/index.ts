// 统一具名导出所有模块，作为库的公开 API

import { RouterLink } from './components/RouterLink';
import { RouterView } from './components/RouterView';

export * from './history';
export * from './router';

export { RouterLink, RouterView };
