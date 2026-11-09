<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ParticipantsComponent.module.scss'
import { defineComponent } from 'vue'
import { PhInfo, PhPlus, PhTrash, PhUsers } from '@phosphor-icons/vue'
import { Button, Avatar, Badge, Card, EmptyState, Modal } from '@/components/ui'
import InviteForm from '@/components/trip/InviteForm.vue'
import type { Participant } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'ParticipantsComponent',
  components: {
    PhInfo,
    PhPlus,
    PhTrash,
    Button,
    Avatar,
    Badge,
    Card,
    EmptyState,
    Modal,
    InviteForm,
  },
  mixins: [tripContext],
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      inviting: false,
      removing: undefined as Participant | undefined,
      PhInfo: markRawValue(PhInfo),
      PhPlus: markRawValue(PhPlus),
      PhTrash: markRawValue(PhTrash),
      PhUsers: markRawValue(PhUsers),
    }
  },
  methods: {
    remove() {
      if (!this.canEdit) return
      this.store.participants = this.store.participants.filter((p) => p.id !== this.removing?.id)
      this.removing = undefined
      this.store.notify('Участник удалён')
    },
  },
})
</script>
<template>
  <div>
    <header :class="[style.sectionHeading]">
      <div>
        <span :class="[style.eyebrow]">ОБЩИЕ ПЛАНЫ, ОБЩИЕ ВПЕЧАТЛЕНИЯ</span>
        <h2>
          Ваша компания
          <span :class="[style.subtle]">{{ store.members(tripId).length }}</span>
        </h2>
        <p>Хорошо, когда все знают, что впереди.</p>
      </div>
      <Button
        v-if="canEdit"
        size="sm"
        @click="inviting = true">
        <PhPlus :size="16" />
        Пригласить участников
      </Button>
    </header>
    <Card :class="[style.membersCard]">
      <div :class="[style.memberTableHead]">
        <span>Участник</span>
        <span>Доступ</span>
        <span />
      </div>
      <div
        v-for="member in store.members(tripId)"
        :key="member.id"
        :class="[style.memberRow]">
        <Avatar
          :name="member.name"
          :color="member.color" />
        <div :class="[style.memberName]">
          <strong>
            {{ member.name }}
            <small v-if="member.email === store.profile.email">(вы)</small>
          </strong>
          <span>{{ member.email }}</span>
        </div>
        <Badge :variant="member.role === 'organizer' ? 'green' : 'neutral'">
          {{ member.role === 'organizer' ? 'Организатор' : 'Только просмотр' }}
        </Badge>
        <Button
          v-if="canEdit && member.role !== 'organizer'"
          variant="ghost"
          icon-only
          :title="`Удалить участника ${member.name}`"
          @click="removing = member">
          <PhTrash :size="16" />
        </Button>
        <span
          v-else
          :class="[style.memberRowSpacer]" />
      </div>
      <EmptyState
        v-if="!store.members(tripId).length"
        title="Пока только вы"
        description="Пригласите тех, с кем хочется разделить путешествие."
        :icon="PhUsers" />
    </Card>
    <div :class="[style.accessNote]">
      <PhInfo :size="18" />
      <div>
        <strong>Как устроен доступ</strong>
        <p>
          Организатор управляет общим планом, событиями и местами. Приглашённые участники могут
          просматривать поездку. Личные чек-листы каждый ведёт самостоятельно.
        </p>
      </div>
    </div>
    <InviteForm
      :open="inviting"
      :trip-id="tripId"
      @close="inviting = false" />
    <Modal
      :open="!!removing"
      title="Удалить участника?"
      @close="removing = undefined">
      <p :class="[style.subtle]">{{ removing?.name }} будет удалён из списка участников поездки.</p>
      <div :class="[style.formActions]">
        <Button
          variant="secondary"
          @click="removing = undefined">
          Отмена
        </Button>
        <Button
          variant="danger"
          @click="remove">
          Удалить
        </Button>
      </div>
    </Modal>
  </div>
</template>
