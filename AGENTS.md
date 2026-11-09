# Tripper conventions

- Write Vue components with `defineComponent` and Options API (`props`, `data`, `computed`, `methods`, `watch`, lifecycle hooks). Do not use `setup` or `<script setup>`.
- Do not add marker attributes such as `data-ui`, `data-current`, or `tabindex`. Prefer CSS module classes and native elements (including `dialog`).
- Do not add aria attributes in templates, render functions, or attribute bindings. Use native HTML controls, visible labels and titles. Internal navigation uses `AppLink`, which renders the custom slot of Vue Router's link component.
- Import component styles from `*.module.scss` as `style` and use camelCase module keys in templates: `:class="style.className"`. Keep only tokens, resets and base typography global. Combine shared and local module exports with `mergeStyles` so local overrides retain shared layout classes.
- Keep every page under `src/pages/<Name>/`, named `<Name>Component.vue`, with its local SCSS module, types and data alongside it. Put shared domain types in `src/types`.
- Public UI names are Button, Input, Select, Tab, Badge, Card, Checkbox, Switch, Avatar, EmptyState, Modal and Drawer. Preserve their Base (geometry and behavior) / Style (appearance) layers.
- Use direct imports from `@phosphor-icons/vue`. Do not introduce a generic Icon wrapper.
- Use the root spacing, radius and typography tokens. Keep the mobile bottom navigation and safe-area spacing.
- Run Prettier. Opening and closing tag brackets must not be left alone on a line; preserve the project formatting settings.
- Verify changes with the build, lint, relevant unit tests and browser tests.
