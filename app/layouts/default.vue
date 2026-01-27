<template>
  <UDashboardGroup
    :persistent="false"
    unit="px"
  >
    <UDashboardPanel
      id="main"
      class="overflow-y-auto scrollbar-hide"
    >
      <slot />
    </UDashboardPanel>
    <Assistant />
  </UDashboardGroup>
</template>
