<script lang="ts">
import { mergeStyles } from '@/utils/mergeStyles'
import { defineComponent, markRaw } from 'vue'
import {
  PhArrowRight,
  PhCalendarDots,
  PhCompass,
  PhMagnifyingGlass,
  PhPlus,
} from '@phosphor-icons/vue'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Drawer,
  EmptyState,
  Input,
  Modal,
  Select,
  Switch,
  Tab,
} from '@/components/ui'
import TripCard from '@/components/trip/TripCard.vue'
import TripForm from '@/components/trip/TripForm.vue'
import EventForm from '@/components/trip/EventForm.vue'
import InviteForm from '@/components/trip/InviteForm.vue'
import { useTravelStore } from '@/stores/travel'
import {
  catalog,
  destinations,
  tabLabels,
  lineLabels,
  colors,
  spaces,
  radii,
  iconSamples,
} from './UiKitComponent.data'
import style from './UiKitComponent.module.scss'
import sharedStyle from '@/styles/shared.module.scss'

export default defineComponent({
  name: 'UiKitComponent',
  components: {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    Drawer,
    EmptyState,
    Input,
    Modal,
    Select,
    Switch,
    Tab,
    TripCard,
    TripForm,
    EventForm,
    InviteForm,
    PhArrowRight,
    PhCalendarDots,
    PhCompass,
    PhMagnifyingGlass,
    PhPlus,
  },
  data() {
    return {
      style: mergeStyles(sharedStyle, style),
      catalog,
      destinations,
      tabLabels,
      lineLabels,
      colors,
      spaces,
      radii,
      iconSamples: markRaw(iconSamples),
      PhCalendarDots: markRaw(PhCalendarDots),
      PhCompass: markRaw(PhCompass),
      text: '',
      search: '',
      date: '',
      destination: 'italy',
      pill: 0,
      line: 0,
      vertical: 0,
      checked: true,
      enabled: true,
      modal: false,
      wideModal: false,
      drawer: false,
      tripForm: false,
      eventForm: false,
      inviteForm: false,
    }
  },
  computed: {
    store(): ReturnType<typeof useTravelStore> {
      return useTravelStore()
    },
    demoTrip() {
      return this.store.trips.find((trip) => trip.role === 'organizer' && !trip.archived)
    },
  },
})
</script>
<template>
  <div :class="style.kitPage">
    <header :class="[style.pageHeading, style.kitHeader]">
      <div>
        <span :class="style.eyebrow">TRIPPER DESIGN SYSTEM</span>
        <h1>UI-kit</h1>
        <p>Все компоненты системы, варианты и интерактивные состояния.</p>
      </div>
      <Badge>12 компонентов UI</Badge>
    </header>
    <nav
      :class="style.catalogNav"
      title="Компоненты UI-kit">
      <a
        v-for="item in catalog"
        :key="item.id"
        :href="'#' + item.id">
        {{ item.name }}
      </a>
      <a href="#compositions">Готовые блоки</a>
    </nav>
    <section :class="style.kitSection">
      <div :class="style.sectionHeading">
        <div>
          <span :class="style.eyebrow">ОСНОВА ИНТЕРФЕЙСА</span>
          <h2>Цвет, типографика и геометрия</h2>
        </div>
      </div>
      <div :class="style.colorGrid">
        <div
          v-for="color in colors"
          :key="color.token"
          :class="style.colorCard">
          <span
            :class="style.colorSwatch"
            :style="{ background: 'var(' + color.token + ')' }" />
          <strong>{{ color.name }}</strong>
          <code>{{ color.token }}</code>
          <small>{{ color.value }}</small>
        </div>
      </div>
      <div :class="style.foundationGrid">
        <div>
          <h3>Отступы</h3>
          <div :class="style.spaceSamples">
            <div
              v-for="space in spaces"
              :key="space">
              <span :style="{ width: 'var(--space-' + space + ')' }" />
              <code>space-{{ space }}</code>
            </div>
          </div>
        </div>
        <div>
          <h3>Скругления</h3>
          <div :class="style.radiusSamples">
            <div
              v-for="radius in radii"
              :key="radius"
              :style="{ borderRadius: 'var(--radius-' + radius + ')' }">
              <code>{{ radius }}</code>
            </div>
          </div>
          <p :class="style.subtle">Основной текст — 16 px, вспомогательный — 12–14 px.</p>
        </div>
      </div>
      <div :class="style.iconSamples">
        <component
          v-for="(icon, i) in iconSamples"
          :is="icon"
          :key="i"
          :size="28"
          weight="regular" />
      </div>
    </section>
    <section
      id="buttons"
      :class="style.kitSection">
      <h2>Button</h2>
      <p :class="style.subtle">Варианты, размеры, кнопки с иконками и ссылка.</p>
      <div :class="style.kitRow">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div :class="style.kitRow">
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
        <Button>
          <PhPlus :size="20" />
          Добавить поездку
        </Button>
        <Button
          icon-only
          title="Добавить">
          <PhPlus :size="20" />
        </Button>
        <Button
          to="/trips"
          variant="secondary">
          К поездкам
          <PhArrowRight :size="20" />
        </Button>
      </div>
    </section>
    <section
      id="fields"
      :class="style.kitSection">
      <h2>Input</h2>
      <div :class="style.demoGrid">
        <Input
          v-model="text"
          label="Название поездки"
          placeholder="Например, неделя в Италии" />
        <Input
          v-model="search"
          label="Поиск"
          placeholder="Найти место…">
          <template #prefix><PhMagnifyingGlass :size="20" /></template>
        </Input>
        <Input
          v-model="date"
          label="Дата поездки"
          type="date" />
        <Input placeholder="Поле без подписи" />
        <Input
          label="Обязательное поле"
          required
          placeholder="Введите значение" />
        <Input
          label="Поле с ошибкой"
          model-value=""
          error="Укажите название поездки" />
        <Input
          label="Только чтение"
          model-value="Флоренция"
          readonly />
        <Input
          label="Недоступное поле"
          model-value="Данные недоступны"
          disabled />
        <Input
          label="Число участников"
          type="number"
          model-value="3"
          min="1" />
      </div>
      <p :class="style.modelValue">Текущее значение: {{ text || '—' }}</p>
    </section>
    <section
      id="selects"
      :class="style.kitSection">
      <h2>Select</h2>
      <div :class="style.demoGrid">
        <Select
          v-model="destination"
          label="Направление"
          :options="destinations" />
        <Select :options="destinations" />
        <Select
          model-value="russia"
          label="Недоступный список"
          :options="destinations"
          disabled />
      </div>
    </section>
    <section
      id="tabs"
      :class="style.kitSection">
      <h2>Tab</h2>
      <h3>Pill</h3>
      <div :class="style.kitRow">
        <Tab
          v-for="(label, i) in tabLabels"
          :key="label"
          :active="pill === i"
          @click="pill = i">
          {{ label }}
        </Tab>
        <Tab disabled>Недоступна</Tab>
      </div>
      <h3>Line</h3>
      <div :class="style.kitRow">
        <Tab
          v-for="(label, i) in lineLabels"
          :key="label"
          variant="line"
          :active="line === i"
          @click="line = i">
          {{ label }}
        </Tab>
      </div>
      <h3>Vertical</h3>
      <div :class="style.verticalTabs">
        <Tab
          v-for="(label, i) in ['День 1', 'День 2', 'День 3']"
          :key="label"
          variant="vertical"
          :active="vertical === i"
          @click="vertical = i">
          {{ label }}
          <small>10–12 ноября</small>
        </Tab>
      </div>
    </section>
    <section
      id="badges"
      :class="style.kitSection">
      <h2>Badge</h2>
      <div :class="style.kitRow">
        <Badge>Предстоящая</Badge>
        <Badge variant="neutral">Завершена</Badge>
        <Badge variant="orange">Идея для поездки</Badge>
      </div>
    </section>
    <section
      id="avatars"
      :class="style.kitSection">
      <h2>Avatar</h2>
      <div :class="style.kitRow">
        <Avatar
          name="Александр"
          size="sm" />
        <Avatar
          name="Мария Петрова"
          color="#f6e8dd" />
        <Avatar
          name="Дмитрий Иванов"
          size="lg"
          color="#e2e9f1" />
      </div>
    </section>
    <section
      id="cards"
      :class="style.kitSection">
      <h2>Card</h2>
      <div :class="style.demoGrid">
        <Card :class="style.demoCard">
          <span :class="style.softIcon"><PhCompass :size="24" /></span>
          <h3>Обычная карточка</h3>
          <p>Планы, места и маленькие детали путешествия.</p>
        </Card>
        <Card
          interactive
          :class="style.demoCard">
          <span :class="style.softIcon"><PhCalendarDots :size="24" /></span>
          <h3>Интерактивная карточка</h3>
          <p>Наведите курсор, чтобы увидеть состояние hover.</p>
          <Button
            variant="ghost"
            size="sm"
            @click="modal = true">
            Посмотреть подробнее
          </Button>
        </Card>
      </div>
    </section>
    <section
      id="checkboxes"
      :class="style.kitSection">
      <h2>Checkbox</h2>
      <div :class="style.kitRow">
        <Checkbox
          v-model="checked"
          label="Паспорт в чемодане" />
        <Checkbox label="Не отмечено" />
        <Checkbox
          :model-value="true"
          disabled
          label="Отмечено, недоступно" />
        <Checkbox
          disabled
          label="Недоступно" />
      </div>
      <p :class="style.modelValue">{{ checked ? 'Пункт выполнен' : 'Пункт ещё не выполнен' }}</p>
    </section>
    <section
      id="switches"
      :class="style.kitSection">
      <h2>Switch</h2>
      <div :class="style.switchGrid">
        <div :class="style.switchDemo">
          <span>Уведомления</span>
          <Switch
            v-model="enabled"
            label="Уведомления" />
        </div>
        <div :class="style.switchDemo">
          <span>Выключен</span>
          <Switch label="Выключенный переключатель" />
        </div>
        <div :class="style.switchDemo">
          <span>Недоступен</span>
          <Switch
            :model-value="true"
            disabled
            label="Недоступный переключатель" />
        </div>
      </div>
      <p :class="style.modelValue">
        {{ enabled ? 'Уведомления включены' : 'Уведомления выключены' }}
      </p>
    </section>
    <section
      id="empty"
      :class="style.kitSection">
      <h2>EmptyState</h2>
      <Card>
        <EmptyState
          title="Здесь начнётся путешествие"
          description="Добавьте первую поездку, чтобы собрать планы, места и впечатления вместе."
          :icon="PhCompass">
          <Button @click="tripForm = true">
            <PhPlus :size="20" />
            Создать первую поездку
          </Button>
        </EmptyState>
      </Card>
    </section>
    <section
      id="modals"
      :class="style.kitSection">
      <h2>Modal</h2>
      <p :class="style.subtle">
        Закрытие по Escape, фону или кнопке. Фокус возвращается к вызвавшему элементу. На телефоне —
        панель снизу, которую можно закрыть свайпом за ручку.
      </p>
      <div :class="style.kitRow">
        <Button @click="modal = true">Открыть Modal</Button>
        <Button
          variant="secondary"
          @click="wideModal = true">
          Открыть широкий Modal
        </Button>
      </div>
    </section>
    <section
      id="drawers"
      :class="style.kitSection">
      <h2>Drawer</h2>
      <p :class="style.subtle">Подробности в боковой панели; на телефоне — во всю ширину.</p>
      <Button
        variant="secondary"
        @click="drawer = true">
        Открыть Drawer
      </Button>
    </section>
    <section
      id="compositions"
      :class="style.kitSection">
      <h2>Готовые блоки системы</h2>
      <p :class="style.subtle">
        TripCard, TripForm, EventForm, InviteForm и навигация используют те же компоненты и токены.
      </p>
      <div :class="style.compositionPreview">
        <TripCard
          v-if="demoTrip"
          :trip="demoTrip" />
      </div>
      <div :class="style.kitRow">
        <Button
          variant="secondary"
          @click="tripForm = true">
          TripForm — новая поездка
        </Button>
        <Button
          v-if="demoTrip"
          variant="secondary"
          @click="eventForm = true">
          EventForm — событие
        </Button>
        <Button
          v-if="demoTrip"
          variant="secondary"
          @click="inviteForm = true">
          InviteForm — приглашение
        </Button>
        <Button
          v-if="demoTrip"
          :to="'/trips/' + demoTrip.id + '/overview'"
          variant="ghost">
          TripLayout — обзор поездки
        </Button>
      </div>
      <p :class="style.subtle">
        AppLayout и MobileNavigation видны на этой странице. На мобильном экране разделы
        переключаются нижними вкладками.
      </p>
    </section>
    <Modal
      :open="modal"
      title="Планы на новый день"
      @close="modal = false">
      <div :class="style.formStack">
        <Input
          label="Название события"
          placeholder="Например, прогулка у реки" />
        <p :class="style.subtle">Плавное открытие и закрытие. На телефоне потяните ручку вниз.</p>
        <div :class="style.formActions">
          <Button
            variant="secondary"
            @click="modal = false">
            Отмена
          </Button>
          <Button @click="modal = false">Готово</Button>
        </div>
      </div>
    </Modal>
    <Modal
      :open="wideModal"
      title="Широкое модальное окно"
      wide
      @close="wideModal = false">
      <p>Больше места для сложных форм и подробной информации.</p>
      <div :class="style.demoGrid">
        <Input
          label="Название"
          placeholder="Новое путешествие" />
        <Select
          label="Направление"
          :options="destinations"
          model-value="italy" />
      </div>
      <div :class="style.formActions"><Button @click="wideModal = false">Закрыть</Button></div>
    </Modal>
    <Drawer
      :open="drawer"
      title="Детали путешествия"
      @close="drawer = false">
      <Badge>Предстоящая поездка</Badge>
      <h3 :class="style.drawerHeading">Флоренция ждёт</h3>
      <p :class="style.subtle">
        Боковая панель сохраняет контекст страницы. Здесь можно показывать сведения о месте или
        событии.
      </p>
      <Input
        label="Заметка"
        placeholder="Что важно не забыть?" />
      <div :class="style.formActions"><Button @click="drawer = false">Готово</Button></div>
    </Drawer>
    <TripForm
      :open="tripForm"
      @close="tripForm = false" />
    <EventForm
      v-if="demoTrip"
      :open="eventForm"
      :trip-id="demoTrip.id"
      :day="demoTrip.start"
      @close="eventForm = false" />
    <InviteForm
      v-if="demoTrip"
      :open="inviteForm"
      :trip-id="demoTrip.id"
      @close="inviteForm = false" />
  </div>
</template>
