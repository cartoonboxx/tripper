import type { PasswordCredential } from '@/types/auth.types'

const storageKey = 'tripper:passwordCredential'

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bytes = Uint8Array.from(salt.match(/../g)!, (byte) => parseInt(byte, 16))
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: bytes, iterations: 210000, hash: 'SHA-256' },
    key,
    256,
  )
  return toHex(new Uint8Array(hash))
}

export function readPasswordCredential(): PasswordCredential | null {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (
      saved &&
      typeof saved.salt === 'string' &&
      /^[a-f0-9]{32}$/.test(saved.salt) &&
      typeof saved.hash === 'string' &&
      /^[a-f0-9]{64}$/.test(saved.hash)
    )
      return { salt: saved.salt, hash: saved.hash }
  } catch {
    return null
  }
  return null
}

export async function createPasswordCredential(password: string): Promise<PasswordCredential> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  return { salt, hash: await hashPassword(password, salt) }
}

export async function verifyPassword(
  password: string,
  credential: PasswordCredential,
): Promise<boolean> {
  return (await hashPassword(password, credential.salt)) === credential.hash
}

export function savePasswordCredential(credential: PasswordCredential) {
  localStorage.setItem(storageKey, JSON.stringify(credential))
}
