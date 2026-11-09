<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ChecklistsComponent.module.scss'
import { defineComponent } from 'vue'
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
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'ChecklistsComponent',
  components: {
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
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      selected: '',
      creating: false,
      title: '',
      linkedTrip: '',
      newItem: '',
      editingItem: undefined as ChecklistItem | undefined,
      editTitle: '',
      deleting: false,
      PhChecks: markRawValue(PhChecks),
      PhListChecks: markRawValue(PhListChecks),
      PhLockKey: markRawValue(PhLockKey),
      PhPencilSimple: markRawValue(PhPencilSimple),
      PhPlus: markRawValue(PhPlus),
      PhTrash: markRawValue(PhTrash),
      PhX: markRawValue(PhX),
    }
  },
  computed: {
    lists() {
      return this.store.checklists.filter((c) => !this.tripId || c.tripId === this.tripId)
    },
    active() {
      return this.lists.find((c) => c.id === this.selected) || this.lists[0]
    },
    done() {
      return this.active?.items.filter((i) => i.checked).length || 0
    },
    percent() {
      return Math.round((this.done / (this.active?.items.length || 1)) * 100)
    },
  },
  methods: {
    create() {
      const id = crypto.randomUUID()
      this.store.checklists.push({
        id,
        title: this.title.trim(),
        tripId: this.tripId || this.linkedTrip,
        items: [],
      })
      this.selected = id
      this.creating = false
      this.title = ''
      this.store.notify('Чек-лист создан')
    },
    addItem() {
      if (!this.newItem.trim() || !this.active) return
      this.active.items.push({
        id: crypto.randomUUID(),
        title: this.newItem.trim(),
        checked: false,
      })
      this.newItem = ''
    },
    startEdit(item: ChecklistItem) {
      this.editingItem = item
      this.editTitle = item.title
    },
    removeList() {
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
    <header :class="tripId ? [style.sectionHeading] : style.pageHeading">
      <div>
        <span :class="[style.eyebrow]">СПОКОЙСТВИЕ НАЧИНАЕТСЯ С МЕЛОЧЕЙ</span>
        <component :is="tripId ? 'h2' : 'h1'">Личные чек-листы</component>
        <p :class="[style.subtle]">Всё необходимое для лёгкого путешествия.</p>
      </div>
      <Button
        :size="tripId ? 'sm' : 'md'"
        @click="
          () => {
            creating = true
            linkedTrip = tripId
          }
        ">
        <PhPlus :size="16" />
        Создать чек-лист
      </Button>
    </header>
    <div
      v-if="lists.length"
      :class="[style.checklistLayout]">
      <aside :class="[style.checklistSidebar]">
        <Tab
          v-for="list in lists"
          :key="list.id"
          variant="vertical"
          :active="active?.id === list.id"
          @click="selected = list.id">
          <span>{{ list.title }}</span>
          <small>{{ list.items.filter((i) => i.checked).length }} / {{ list.items.length }}</small>
        </Tab>
        <Button
          variant="ghost"
          size="sm"
          @click="
            () => {
              creating = true
              linkedTrip = tripId
            }
          ">
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
        :class="[style.panel, style.checklistPanel]">
        <div :class="[style.sectionHeading]">
          <div>
            <h3>{{ active.title }}</h3>
            <p>
              {{ done }} из {{ active.items.length }} готово
              <span v-if="active.tripId">
                · {{ store.trips.find((t) => t.id === active?.tripId)?.name }}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            icon-only
            title="Удалить чек-лист"
            @click="deleting = true">
            <PhTrash :size="16" />
          </Button>
        </div>
        <div :class="[style.checklistProgress]"><span :style="{ width: percent + '%' }" /></div>
        <div
          v-for="item in active.items"
          :key="item.id"
          :class="[style.checklistItem]">
          <Checkbox
            v-model="item.checked"
            :label="item.title" />
          <Button
            variant="ghost"
            icon-only
            :title="`Изменить ${item.title}`"
            @click="startEdit(item)">
            <PhPencilSimple :size="16" />
          </Button>
          <Button
            variant="ghost"
            icon-only
            :title="`Удалить ${item.title}`"
            @click="active.items = active.items.filter((i) => i.id !== item.id)">
            <PhX :size="16" />
          </Button>
        </div>
        <p
          v-if="!active.items.length"
          :class="[style.checklistsDetail1, style.subtle]">
          Добавьте первый пункт — и ничего не забудется.
        </p>
        <form
          @submit.prevent="addItem"
          :class="[style.addItemForm]">
          <Input
            v-model="newItem"
            placeholder="Что ещё взять или сделать?"
            title="Новый пункт"
            required />
          <Button
            type="submit"
            variant="ghost"
            icon-only
            title="Добавить пункт">
            <PhPlus :size="18" />
          </Button>
        </form>
        <div :class="[style.checklistBottom]">
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
      title="Ничего не забыть"
      description="Создайте свой первый чек-лист: вещи, документы или дела перед поездкой.">
      <Button @click="creating = true">Создать чек-лист</Button>
    </EmptyState>
    <Modal
      :open="creating"
      title="Новый чек-лист"
      @close="creating = false">
      <form
        @submit.prevent="create"
        :class="[style.formStack]">
        <Input
          v-model="title"
          label="Название"
          placeholder="Например, вещи в дорогу"
          required />
        <Select
          v-if="!tripId"
          v-model="linkedTrip"
          label="Привязать к поездке"
          :options="[
            { label: 'Без привязки', value: '' },
            ...store.trips.filter((t) => !t.archived).map((t) => ({ label: t.name, value: t.id })),
          ]" />
        <p :class="[style.formHelp]">Чек-лист личный — его видите и редактируете только вы.</p>
        <div :class="[style.formActions]">
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
      :open="!!editingItem"
      title="Изменить пункт"
      @close="editingItem = undefined">
      <form
        @submit.prevent="
          () => {
            editingItem && (editingItem.title = editTitle.trim())
            editingItem = undefined
          }
        "
        :class="[style.formStack]">
        <Input
          v-model="editTitle"
          label="Название пункта"
          required />
        <div :class="[style.formActions]">
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
      <p :class="[style.subtle]">
        Список «{{ active?.title }}» будет удалён вместе со всеми пунктами.
      </p>
      <div :class="[style.formActions]">
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
