import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { createPinia, setActivePinia } from 'pinia'
import { useTravelStore } from '@/stores/travel'
import { verifyPassword } from '@/utils/password'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.stubGlobal('crypto', webcrypto)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

it('sets and changes a local password, validates the current password and survives reload', async () => {
  const store = useTravelStore()
  expect(await store.changePassword('', 'short')).not.toBe('')
  expect(store.passwordCredential).toBeNull()
  expect(await store.changePassword('', 'first-password')).toBe('')
  const initial = { ...store.passwordCredential! }
  expect(localStorage.getItem('tripper:passwordCredential')).not.toContain('first-password')
  expect(await store.changePassword('wrong-password', 'second-password')).toContain('неверно')
  expect(store.passwordCredential).toEqual(initial)
  expect(await store.changePassword('first-password', 'first-password')).toContain('отличаться')
  expect(await store.changePassword('first-password', 'second-password')).toBe('')
  expect(store.passwordCredential!.salt).not.toBe(initial.salt)
  setActivePinia(createPinia())
  const restored = useTravelStore()
  expect(await verifyPassword('first-password', restored.passwordCredential!)).toBe(false)
  expect(await verifyPassword('second-password', restored.passwordCredential!)).toBe(true)
})

it('keeps the previous password when saving fails', async () => {
  const store = useTravelStore()
  await store.changePassword('', 'first-password')
  const initial = { ...store.passwordCredential! }
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage full')
  })
  await expect(store.changePassword('first-password', 'second-password')).rejects.toThrow(
    'Storage full',
  )
  expect(store.passwordCredential).toEqual(initial)
})
