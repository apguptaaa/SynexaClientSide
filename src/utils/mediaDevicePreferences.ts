export interface CallMediaDevices {
  audioInputId: string
  videoInputId: string
  audioOutputId: string
}

const STORAGE_KEY = 'synexa_call_media_devices'

export function getCallMediaDevices(): CallMediaDevices {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { audioInputId: '', videoInputId: '', audioOutputId: '', ...JSON.parse(saved) }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return { audioInputId: '', videoInputId: '', audioOutputId: '' }
}

export function saveCallMediaDevice<K extends keyof CallMediaDevices>(key: K, value: CallMediaDevices[K]) {
  const devices = getCallMediaDevices()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...devices, [key]: value }))
}