<template>
  <div>
    <SectionHeader
      :header="`Ваша компания: ${members.length}`"
      level="h2"
      paragraph="Хорошо, когда все знают, что впереди.">
      <template #actions>
        <Button
          v-if="canEdit"
          size="sm"
          @click="inviting = true">
          <PhPlus :size="16" />
          Пригласить участников
        </Button>
      </template>
    </SectionHeader>
    <Card :class="style.membersCard">
      <div :class="style.memberTableHead">
        <span>Участник</span>
        <span>Доступ</span>
        <span />
      </div>
      <div
        v-for="member in members"
        :key="member.id"
        :class="style.memberRow">
        <Avatar
          :class="style.memberAvatar"
          :name="member.name"
          :color="member.color" />
        <div :class="style.memberName">
          <strong>
            {{ member.name }}
            <small v-if="member.email === store.profile.email">(вы)</small>
          </strong>
          <span>{{ member.email }}</span>
        </div>
        <Badge
          :class="style.memberRole"
          :variant="member.role === 'organizer' ? 'green' : 'neutral'">
          {{ member.role === 'organizer' ? 'Организатор' : 'Только просмотр' }}
        </Badge>
        <Button
          v-if="canEdit && member.role !== 'organizer'"
          variant="ghost"
          icon-only
          :class="style.memberAction"
          @click="removing = member">
          <PhTrash :size="16" />
        </Button>
        <span
          v-else
          :class="style.memberRowSpacer" />
      </div>
      <EmptyState
        v-if="!members.length"
        title="Пока только вы"
        description="Пригласите тех, с кем хочется разделить путешествие."
        :icon="PhUsers" />
    </Card>
    <div :class="style.accessNote">
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
      <p :class="sharedStyle.subtle">
        {{ removing?.name }} будет удалён из списка участников поездки.
      </p>
      <div :class="sharedStyle.formActions">
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
<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ParticipantsPage.module.scss'
import { defineComponent, markRaw } from 'vue'
import { PhInfo, PhPlus, PhTrash, PhUsers } from '@phosphor-icons/vue'
import { Button, Avatar, Badge, Card, EmptyState, Modal } from '@/components/ui'
import InviteForm from '@/components/trip/InviteForm.vue'
import type { Participant } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'

export default defineComponent({
  name: 'ParticipantsPage',
  components: {
    SectionHeader,
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
      sharedStyle,
      style,
      inviting: false,
      removing: undefined as Participant | undefined,
      PhUsers: markRaw(PhUsers),
    }
  },
  computed: {
    members() {
      return this.store.members(this.tripId)
    },
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
