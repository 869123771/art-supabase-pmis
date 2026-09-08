<template>
  <div class="pmis-detail-drawer-sections">
    <slot />
  </div>
</template>

<style scoped lang="scss">
  .pmis-detail-drawer-sections {
    display: grid;
    gap: var(--art-space-4);
    align-content: start;
    min-width: 0;
  }
</style>
