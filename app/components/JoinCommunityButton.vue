<template>
  <UPopover
    :content="{ side: 'bottom', align: 'end', sideOffset: 12 }"
    :ui="{
      content: 'bg-default ring ring-default rounded-xl p-0'
    }"
  >
    <button
      type="button"
      class="group inline-flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-300 px-0 hover:border-slate-400 2xl:w-auto 2xl:min-w-0 2xl:justify-start 2xl:px-2.5 dark:border-slate-600 dark:hover:border-slate-100"
      :aria-label="$t('header.community.button')"
      :title="$t('header.community.tooltip')"
    >
      <UIcon
        name="i-lucide-qr-code"
        class="size-4 shrink-0 text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100"
      />
      <span class="hidden max-w-24 truncate text-left text-xs font-medium text-slate-700 2xl:inline dark:text-slate-200">
        {{ $t('header.community.shortLabel') }}
      </span>
    </button>
    <template #content>
      <div class="w-64 p-4">
        <p class="mb-3 text-center text-sm font-medium text-default">
          {{ $t('header.community.title') }}
        </p>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col items-center gap-2">
            <img
              src="https://cdn.memtensor.com.cn/img/qrcode-wechat_compressed.png"
              alt=""
              class="h-26 w-26 shrink-0 rounded object-cover"
            >
            <div class="flex items-center gap-1 text-xs leading-5 text-muted">
              <UIcon
                name="i-ic:baseline-wechat"
                class="size-4 shrink-0"
              />
              <span>{{ $t('header.community.wechat') }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center gap-2">
            <img
              src="https://statics.memtensor.com.cn/landing-v2/qrcode-discord-v2.webp"
              alt=""
              class="h-26 w-26 shrink-0 rounded object-cover"
            >
            <div class="flex items-center gap-1 text-xs leading-5 text-muted">
              <UIcon
                name="ic:baseline-discord"
                class="size-4 shrink-0"
              />
              <span>Discord</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>
