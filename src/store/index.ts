export type AppStore = {
  theme: 'light' | 'dark'
  isAuthenticated: boolean
}

export const initialStore: AppStore = {
  theme: 'light',
  isAuthenticated: false,
}

export function createStore() {
  return { ...initialStore }
}
