export const BACKEND_URL = 'https://synexabackend.onrender.com'
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '644066194449-mj91v7cjpl8d8rtsfstuvdt4rrjl068t.apps.googleusercontent.com'

export const APP_CONFIG = {
  appName: 'Synexa',
  apiBaseUrl: `${BACKEND_URL}/api`,
  maxFileSize: 5 * 1024 * 1024,
} as const
