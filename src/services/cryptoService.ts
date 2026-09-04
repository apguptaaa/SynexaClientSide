const PRIVATE_KEY_STORAGE = 'synexa.e2ee.privateKey'
const PUBLIC_KEY_STORAGE = 'synexa.e2ee.publicKey'

type EncryptedText = {
  text: string
  iv: string
  isE2EE: true
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value)
  const bytes = new Uint8Array(new ArrayBuffer(decoded.length))
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index)
  }
  return bytes
}

async function importPublicKey(value: string): Promise<CryptoKey> {
  const bytes = fromBase64(value)
  return crypto.subtle.importKey(
    'spki',
    bytes.buffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )
}

async function importPrivateKey(value: string): Promise<CryptoKey> {
  const bytes = fromBase64(value)
  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey'],
  )
}

async function getKeyPair(): Promise<{ privateKey: CryptoKey; publicKey: string }> {
  const storedPrivateKey = localStorage.getItem(PRIVATE_KEY_STORAGE)
  const storedPublicKey = localStorage.getItem(PUBLIC_KEY_STORAGE)
  if (storedPrivateKey && storedPublicKey) {
    return { privateKey: await importPrivateKey(storedPrivateKey), publicKey: storedPublicKey }
  }

  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  ) as CryptoKeyPair
  const privateKey = await crypto.subtle.exportKey('pkcs8', pair.privateKey)
  const publicKey = await crypto.subtle.exportKey('spki', pair.publicKey)
  localStorage.setItem(PRIVATE_KEY_STORAGE, toBase64(new Uint8Array(privateKey)))
  localStorage.setItem(PUBLIC_KEY_STORAGE, toBase64(new Uint8Array(publicKey)))
  return { privateKey: pair.privateKey, publicKey: toBase64(new Uint8Array(publicKey)) }
}

async function sharedKey(peerPublicKey: string): Promise<CryptoKey> {
  const { privateKey } = await getKeyPair()
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: await importPublicKey(peerPublicKey) },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export const cryptoService = {
  async registerPublicKey(register: (publicKey: string) => Promise<unknown>) {
    const { publicKey } = await getKeyPair()
    await register(publicKey)
  },

  async encrypt(text: string, peerPublicKey: string): Promise<EncryptedText> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      await sharedKey(peerPublicKey),
      new TextEncoder().encode(text),
    )
    return { text: toBase64(new Uint8Array(ciphertext)), iv: toBase64(iv), isE2EE: true }
  },

  async decrypt(text: string, iv: string, peerPublicKey: string): Promise<string> {
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) },
      await sharedKey(peerPublicKey),
      fromBase64(text),
    )
    return new TextDecoder().decode(plaintext)
  },
}
