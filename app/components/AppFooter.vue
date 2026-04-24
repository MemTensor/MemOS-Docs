<script setup lang="ts">
import { checkIsMobile } from '@/utils/index'

interface SocialLink {
  icon: string
  link: string
  iconClass?: string
  tooltip?: string
}

const socialData: SocialLink[] = [
  {
    icon: 'ri:mail-fill',
    link: 'mailto:memos@memtensor.cn',
    tooltip: 'memos@memtensor.cn'
  },
  {
    icon: 'ri:twitter-x-fill',
    link: 'https://x.com/MemOS_dev'
  },
  {
    icon: 'ri:discord-fill',
    link: 'https://discord.gg/WngwZYy2',
    iconClass: 'size-7'
  },
  {
    icon: 'ri:github-fill',
    link: 'https://github.com/MemTensor/MemOS',
    iconClass: 'size-7'
  },
  {
    icon: 'simple-icons:huggingface',
    link: 'https://huggingface.co/datasets/MemTensor/MemOS_eval_result'
  }
]

const { t, locale } = useI18n()
const localePath = useLocalePath()
const isMobile = ref(Boolean(checkIsMobile()))
const columns = computed(() => [
  {
    label: t('footer.product'),
    children: [
      {
        label: t('footer.memosCloud'),
        to: useDashboardUrl('/quickstart/', locale.value),
        target: '_blank'
      },
      {
        label: t('footer.memoryAssistant'),
        to: 'https://alidocs.dingtalk.com/i/p/e3ZxX84Z5KM6X7dRZxX8v66wA7xaBG7d?dontjump=true',
        target: '_blank'
      },
      {
        label: t('footer.mcpService'),
        to: localePath('/mcp_agent/mcp/guide'),
        target: '_blank'
      },
      {
        label: t('footer.playground'),
        to: usePlaygroundUrl('/main/service/', locale.value),
        target: '_blank'
      },
      {
        label: t('footer.githubProject'),
        to: useGithubUrl(),
        target: '_blank'
      }
    ]
  },
  {
    label: t('footer.apiDocs'),
    children: [
      {
        label: t('footer.apiDocs'),
        to: localePath('/'),
        target: '_blank'
      },
      // {
      //   label: t('footer.blog'),
      //   to: '',
      // },
      {
        label: t('footer.pricing'),
        to: useHomeUrl('/pricing', locale.value),
        target: '_blank'
      }
    ]
  },
  {
    label: t('footer.aboutUs'),
    children: [
      {
        label: t('footer.memtensor'),
        to: 'https://www.memtensor.com.cn/',
        target: '_blank'
      },
      ...(!isMobile.value
        ? [{
            label: t('footer.openmem'),
            to: useOpenMemUrl(),
            target: '_blank'
          }]
        : []),
      {
        label: t('footer.community'),
        key: 'footer.community'
      },
      {
        label: t('footer.joinUs'),
        to: 'https://www.memtensor.com.cn/h-col-250.html',
        target: '_blank',
        trailingIcon: false
      },
      {
        label: t('footer.contactUs'),
        to: 'mailto:memos@memtensor.cn',
        target: '_blank',
        trailingIcon: false,
        tooltip: 'memos@memtensor.cn'
      }
    ]
  }
])
const qrcodeData = computed(() => [
  {
    img: 'https://statics.memtensor.com.cn/landing-v2/qrcode-wechat-v2.webp',
    label: t('footer.wechatGroup')
  },
  {
    img: 'https://cdn.memtensor.com.cn/img/1768371361386_sjmr00_compressed.png',
    label: t('footer.officialAccount')
  }
])
</script>

