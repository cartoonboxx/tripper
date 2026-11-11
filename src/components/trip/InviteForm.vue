<template>
  <Modal
    :open="open"
    title="Путешествовать лучше вместе"
    @close="$emit('close')">
    <p :class="sharedStyle.subtle">Пригласите близких посмотреть маршрут и планы поездки.</p>
    <div :class="style.inviteTabs">
      <Tab
        variant="line"
        :active="mode === 'link'"
        @click="mode = 'link'">
        <PhLink :size="16" />
        Ссылка
      </Tab>
      <Tab
        variant="line"
        :active="mode === 'qr'"
        @click="mode = 'qr'">
        <PhQrCode :size="16" />
        QR-код
      </Tab>
    </div>
    <div
      v-if="mode === 'link'"
      :class="sharedStyle.formStack">
      <Input
        :model-value="link"
        label="Ссылка-приглашение"
        readonly>
        <template #suffix>
          <Button
            variant="ghost"
            icon-only
            @click="copy">
            <PhCopy :size="16" />
          </Button>
        </template>
      </Input>
      <Button
        variant="secondary"
        @click="copy">
        <PhCopy :size="16" />
        Скопировать ссылку
      </Button>
    </div>
    <div
      v-else
      :class="style.qrPreview">
      <img
        v-if="qr"
        :src="qr"
        alt="QR-код приглашения в поездку"
        width="240"
        height="240" />
      <p :class="sharedStyle.subtle">Отсканируйте, чтобы открыть приглашение</p>
    </div>
    <div :class="style.inviteAccess">
      <span :class="[style.softIcon, sharedStyle.softIcon]">
        <PhLockKey :size="18" />
      </span>
      <div>
        <strong>Доступ только для просмотра</strong>
        <p>Участники видят план, места и информацию. Изменять общий план может организатор.</p>
      </div>
    </div>
    <p
      v-if="error"
      :class="sharedStyle.errorText">
      {{ error }}
    </p>
  </Modal>
</template>
<script lang="ts">
import style from './InviteForm.module.scss'
import sharedStyle from '@/styles/shared.module.scss'
import { defineComponent } from 'vue'
import { PhCopy, PhLink, PhLockKey, PhQrCode } from '@phosphor-icons/vue'
import QRCode from 'qrcode'
import { Modal, Tab, Input, Button } from '@/components/ui'
import { useTravelStore } from '@/stores/travel'
import { componentProps } from './InviteForm.props'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'InviteForm',
  components: { PhCopy, PhLink, PhLockKey, PhQrCode, Modal, Tab, Input, Button },
  props: componentProps,
  emits: ['close'],
  data() {
    return {
      sharedStyle,
      style,
      mode: 'link',
      qr: '',
      error: '',
      PhCopy: markRawValue(PhCopy),
      PhLink: markRawValue(PhLink),
      PhLockKey: markRawValue(PhLockKey),
      PhQrCode: markRawValue(PhQrCode),
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    link() {
      return `${window.location.origin}${import.meta.env.BASE_URL}join/${this.tripId}`
    },
  },
  methods: {
    async copy() {
      try {
        await navigator.clipboard.writeText(this.link)
        this.store.notify('Ссылка скопирована')
      } catch {
        this.error = 'Не удалось скопировать. Выделите ссылку и скопируйте её вручную.'
      }
    },
  },
  watch: {
    open: {
      async handler(open: boolean) {
        if (open) {
          try {
            this.qr = await QRCode.toDataURL(this.link, {
              width: 240,
              margin: 2,
              color: {
                dark: '#376b59',
                light: '#ffffff',
              },
            })
          } catch {
            this.error = 'Не удалось создать QR-код. Используйте ссылку.'
          }
        }
      },
      immediate: true,
    },
  },
})
</script>
