<template>
  <div :class="style.authPage">
    <section :class="style.authFormSide">
      <AppLink
        to="/"
        :class="style.authBrand">
        <PhMountains :size="30" />
        Tripper
        <span>.</span>
      </AppLink>
      <div :class="style.authForm">
        <span :class="[sharedStyle.eyebrow, style.eyebrow]">ПУТЕШЕСТВИЯ НАЧИНАЮТСЯ ЗДЕСЬ</span>
        <slot />
        <div :class="style.authDemo">
          <PhInfo :size="16" />
          <span>Данные аккаунта и пароль для входа действуют только на этом устройстве.</span>
        </div>
        <AppLink
          to="/"
          :class="style.authGuest">
          Посмотреть без входа
          <PhArrowUpRight :size="16" />
        </AppLink>
      </div>
      <footer>Меньше забот. Больше путешествий.</footer>
    </section>
    <section
      :style="{ backgroundImage: `url(${florence})` }"
      :class="style.authVisual">
      <div :class="style.authVisualTop">
        <PhCompass :size="24" />
        <span>ДЛЯ ТЕХ, КТО ЛЮБИТ ОТКРЫВАТЬ</span>
      </div>
      <div :class="style.authQuote">
        <span>43°46′ с. ш. 11°15′ в. д.</span>
        <h2>
          Большие впечатления.
          <br />
          Продуманные мелочи.
        </h2>
        <p>
          Планируйте вместе, исследуйте в своём ритме.
          <br />
          А всё важное мы поможем сохранить.
        </p>
        <div>
          <PhMapPin :size="16" />
          Флоренция, Италия
        </div>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { PhArrowUpRight, PhCompass, PhInfo, PhMapPin, PhMountains } from '@phosphor-icons/vue'
import sharedStyle from '@/styles/shared.module.scss'
import florence from '@/assets/images/florence.jpg'
import style from './AuthLayout.module.scss'

export default defineComponent({
  name: 'AuthLayout',
  components: { PhArrowUpRight, PhCompass, PhInfo, PhMapPin, PhMountains },
  data() {
    return { style, sharedStyle, florence }
  },
})
</script>
