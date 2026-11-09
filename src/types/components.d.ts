export {}
declare module 'vue' {
  export interface GlobalComponents {
    AppLink: (typeof import('@/components/navigation/AppLink.vue'))['default']
  }
}
