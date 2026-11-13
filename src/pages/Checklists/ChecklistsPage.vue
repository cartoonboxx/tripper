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
          v-if="canAttach"
          variant="secondary"
          size="sm"
          @click="openAttach">
          <PhLink :size="16" />
          Прикрепить чек-лист
        </Button>
        <Button
          v-if="!attachedOnly && canManage"
          :size="tripId ? 'sm' : 'md'"
          @click="openCreate">
          <PhPlus :size="16" />
          Создать чек-лист
        </Button>
        <Button
          v-if="attachedOnly && tripId"
          :to="`/trips/${tripId}/checklists`"
          variant="secondary"
          size="sm">
          Управлять чек-листами
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
            <div :class="style.headerButtons">
              <Button
                variant="ghost"
                icon-only
                @click="startEditTitleChecklist">
                <PhPencilSimple size="16" />
              </Button>
              <Button
                variant="ghost"
                icon-only
                @click="deleting = true">
                <PhTrash :size="16" />
              </Button>
            </div>
          </template>
        </SectionHeader>
        <div :class="style.checklistProgress"><span :style="{ width: percent + '%' }" /></div>
        <p
          v-if="canReorder"
          :class="style.reorderHint">
          Зажмите пункт мышью или значок слева пальцем и перетащите на нужное место.
        </p>
        <TransitionGroup
          tag="div"
          :move-class="style.itemMove">
          <div
            v-for="item in displayedItems"
            :key="item.id"
            :ref="(element) => setItemCard(item.id, element)"
            :class="[style.itemSlot, draggedItemId === item.id && style.isPlaceholder]"
            :style="draggedItemId === item.id ? { height: `${dragHeight}px` } : undefined">
            <div
              :class="[
                style.checklistItem,
                canReorder && style.isMovable,
                draggedItemId === item.id && style.isDragging,
              ]"
              :style="draggedItemId === item.id ? draggedCardStyle : undefined"
              @pointerdown="startPointer($event, item)"
              @click.capture="suppressDragClick"
              @contextmenu="preventReorderMenu"
              @dragstart.prevent>
              <button
                v-if="canReorder"
                type="button"
                :class="style.dragHandle"
                @keydown="moveItemByKey($event, item)">
                <PhDotsSixVertical :size="18" />
                <span :class="style.handleLabel">Переместить {{ item.title }}</span>
              </button>
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
          </div>
        </TransitionGroup>
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
          : tripId
            ? 'Прикрепите существующий личный чек-лист или создайте новый список для поездки.'
            : 'Создайте свой первый чек-лист: вещи, документы или дела перед поездкой.'
      ">
      <AppLink
        v-if="attachedOnly"
        :to="`/trips/${tripId}/checklists`">
        Перейти к чек-листам поездки
      </AppLink>
    </EmptyState>
    <Modal
      :open="attaching"
      title="Прикрепить чек-лист"
      @close="attaching = false">
      <form
        v-if="checklistOptions.length"
        @submit.prevent="attach"
        :class="sharedStyle.formStack">
        <Select
          v-model="sourceChecklist"
          label="Личный чек-лист"
          :options="checklistOptions"
          required />
        <p :class="sharedStyle.subtle">
          Пунктов: {{ checklistSource?.items.length || 0 }}. В поездке появится независимая копия с
          неотмеченными пунктами. Исходный список останется в личных чек-листах.
        </p>
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="attaching = false">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="!checklistSource">
            Прикрепить
          </Button>
        </div>
      </form>
      <EmptyState
        v-else
        :icon="PhListChecks"
        title="Нет личных чек-листов"
        description="Создайте новый список для этой поездки.">
        <Button @click="openCreate">Создать чек-лист</Button>
      </EmptyState>
    </Modal>
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
        <p :class="sharedStyle.formHelp">
          {{
            tripId
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
      :open="!!editingChecklistId"
      title="Изменить название чек-листа"
      @close="editingChecklistId = ''">
      <form
        @submit.prevent="saveTitleChecklist"
        :class="sharedStyle.formStack">
        <Input
          v-model="editChecklistTitle"
          label="Название"
          required />
        <div :class="sharedStyle.formActions">
          <Button
            variant="secondary"
            @click="editingChecklistId = ''">
            Отмена
          </Button>
          <Button
            type="submit"
            :disabled="!editChecklistTitle.trim()">
            Сохранить
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
<script lang="ts">
import SectionHeader from '@/components/SectionHeader/SectionHeader.vue'
import sharedStyle from '@/styles/shared.module.scss'
import style from './ChecklistsPage.module.scss'
import { defineComponent, markRaw, type CSSProperties } from 'vue'
import {
  PhChecks,
  PhDotsSixVertical,
  PhListChecks,
  PhLink,
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
  name: 'ChecklistsPage',
  components: {
    SectionHeader,
    PhChecks,
    PhDotsSixVertical,
    PhLink,
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
      itemCards: markRaw(new Map<string, HTMLElement>()),
      heldItemId: '',
      draggedItemId: '',
      previewIds: [] as string[],
      dragWidth: 0,
      dragHeight: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      pointerId: null as number | null,
      suppressClickUntil: 0,
      dragX: 0,
      dragY: 0,
      pressX: 0,
      pressY: 0,
      pressTimer: null as ReturnType<typeof setTimeout> | null,
      scrollFrame: null as number | null,
      creating: false,
      attaching: false,
      sourceChecklist: '',
      title: '',
      addingToTrip: false,
      targetTrip: '',
      newItem: '',
      editingChecklistId: '',
      editChecklistTitle: '',
      editingItem: undefined as ChecklistItem | undefined,
      editTitle: '',
      deleting: false,
      PhListChecks: markRaw(PhListChecks),
    }
  },
  computed: {
    canReorder(): boolean {
      return this.canManage && !this.attachedOnly && (this.active?.items.length || 0) > 1
    },
    itemIds(): string[] {
      return this.active?.items.map((item) => item.id) || []
    },
    displayedItems(): ChecklistItem[] {
      const items = this.active?.items || []
      if (!this.draggedItemId) return items
      const byId = new Map(items.map((item) => [item.id, item]))
      return this.previewIds
        .map((id) => byId.get(id))
        .filter((item): item is ChecklistItem => !!item)
    },
    draggedCardStyle(): CSSProperties | undefined {
      if (!this.draggedItemId) return undefined
      return {
        width: `${this.dragWidth}px`,
        height: `${this.dragHeight}px`,
        left: `${this.dragX - this.dragOffsetX}px`,
        top: `${this.dragY - this.dragOffsetY}px`,
      }
    },
    canAttach() {
      return Boolean(this.tripId && this.canManage && !this.attachedOnly && !this.trip?.archived)
    },
    checklistOptions() {
      return this.store.checklists
        .filter((list) => !list.tripId)
        .map((list) => ({ label: list.title, value: list.id }))
    },
    checklistSource() {
      return this.store.checklists.find((list) => list.id === this.sourceChecklist && !list.tripId)
    },
    tripOptions() {
      const trips = this.store.sortedTrips
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
  mounted() {
    window.addEventListener('pointermove', this.movePointer)
    window.addEventListener('pointerup', this.finishPointer)
    window.addEventListener('pointercancel', this.cancelPointer)
    window.addEventListener('blur', this.cancelReorder)
    window.addEventListener('keydown', this.cancelByKey)
  },
  beforeUnmount() {
    this.cancelReorder()
    window.removeEventListener('pointermove', this.movePointer)
    window.removeEventListener('pointerup', this.finishPointer)
    window.removeEventListener('pointercancel', this.cancelPointer)
    window.removeEventListener('blur', this.cancelReorder)
    window.removeEventListener('keydown', this.cancelByKey)
  },
  watch: {
    active(current, previous) {
      if (current?.id !== previous?.id) this.cancelReorder()
    },
    itemIds() {
      this.cancelReorder()
    },
    canReorder(allowed: boolean) {
      if (!allowed) this.cancelReorder()
    },
  },
  methods: {
    setItemCard(id: string, element: unknown) {
      if (element instanceof HTMLElement) this.itemCards.set(id, element)
      else this.itemCards.delete(id)
    },
    startPointer(pointer: PointerEvent, item: ChecklistItem) {
      if (!this.canReorder || pointer.button !== 0 || !pointer.isPrimary || this.heldItemId) return
      const target = pointer.target
      if (!(target instanceof Element)) return
      const handle = target.closest(`.${style.dragHandle}`)
      if (!handle && (pointer.pointerType !== 'mouse' || target.closest('button, input, a'))) return
      this.startReorder(item, pointer.clientX, pointer.clientY)
      this.pointerId = pointer.pointerId
    },
    startReorder(item: ChecklistItem, x: number, y: number) {
      this.cancelReorder()
      this.heldItemId = item.id
      this.pressX = this.dragX = x
      this.pressY = this.dragY = y
      this.pressTimer = setTimeout(() => {
        const card = this.itemCards.get(item.id)
        if (!card) return this.cancelReorder()
        const bounds = card.getBoundingClientRect()
        this.dragWidth = bounds.width
        this.dragHeight = bounds.height
        this.dragOffsetX = this.dragX - bounds.left
        this.dragOffsetY = this.dragY - bounds.top
        this.previewIds = this.itemIds.slice()
        this.draggedItemId = item.id
        this.suppressClickUntil = Number.POSITIVE_INFINITY
        window.getSelection()?.removeAllRanges()
        this.animateReorder()
      }, 350)
    },
    movePointer(pointer: PointerEvent) {
      if (pointer.pointerId !== this.pointerId) return
      this.moveReorder(pointer.clientX, pointer.clientY)
    },
    moveReorder(x: number, y: number) {
      if (!this.heldItemId) return
      this.dragX = x
      this.dragY = y
      if (!this.draggedItemId) {
        if (Math.hypot(x - this.pressX, y - this.pressY) > 8) this.cancelReorder()
        return
      }
      this.updateDropTarget()
    },
    updateDropTarget() {
      const remaining = this.previewIds.filter((id) => id !== this.draggedItemId)
      let targetIndex = remaining.length
      for (let index = 0; index < remaining.length; index++) {
        const card = this.itemCards.get(remaining[index]!)
        if (!card) continue
        const bounds = card.getBoundingClientRect()
        if (this.dragY < bounds.top + bounds.height / 2) {
          targetIndex = index
          break
        }
      }
      const currentIndex = this.previewIds.indexOf(this.draggedItemId)
      if (currentIndex === targetIndex) return
      remaining.splice(targetIndex, 0, this.draggedItemId)
      this.previewIds = remaining
    },
    animateReorder() {
      if (!this.draggedItemId) return
      const edge = 80
      const bottom = window.innerHeight - (window.innerWidth <= 900 ? 96 : 0)
      if (this.dragY < edge) window.scrollBy(0, -12)
      else if (this.dragY > bottom - edge) window.scrollBy(0, 12)
      this.updateDropTarget()
      this.scrollFrame = requestAnimationFrame(this.animateReorder)
    },
    finishPointer(pointer: PointerEvent) {
      if (pointer.pointerId === this.pointerId) this.finishReorder()
    },
    cancelPointer(pointer: PointerEvent) {
      if (pointer.pointerId === this.pointerId) this.cancelReorder()
    },
    finishReorder() {
      if (this.draggedItemId && this.canReorder && this.active) {
        const byId = new Map(this.active.items.map((item) => [item.id, item]))
        const items = this.previewIds
          .map((id) => byId.get(id))
          .filter((item): item is ChecklistItem => !!item)
        if (items.length === this.active.items.length) this.active.items = items
      }
      this.cancelReorder()
    },
    moveItemByKey(key: KeyboardEvent, item: ChecklistItem) {
      if (!this.canReorder || !this.active || !['ArrowUp', 'ArrowDown'].includes(key.key)) return
      key.preventDefault()
      this.cancelReorder()
      const items = [...this.active.items]
      const index = items.findIndex((current) => current.id === item.id)
      const target = index + (key.key === 'ArrowUp' ? -1 : 1)
      if (index < 0 || target < 0 || target >= items.length) return
      items.splice(index, 1)
      items.splice(target, 0, item)
      this.active.items = items
    },
    cancelReorder() {
      if (this.pressTimer) clearTimeout(this.pressTimer)
      if (this.scrollFrame !== null) cancelAnimationFrame(this.scrollFrame)
      if (this.draggedItemId) this.suppressClickUntil = Date.now() + 400
      this.pressTimer = null
      this.scrollFrame = null
      this.heldItemId = this.draggedItemId = ''
      this.previewIds = []
      this.pointerId = null
    },
    cancelByKey(key: KeyboardEvent) {
      if (key.key === 'Escape') this.cancelReorder()
    },
    suppressDragClick(click: MouseEvent) {
      if (Date.now() < this.suppressClickUntil) {
        click.preventDefault()
        click.stopPropagation()
      }
    },
    preventReorderMenu(menu: MouseEvent) {
      if (this.heldItemId || this.draggedItemId) menu.preventDefault()
    },

    completedCount(items: ChecklistItem[]) {
      return items.filter((item) => item.checked).length
    },
    openCreate() {
      if (!this.canManage) return
      this.attaching = false
      this.title = ''
      this.creating = true
    },
    openAttach() {
      if (!this.canAttach) return
      this.sourceChecklist = this.checklistOptions[0]?.value || ''
      this.attaching = true
    },
    attach() {
      if (!this.canAttach || !this.attaching) return
      const id = this.store.copyChecklistToTrip(this.sourceChecklist, this.tripId)
      if (!id) return
      this.selected = id
      this.attaching = false
      this.store.notify('Чек-лист прикреплён к поездке')
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
      const tripId = this.tripId
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
    addToTrip() {
      if (
        !this.active ||
        this.active.tripId ||
        !this.availableTrips.some((trip) => trip.value === this.targetTrip)
      )
        return
      const id = this.store.copyChecklistToTrip(this.active.id, this.targetTrip)
      if (!id) return
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
    startEditTitleChecklist() {
      if (!this.canManage || this.attachedOnly || !this.active) return
      this.editingChecklistId = this.active.id
      this.editChecklistTitle = this.active.title
    },
    saveTitleChecklist() {
      if (!this.canManage || this.attachedOnly || !this.editChecklistTitle.trim()) return
      const checklist = this.lists.find((list) => list.id === this.editingChecklistId)
      if (!checklist) return
      checklist.title = this.editChecklistTitle.trim()
      this.editingChecklistId = ''
      this.store.notify('Название чек-листа сохранено')
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
