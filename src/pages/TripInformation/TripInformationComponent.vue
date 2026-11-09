<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import sharedStyle from '@/styles/shared.module.scss'
import style from './TripInformationComponent.module.scss'
import { defineComponent } from 'vue'
import { PhArchive, PhCalendarDots, PhPencilSimple, PhUsers } from '@phosphor-icons/vue'
import { dateRange } from '@/composables/format'
import { Button, Card, Badge, Modal } from '@/components/ui'
import TripForm from '@/components/trip/TripForm.vue'
import tripContext from '@/mixins/tripContext'
import { markRawValue } from '@/utils/markRawValue'

export default defineComponent({
  name: 'TripInformationComponent',
  components: {
    PhArchive,
    PhCalendarDots,
    PhPencilSimple,
    PhUsers,
    Button,
    Card,
    Badge,
    Modal,
    TripForm,
  },
  mixins: [tripContext],
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      editing: false,
      notesEditing: false,
      notes: '',
      archiving: false,
      PhArchive: markRawValue(PhArchive),
      PhCalendarDots: markRawValue(PhCalendarDots),
      PhPencilSimple: markRawValue(PhPencilSimple),
      PhUsers: markRawValue(PhUsers),
    }
  },
  methods: {
    dateRange,
    toggleArchive() {
      const current = this.trip
      if (!current || !this.canEdit) return
      current.archived = !current.archived
      this.archiving = false
      this.store.notify(current.archived ? 'Поездка в архиве' : 'Поездка восстановлена')
    },
    startNotes() {
      this.notes = this.trip?.notes || ''
      this.notesEditing = true
    },
    saveNotes() {
      if (this.trip && this.canEdit) this.trip.notes = this.notes
      this.notesEditing = false
      this.store.notify('Заметки сохранены')
    },
  },
})
</script>
<template>
  <div v-if="trip">
    <div :class="[style.sectionHeading]">
      <div>
        <span :class="[style.eyebrow]">ВСЁ О ВАШЕМ ПУТЕШЕСТВИИ</span>
        <h2>Информация о поездке</h2>
      </div>
      <Button
        v-if="canEdit"
        variant="secondary"
        size="sm"
        @click="editing = true">
        <PhPencilSimple :size="16" />
        Редактировать
      </Button>
    </div>
    <Card :class="[style.informationCard]">
      <img
        :src="trip.image"
        :alt="trip.name" />
      <div :class="[style.informationMain]">
        <Badge>{{ trip.country || 'Путешествие' }}</Badge>
        <h2>{{ trip.name }}</h2>
        <p>
          <PhCalendarDots :size="16" />
          {{ dateRange(trip.start, trip.end) }}
        </p>
        <p>
          <PhUsers :size="16" />
          {{ store.members(trip.id).length || 1 }} участника
        </p>
        <div :class="[style.divider]" />
        <div :class="[style.sectionHeading]">
          <h3>Заметки о поездке</h3>
          <Button
            v-if="canEdit"
            variant="ghost"
            icon-only
            title="Редактировать заметки"
            @click="startNotes">
            <PhPencilSimple :size="16" />
          </Button>
        </div>
        <p :class="[style.tripNotes]">
          {{
            trip.notes ||
            'Здесь можно сохранить всё важное: билеты, адреса и маленькие напоминания.'
          }}
        </p>
      </div>
    </Card>
    <section
      v-if="canEdit"
      :class="[style.archiveTripPanel]">
      <div>
        <h3>{{ trip.archived ? 'Поездка в архиве' : 'Сохранить воспоминания' }}</h3>
        <p>
          {{
            trip.archived
              ? 'Верните поездку в основной список.'
              : 'Уберите поездку в архив — все планы и заметки останутся с вами.'
          }}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        @click="archiving = true">
        <PhArchive :size="16" />
        {{ trip.archived ? 'Восстановить' : 'В архив' }}
      </Button>
    </section>
    <TripForm
      :open="editing"
      :trip="trip"
      @close="editing = false" />
    <Modal
      :open="notesEditing"
      title="Заметки о поездке"
      @close="notesEditing = false">
      <form
        @submit.prevent="saveNotes"
        :class="[style.formStack]">
        <label
          for="trip-notes"
          :class="[style.fieldLabel]">
          Всё, о чём стоит помнить
        </label>
        <textarea
          id="trip-notes"
          v-model="notes"
          rows="6"
          :class="[style.textarea]" />
        <div :class="[style.formActions]">
          <Button
            variant="secondary"
            @click="notesEditing = false">
            Отмена
          </Button>
          <Button type="submit">Сохранить</Button>
        </div>
      </form>
    </Modal>
    <Modal
      :open="archiving"
      :title="trip.archived ? 'Восстановить поездку?' : 'Переместить в архив?'"
      @close="archiving = false">
      <p :class="[style.subtle]">
        {{
          trip.archived
            ? 'Поездка снова появится в основном списке.'
            : 'Поездка останется доступна в разделе «Архив». Все данные сохранятся.'
        }}
      </p>
      <div :class="[style.formActions]">
        <Button
          variant="secondary"
          @click="archiving = false">
          Отмена
        </Button>
        <Button @click="toggleArchive">{{ trip.archived ? 'Восстановить' : 'В архив' }}</Button>
      </div>
    </Modal>
  </div>
</template>
