<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ChecklistsComponent.module.scss'
import { defineComponent, markRaw } from 'vue'
import {
  PhChecks,
  PhListChecks,
  PhLockKey,
  PhPencilSimple,
  PhPlus,
  PhTrash,
  PhX,
} from '@phosphor-icons/vue'
import { Button, Tab, Checkbox, Input, Modal, Select, EmptyState } from '@/components/ui'
import type { ChecklistItem } from '@/types/trip.types'
import tripContext from '@/mixins/tripContext'

export default defineComponent({
  name: 'ChecklistsComponent',
  components: {
    SectionHeader,
    PhChecks,
    PhLockKey,
    PhPencilSimple,
    PhPlus,
    PhTrash,
    PhX,
    Button,
    Tab,
    Checkbox,
    Input,
    Modal,
    Select,
    EmptyState,
  },
  mixins: [tripContext],
  props: { attachedOnly: Boolean },
  data() {
    return {
      sharedStyle,
      style,
      selected: '',
      creating: false,
      title: '',
      linkedTrip: '',
      addingToTrip: false,
      targetTrip: '',
      newItem: '',
      editingItem: undefined as ChecklistItem | undefined,
      editTitle: '',
      deleting: false,
      PhListChecks: markRaw(PhListChecks),
    }
  },
  computed: {
    tripOptions() {
      const trips = this.store.trips
        .filter((trip) => !trip.archived && trip.role === 'organizer')
        .map((trip) => ({ label: trip.name, value: trip.id }))
      return [{ label: 'Оставить в общих чек-листах', value: '' }, ...trips]
    },
    availableTrips() {
      return this.tripOptions.filter((option) => option.value)
    },
    canManage() {
      return !this.tripId || this.canEdit
    },
    activeDescription() {
      if (!this.active) return ''
      const progress = `${this.done} из ${this.active.items.length} готово`
      if (!this.active.tripId) return progress
      const trip = this.store.trips.find((trip) => trip.id === this.active?.tripId)
      return `${progress} · ${trip?.name || ''}`
    },
    lists() {
      return this.store.checklists.filter((list) =>
        this.tripId ? list.tripId === this.tripId : !list.tripId && !this.attachedOnly,
      )
    },
    active() {
      return this.lists.find((c) => c.id === this.selected) || this.lists[0]
    },
    done() {
      return this.completedCount(this.active?.items || [])
    },
    percent() {
      return Math.round((this.done / (this.active?.items.length || 1)) * 100)
    },
  },
  methods: {
    completedCount(items: ChecklistItem[]) {
      return items.filter((item) => item.checked).length
    },
    openCreate() {
      if (!this.canManage) return
      this.title = ''
      this.linkedTrip = this.tripId
      this.creating = true
    },
    saveItem() {
      if (!this.canManage || !this.editTitle.trim()) return
      if (this.editingItem) this.editingItem.title = this.editTitle.trim()
      this.editingItem = undefined
    },
    removeItem(item: ChecklistItem) {
      if (!this.active || !this.canManage) return
      this.active.items = this.active.items.filter((current) => current.id !== item.id)
    },
    create() {
      if (!this.canManage || !this.title.trim()) return
      const tripId = this.tripId || this.linkedTrip
      if (!this.tripId && tripId && !this.availableTrips.some((trip) => trip.value === tripId))
        return
      const id = crypto.randomUUID()
      this.store.checklists.push({
        id,
        title: this.title.trim(),
        tripId,
        items: [],
      })
      this.selected = id
      this.creating = false
      this.title = ''
      this.store.notify(tripId ? 'Чек-лист создан в поездке' : 'Чек-лист создан')
    },
    openAddToTrip() {
      this.targetTrip = this.availableTrips[0]?.value || ''
      this.addingToTrip = true
    },
    addToTrip() {
      if (
        !this.active ||
        this.active.tripId ||
        !this.availableTrips.some((trip) => trip.value === this.targetTrip)
      )
        return
      this.store.checklists.push({
        id: crypto.randomUUID(),
        tripId: this.targetTrip,
        title: this.active.title,
        items: this.active.items.map((item) => ({
          id: crypto.randomUUID(),
          title: item.title,
          checked: false,
        })),
      })
      this.addingToTrip = false
      this.store.notify('Чек-лист добавлен в поездку')
    },
    addItem() {
      if (!this.newItem.trim() || !this.active || !this.canManage) return
      this.active.items.push({
        id: crypto.randomUUID(),
        title: this.newItem.trim(),
        checked: false,
      })
      this.newItem = ''
    },
    startEdit(item: ChecklistItem) {
      if (!this.canManage) return
      this.editingItem = item
      this.editTitle = item.title
    },
    removeList() {
      if (!this.canManage) return
      this.store.checklists = this.store.checklists.filter((c) => c.id !== this.active?.id)
      this.deleting = false
      this.selected = ''
      this.store.notify('Чек-лист удалён')
    },
  },
})
</script>
<template>
  <div>
    <SectionHeader
      :header="tripId ? 'Чек-листы поездки' : 'Личные чек-листы'"
      :level="tripId ? 'h2' : 'h1'"
      :paragraph="
        attachedOnly
          ? 'Отмечайте готовые пункты прикреплённых списков.'
          : 'Всё необходимое для лёгкого путешествия.'
      ">
      <template #actions>
        <Button
          v-if="canManage"
          :size="tripId ? 'sm' : 'md'"
          @click="openCreate">
          <PhPlus :size="16" />
          Создать чек-лист
        </Button>
      </template>
    </SectionHeader>
    <div
      v-if="lists.length"
      :class="style.checklistLayout">
      <aside :class="style.checklistSidebar">
        <Tab
          v-for="list in lists"
          :key="list.id"
          variant="vertical"
          :active="active?.id === list.id"
          @click="selected = list.id">
          <span>{{ list.title }}</span>
          <small>{{ completedCount(list.items) }} / {{ list.items.length }}</small>
        </Tab>
        <Button
          v-if="!attachedOnly && canManage"
          variant="ghost"
          size="sm"
          :class="style.newList"
          @click="openCreate">
          <PhPlus :size="16" />
          Новый список
        </Button>
        <p>
          <PhLockKey :size="16" />
          Только для вас
        </p>
      </aside>
      <section
        v-if="active"
        :class="[sharedStyle.panel, style.checklistPanel]">
        <SectionHeader
          :header="active.title"
          level="h3"
          :paragraph="activeDescription">
          <template
            v-if="!attachedOnly && canManage"
            #actions>
            <Button
              v-if="!tripId"
              variant="secondary"
              size="sm"
              :disabled="!availableTrips.length"
              @click="openAddToTrip">
              <PhPlus :size="16" />
              Добавить в поездку
            </Button>
            <Button
              variant="ghost"
              icon-only
              @click="deleting = true">
              <PhTrash :size="16" />
            </Button>
          </template>
        </SectionHeader>
        <div :class="style.checklistProgress"><span :style="{ width: percent + '%' }" /></div>
        <div
          v-for="item in active.items"
          :key="item.id"
          :class="style.checklistItem">
          <Checkbox
            v-model="item.checked"
            :disabled="!canManage"
            :label="item.title" />
          <Button
            v-if="!attachedOnly && canManage"
            variant="ghost"
            icon-only
            @click="startEdit(item)">
            <PhPencilSimple :size="16" />
          </Button>
          <Button
            v-if="!attachedOnly && canManage"
            variant="ghost"
            icon-only
            @click="removeItem(item)">
            <PhX :size="16" />
          </Button>
        </div>
        <p
          v-if="!active.items.length"
          :class="[style.checklistsDetail1, sharedStyle.subtle]">
          {{
            attachedOnly
              ? 'В списке пока нет пунктов. Добавьте их в чек-листах поездки.'
              : 'Добавьте первый пункт — и ничего не забудется.'
          }}
        </p>
        <form
          v-if="!attachedOnly && canManage"
          @submit.prevent="addItem"
          :class="style.addItemForm">
          <Input
            :class="style.input"
            v-model="newItem"
            placeholder="Введите название пункта"
            size="sm"
            required />
          <Button
            type="submit"
            variant="ghost"
            icon-only>
            <PhPlus :size="18" />
          </Button>
        </form>
        <div :class="style.checklistBottom">
          <PhChecks :size="16" />
          <span>
            {{
              percent === 100 && active.items.length
                ? 'Всё готово. Можно отправляться!'
                : 'Отмечайте готовое — и собирайтесь без суеты.'
            }}
          </span>
          <strong>{{ percent }}%</strong>
        </div>
      </section>
    </div>
    <EmptyState
      v-else
      :icon="PhListChecks"
      :title="attachedOnly ? 'Нет прикреплённых чек-листов' : 'Ничего не забыть'"
      :description="
        attachedOnly
          ? 'Создайте список в чек-листах поездки или добавьте его из общих чек-листов.'
          : 'Создайте свой первый чек-лист: вещи, документы или дела перед поездкой.'
      ">
      <AppLink
        v-if="attachedOnly"
        :to="`/trips/${tripId}/checklists`">
        Перейти к чек-листам поездки
      </AppLink>
    </EmptyState>
    <Modal
      :open="creating"
      title="Новый чек-лист"
      @close="creating = false">
      <form
        @submit.prevent="create"
        :class="sharedStyle.formStack">
        <Input
          v-model="title"
          label="Название"
          placeholder="Например, вещи в дорогу"
          required />
        <Select
          v-if="!tripId"
          v-model="linkedTrip"
          label="Добавить в поездку"
          :options="tripOptions" />
        <p :class="sharedStyle.formHelp">
          {{
            tripId || linkedTrip
              ? 'Чек-лист будет доступен только в выбранной поездке.'
              : 'Чек-лист сохранится в общем списке.'
          }}
        </p>
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="creating = false">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="!title.trim()">
            Создать
          </Button>
        </div>
      </form>
    </Modal>
    <Modal
      :open="addingToTrip"
      title="Добавить чек-лист в поездку"
      @close="addingToTrip = false">
      <form
        @submit.prevent="addToTrip"
        :class="sharedStyle.formStack">
        <p :class="sharedStyle.subtle">
          «{{ active?.title }}» будет скопирован в выбранную поездку с неотмеченными пунктами.
          Исходный список останется в общих чек-листах.
        </p>
        <Select
          v-model="targetTrip"
          label="Поездка"
          :options="availableTrips"
          required />
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="addingToTrip = false">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="!targetTrip">
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
    <Modal
      :open="!!editingItem"
      title="Изменить пункт"
      @close="editingItem = undefined">
      <form
        @submit.prevent="saveItem"
        :class="sharedStyle.formStack">
        <Input
          v-model="editTitle"
          label="Название пункта"
          required />
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="editingItem = undefined">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="!editTitle.trim()">
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
    <Modal
      :open="deleting"
      title="Удалить чек-лист?"
      @close="deleting = false">
      <p :class="sharedStyle.subtle">
        Список «{{ active?.title }}» будет удалён вместе со всеми пунктами.
      </p>
      <div :class="sharedStyle.formActions">
        <Button
          variant="secondary"
          @click="deleting = false">
          Отмена
        </Button>
        <Button
          variant="danger"
          @click="removeList">
          Удалить
        </Button>
      </div>
    </Modal>
  </div>
</template>