<template>
  <div class="w-full max-w-(--ui-max-container) mx-auto px-4 sm:px-9 lg:px-0 py-10 lg:py-20">
    <UFooterColumns
      :columns="columns"
      :ui="{
        root: 'xl:flex xl:justify-between',
        center: 'sm:gap-8 gap-6 pt-5',
        label: 'text-base leading-5.5',
        item: 'mb-4',
        list: 'mt-4 xl:min-w-[190px]',
        linkLabelExternalIcon: 'hidden',
        left: 'sm:mb-10 mb-6',
        link: 'text-sm lg:text-base leading-5.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900! dark:hover:text-white/80! cursor-pointer'
      }"
    >
      <template #left>
        <div class="flex flex-col">
          <div class="flex flex-row items-center gap-3.5 w-fit ">
            <img
              src="https://statics.memtensor.com.cn/logo/memtensor-w.png"
              class="sm:w-20 w-15 dark:invert-0 invert"
            >
            <p class="sm:mt-1.5 text-[28px] leading-10 font-semibold bg-linear-180 from-8% from-slate-900 dark:from-white to-100% to-slate-900/60 dark:to-white/60 bg-clip-text text-transparent">
              {{ $t('footer.memtensor') }}
            </p>
          </div>
          <div class="flex gap-5 mt-4">
            <template
              v-for="(item, index) in socialData"
              :key="index"
            >
              <UPopover
                mode="hover"
                arrow
                :content="{
                  side: 'top'
                }"
                :ui="{
                  content: 'bg-[#080F21] px-4 py-3 '
                }"
              >
                <UButton
                  class="inline-flex items-center justify-center size-9 shrink-0 cursor-pointer"
                  :to="item.link"
                  target="_blank"
                  color="neutral"
                  variant="ghost"
                  :leading-icon="item.icon"
                  :ui="{
                    leadingIcon: `${item.iconClass ?? 'size-6'} bg-slate-600 dark:bg-slate-100`
                  }"
                />

                <template #content>
                  <div class="text-xs break-all max-w-[200px] sm:max-w-fit">
                    {{ item.tooltip || item.link }}
                  </div>
                </template>
              </UPopover>
            </template>
          </div>
          <div class="flex gap-5 mt-6">
            <div
              v-for="(item, index) in qrcodeData"
              :key="index"
              class="space-y-2 flex flex-col items-center"
            >
              <img
                :src="item.img"
                class="size-22.5"
              >
              <span class="text-sm leading-4.5 text-slate-500 dark:text-slate-300 max-w-30 text-center">
                {{ item.label }}
              </span>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 sm:mt-7.5 mt-5">
            <p class="text-copyright sm:text-base text-xs leading-5.5 whitespace-nowrap">
              {{ $t('footer.icpFilingNumber') }}
            </p>
            <span class="hidden sm:inline-block w-px h-3.5 bg-slate-300 dark:bg-slate-800" />
            <p class="text-copyright sm:text-base text-xs leading-5.5 whitespace-nowrap">
              {{ $t('footer.filingNumber') }}
            </p>
          </div>
        </div>
      </template>

      <template #link="{ link }">
        <template v-if="link.key === 'footer.community'">
          <UPopover
            :ui="{
              content: 'bg-[#080F21] w-72 max-w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-white/10 p-0 shadow-lg'
            }"
          >
            <div class="text-sm sm:text-base leading-5.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900! dark:hover:text-white/80! cursor-pointer">
              {{ t('header.community.button') }}
            </div>
            <template #content>
              <div class="p-4">
                <div class="mb-3 text-center text-sm font-medium leading-snug text-white">
                  {{ t('header.community.title') }}
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col items-center gap-2">
                    <img
                      src="https://statics.memtensor.com.cn/landing-v2/qrcode-wechat-v2.webp"
                      alt=""
                      class="h-28 w-28 shrink-0 rounded-md object-cover"
                    >
                    <div class="flex items-center justify-center gap-1.5 text-xs leading-5 text-slate-300">
                      <UIcon
                        name="i-ic:baseline-wechat"
                        class="size-4 shrink-0"
                      />
                      <span>{{ t('header.community.wechat') }}</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-center gap-2">
                    <img
                      src="https://statics.memtensor.com.cn/landing-v2/qrcode-discord-v2.webp"
                      alt=""
                      class="h-28 w-28 shrink-0 rounded-md object-cover"
                    >
                    <div class="flex items-center justify-center gap-1.5 text-xs leading-5 text-slate-300">
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
        <template v-else-if="link.tooltip">
          <UTooltip
            arrow
            :text="link.tooltip"
            :content="{ side: 'top' }"
            :ui="{
              content: 'bg-[#080F21] px-4 py-3 '
            }"
          >
            <span>{{ link.label }}</span>
          </UTooltip>
        </template>
        <template v-else>
          {{ link.label }}
        </template>
      </template>
    </UFooterColumns>
  </div>
</template>
