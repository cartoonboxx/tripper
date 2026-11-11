# Tripper conventions

- Write Vue components with `defineComponent` and Options API (`props`, `data`, `computed`, `methods`, `watch`, lifecycle hooks). Do not use `setup` or `<script setup>`.
- Order Vue single-file component blocks as `<template>`, then `<script>`, then `<style>` if present.
- Do not add marker attributes such as `data-ui`, `data-current`, or `tabindex`. Prefer CSS module classes and native elements (including `dialog`).
- Do not add aria attributes in templates, render functions, or attribute bindings. Use native HTML controls and visible labels. Do not add HTML `title` attributes; `title` props used for visible component headings are allowed. Internal navigation uses `AppLink`, which renders the custom slot of Vue Router's link component.
- Import component styles from `*.module.scss` as `style` and use camelCase module keys in templates: `:class="style.className"`. Keep only tokens, resets and base typography global. Keep shared and local module classes separate and apply them explicitly; do not merge CSS module exports. Use `SectionHeader` with `header` and `paragraph` props and an `actions` slot for page and section headings.
- Group related and nested pages under `src/pages/<Section>/<Name>/` (for example, `src/pages/Trips/Plan/`). Standalone sections may use `src/pages/<Name>/`. Name each page after its route or purpose with a `Page` suffix (for example, `PlanPage.vue`, `TodayPage.vue`, `PlacesPage.vue`) and keep its local SCSS module, types and data alongside it. Put shared domain types in `src/types`.
- Public UI names are Button, Input, Select, Tab, Badge, Card, Checkbox, Switch, Avatar, EmptyState, Modal and Drawer. Preserve their Base (geometry and behavior) / Style (appearance) layers.
- Use direct imports from `@phosphor-icons/vue`. Do not introduce a generic Icon wrapper.
- Use SCSS nesting for descendants, states, modifiers (`&`) and component media queries. Keep independent selectors separate and avoid unnecessary selector depth.
- Use the root spacing, radius and typography tokens. Keep the mobile bottom navigation and safe-area spacing.
- Run Prettier. Opening and closing tag brackets must not be left alone on a line; preserve the project formatting settings.
- Verify changes with the build, lint, relevant unit tests and browser tests.
