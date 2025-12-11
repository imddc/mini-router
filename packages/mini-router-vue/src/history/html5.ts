import { getCleanPath } from '../utils/match';

enum EHistoryMode {
    Hash = 'hash',
    History = 'history'
}

type IListener = (to: string, from: string) => void;

interface ILibHistory {
    readonly historyMode: EHistoryMode;
    readonly currentPath: string;
    push(path: string): void;
    replace(path: string): void;
    listen(listener: IListener): () => void;

    go(delta: number): void;
}

class LibHistory implements ILibHistory {
    public readonly historyMode: EHistoryMode = EHistoryMode.History;
    public _currentPath: string;

    private changeListeners: Set<IListener> = new Set();

    constructor(base?: string) {
        console.log('base => ', base);

        const _location = window.location.pathname + window.location.search + window.location.hash;
        this._currentPath = getCleanPath(_location);

        window.addEventListener('popstate', () => {
            const newPath = getCleanPath(window.location.pathname);
            const fromPath = this._currentPath;

            if (newPath === fromPath) {
                return;
            }

            this._currentPath = newPath;
            this.notifyListeners(newPath, fromPath);
        });
    }

    /**
     * @description 导航到指定的路径。
     * @param delta 导航偏移量，正值表示前进，负值表示后退
     */
    go(delta: number) {
        return window.history.go(delta);
    }

    public get currentPath(): string {
        return this._currentPath;
    }

    private notifyListeners(to: string, from: string) {
        this.changeListeners.forEach((listener) => {
            listener(to, from);
        });
    }

    public push(path: string): void {
        const fromPath = this._currentPath;
        const toPath = getCleanPath(path);

        if (toPath !== fromPath) {
            window.history.pushState({}, '', toPath);
            this._currentPath = toPath;
            this.notifyListeners(toPath, fromPath);
        }
    }

    public replace(path: string): void {
        const fromPath = this._currentPath;
        const toPath = getCleanPath(path);

        if (toPath !== fromPath) {
            window.history.replaceState({}, '', toPath);
            this._currentPath = toPath;
            this.notifyListeners(toPath, fromPath);
        }
    }

    public listen(listener: IListener) {
        this.changeListeners.add(listener);

        return (): void => {
            this.changeListeners.delete(listener);
        };
    }
}

/**
 *
 * @param base - 路由基础路径
 * @returns 新的 LibHistory 实例
 * todo 未来会改
 */
function createWebHistory(base?: string): LibHistory {
    return new LibHistory(base);
}

export { EHistoryMode, type IListener, type ILibHistory, LibHistory, createWebHistory };
