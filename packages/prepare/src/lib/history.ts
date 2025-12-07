enum EHistoryMode {
  Hash = 'hash',
  History = 'history'
}

type IListener = (to: string, from: string) => void

interface ILibHistory {
  readonly historyMode: EHistoryMode;
  readonly currentPath: string
  push(path: string): void
  replace(path: string): void
  listen(listener: IListener): () => void
}


class LibHistory implements ILibHistory {
  public readonly historyMode: EHistoryMode = EHistoryMode.History
  public _currentPath: string

  private changeListeners: Set<IListener> = new Set()

  constructor() {
    this._currentPath = this.getCleanPath(window.location.pathname)

    window.addEventListener('popstate', () => {
      const newPath = this.getCleanPath(window.location.pathname)
      const fromPath = this._currentPath

      if (newPath === fromPath) {
        return
      }

      this._currentPath = newPath
      this.notifyListeners(newPath, fromPath)
    })

  }

  public get currentPath() {
    return this._currentPath
  }

  public getCleanPath(path: string) {
    return path.replace(/\/$/, '') || '/'
  }

  private notifyListeners(to: string, from: string) {
    this.changeListeners.forEach(listener => {
      listener(to, from)
    })
  }

  public push(path: string) {
    const fromPath = this._currentPath
    const toPath = this.getCleanPath(path)

    if (toPath !== fromPath) {
      window.history.pushState({}, '', toPath)
      this._currentPath = toPath
      this.notifyListeners(toPath, fromPath)
    }
  }

  public replace(path: string) {
    const fromPath = this._currentPath
    const toPath = this.getCleanPath(path)

    if (toPath !== fromPath) {
      window.history.replaceState({}, '', toPath)
      this._currentPath = toPath
      this.notifyListeners(toPath, fromPath)
    }
  }

  public listen(listener: IListener) {
    this.changeListeners.add(listener)

    return () => {
      this.changeListeners.delete(listener)
    }
  }
}


export {
  EHistoryMode,
  type IListener,
  type ILibHistory,
  LibHistory
}
