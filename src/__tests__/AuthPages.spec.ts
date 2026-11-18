import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LoginPage from '@/pages/Auth/Login/LoginPage.vue'
import RegistrationPage from '@/pages/Auth/Registration/RegistrationPage.vue'
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

function pageOptions() {
  return {
    global: {
      mocks: { $router: { push: vi.fn<(path: string) => void>() } },
      stubs: { AuthLayout: { template: '<div><slot /></div>' }, AppLink: true },
    },
  }
}

describe('separate authentication pages', () => {
  it('renders the fields and password autocomplete appropriate to each page', () => {
    const login = mount(LoginPage, pageOptions())
    expect(login.find('input[autocomplete="name"]').exists()).toBe(false)
    expect(login.find('input[type="checkbox"]').exists()).toBe(false)
    expect(login.get('input[type="password"]').attributes('autocomplete')).toBe('current-password')
    const registration = mount(RegistrationPage, pageOptions())
    expect(registration.find('input[autocomplete="name"]').exists()).toBe(true)
    expect(registration.find('input[type="checkbox"]').exists()).toBe(true)
    expect(registration.get('input[type="password"]').attributes('autocomplete')).toBe(
      'new-password',
    )
    login.unmount()
    registration.unmount()
  })

  it('checks saved credentials before logging in', async () => {
    const store = useTravelStore()
    await store.changePassword('', 'saved-password')
    store.profile.email = 'anna@example.com'
    store.session = false
    vi.spyOn(store, 'notify').mockImplementation(() => {})
    const options = pageOptions()
    const login = mount(LoginPage, options)
    login.vm.email = ' ANNA@example.com '
    login.vm.password = 'incorrect-password'
    await login.vm.submit()
    expect(login.vm.error).toBe('Неверная электронная почта или пароль.')
    expect(store.session).toBe(false)
    expect(options.global.mocks.$router.push).not.toHaveBeenCalled()
    login.vm.password = 'saved-password'
    await login.vm.submit()
    expect(store.session).toBe(true)
    expect(login.vm.password).toBe('')
    expect(options.global.mocks.$router.push).toHaveBeenCalledWith('/')
    login.unmount()
  })

  it('requires consent before creating the account and stores its credentials', async () => {
    const store = useTravelStore()
    vi.spyOn(store, 'notify').mockImplementation(() => {})
    const options = pageOptions()
    const registration = mount(RegistrationPage, options)
    registration.vm.name = ' Анна '
    registration.vm.email = ' anna@example.com '
    registration.vm.password = 'registered-password'
    await registration.vm.submit()
    expect(registration.vm.error).toBe('Подтвердите согласие с локальным хранением данных.')
    expect(store.passwordCredential).toBeNull()
    registration.vm.accepted = true
    await registration.vm.submit()
    expect(store.profile).toMatchObject({ name: 'Анна', email: 'anna@example.com' })
    expect(await verifyPassword('registered-password', store.passwordCredential!)).toBe(true)
    expect(store.session).toBe(true)
    expect(registration.vm.password).toBe('')
    expect(options.global.mocks.$router.push).toHaveBeenCalledWith('/')
    registration.unmount()
  })

  it('does not replace an existing account during registration', async () => {
    const store = useTravelStore()
    await store.changePassword('', 'existing-password')
    const profile = { ...store.profile }
    const options = pageOptions()
    const registration = mount(RegistrationPage, options)
    registration.vm.name = 'Другой пользователь'
    registration.vm.email = 'other@example.com'
    registration.vm.password = 'new-account-password'
    registration.vm.accepted = true
    await registration.vm.submit()
    expect(registration.vm.error).toBe('На этом устройстве уже есть аккаунт. Войдите в него.')
    expect(store.profile).toEqual(profile)
    expect(await verifyPassword('existing-password', store.passwordCredential!)).toBe(true)
    expect(options.global.mocks.$router.push).not.toHaveBeenCalled()
    expect(registration.vm.submitting).toBe(false)
    registration.unmount()
  })

  it('generates credentials for name-only registration and shows the password before leaving', async () => {
    const store = useTravelStore()
    vi.spyOn(store, 'notify').mockImplementation(() => {})
    const options = pageOptions()
    const registration = mount(RegistrationPage, options)
    registration.vm.email = 'unfinished-email'
    registration.vm.password = 'short'
    registration.vm.onlyName = ' Путешественник '
    await registration.vm.submit()
    expect(store.passwordCredential).toBeNull()
    expect(registration.vm.error).toBe('Подтвердите согласие с локальным хранением данных.')
    registration.vm.accepted = true
    await registration.vm.submit()
    const generated = registration.vm.generatedPassword
    expect(generated).toMatch(/^[a-f0-9]{32}$/)
    expect(store.profile).toMatchObject({ name: 'Путешественник', email: '' })
    expect(store.session).toBe(true)
    expect(await verifyPassword(generated, store.passwordCredential!)).toBe(true)
    expect(options.global.mocks.$router.push).not.toHaveBeenCalled()
    expect(registration.get('input[readonly]').element).toBeDefined()
    expect(Object.values(localStorage).join('')).not.toContain(generated)
    const credential = { ...store.passwordCredential! }
    await registration.vm.submit()
    expect(store.passwordCredential).toEqual(credential)
    registration.unmount()
  })

  it('logs into an account without email using its name and generated password', async () => {
    const store = useTravelStore()
    vi.spyOn(store, 'notify').mockImplementation(() => {})
    const registration = mount(RegistrationPage, pageOptions())
    registration.vm.onlyName = 'Путешественник'
    registration.vm.accepted = true
    await registration.vm.submit()
    const generated = registration.vm.generatedPassword
    registration.unmount()
    store.session = false
    const options = pageOptions()
    const login = mount(LoginPage, options)
    expect(login.get('input[autocomplete="username"]').attributes('type')).toBe('text')
    login.vm.email = 'Другое имя'
    login.vm.password = generated
    await login.vm.submit()
    expect(login.vm.error).toBe('Неверное имя пользователя или пароль.')
    expect(store.session).toBe(false)
    login.vm.email = ' путешественник '
    login.vm.password = 'incorrect-password'
    await login.vm.submit()
    expect(store.session).toBe(false)
    login.vm.password = generated
    await login.vm.submit()
    expect(store.session).toBe(true)
    expect(store.profile.email).toBe('')
    expect(options.global.mocks.$router.push).toHaveBeenCalledWith('/')
    login.unmount()
  })

  it('requires a name and keeps manual registration password validation', async () => {
    const registration = mount(RegistrationPage, pageOptions())
    registration.vm.onlyName = '   '
    registration.vm.accepted = true
    await registration.vm.submit()
    expect(registration.vm.error).toBe('Укажите имя пользователя.')
    registration.vm.name = 'Анна'
    await registration.vm.submit()
    expect(registration.vm.error).toBe('Укажите электронную почту.')
    registration.vm.email = 'anna@example.com'
    registration.vm.password = 'short'
    await registration.vm.submit()
    expect(registration.vm.error).toBe('Пароль должен содержать не менее 8 символов.')
    expect(useTravelStore().passwordCredential).toBeNull()
    registration.unmount()
  })

  it('does not replace an existing password through name-only registration', async () => {
    const store = useTravelStore()
    await store.changePassword('', 'existing-password')
    const profile = { ...store.profile }
    const registration = mount(RegistrationPage, pageOptions())
    registration.vm.onlyName = 'Другой пользователь'
    registration.vm.accepted = true
    await registration.vm.submit()
    expect(registration.vm.error).toBe('На этом устройстве уже есть аккаунт. Войдите в него.')
    expect(registration.vm.generatedPassword).toBe('')
    expect(store.profile).toEqual(profile)
    expect(await verifyPassword('existing-password', store.passwordCredential!)).toBe(true)
    registration.unmount()
  })

  it('copies the generated password and keeps it available if copying fails', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const registration = mount(RegistrationPage, pageOptions())
    registration.vm.generatedPassword = 'generated-password'
    await registration.vm.copyPassword()
    expect(writeText).toHaveBeenCalledWith('generated-password')
    expect(registration.vm.passwordCopied).toBe(true)
    writeText.mockRejectedValue(new Error('Clipboard is unavailable'))
    await registration.vm.copyPassword()
    expect(registration.vm.error).toContain('скопируйте его вручную')
    expect(registration.vm.generatedPassword).toBe('generated-password')
    registration.unmount()
  })
})
