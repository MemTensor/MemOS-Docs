<script setup lang="ts">
import type { ApiKeyMasked } from '~/composables/useApiKeyResolver'

/**
 * API Key 选择器宿主（app.vue 全局挂载一次）。
 * 安全约束：仅展示 keyName 与掩码 key，明文永不进入本组件 / DOM。
 */

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const { isOpen, context, settle } = useApiKeyPicker()

const selectedProjectId = ref<string | null>(null)
const selectedKeyId = ref<number | null>(null)
const keys = ref<ApiKeyMasked[]>([])
const loadingKeys = ref(false)
const loadFailed = ref(false)

const hasProject = computed(() => Boolean(context.value?.projects.length))
const showProjectSelect = computed(() => (context.value?.projects.length || 0) > 1)
const noUsableKey = computed(() =>
  hasProject.value && !loadingKeys.value && !loadFailed.value && keys.value.length === 0
)

const projectItems = computed(() =>
  (context.value?.projects || []).map(p => ({ label: p.name, value: p.id }))
)
const keyItems = computed(() =>
  keys.value.map(k => ({ label: `${k.keyName} (${k.apiKey})`, value: k.id }))
)

const dashboardApiKeysUrl = computed(() => {
  const base = (config.public.dashboardUrl as string) || 'https://memos-dashboard.openmem.net'
  const prefix = locale.value === 'cn' ? '/cn' : ''
  return `${base}${prefix}/apikeys/`
})

async function switchProject(projectId: string | null) {
  selectedKeyId.value = null
  keys.value = []
  loadFailed.value = false
  if (!projectId || !context.value) return

  const cached = context.value.keysByProject[projectId]
  if (cached) {
    keys.value = cached
  } else if (context.value.loadKeys) {
    loadingKeys.value = true
    try {
      keys.value = await context.value.loadKeys(projectId)
    } catch {
      loadFailed.value = true
    } finally {
      loadingKeys.value = false
    }
  }
  if (keys.value.length) selectedKeyId.value = keys.value[0]!.id
}

watch(context, (ctx) => {
  if (!ctx) {
    selectedProjectId.value = null
    selectedKeyId.value = null
    keys.value = []
    loadFailed.value = false
    return
  }
  selectedProjectId.value = ctx.projects[0]?.id ?? null
}, { immediate: true })

watch(selectedProjectId, projectId => switchProject(projectId))

function onOpenChange(open: boolean) {
  if (!open) settle(null)
}
</script>

<template>
  <UModal
    :open="isOpen"
    :title="t('apiKeyPicker.title')"
    :description="t('apiKeyPicker.description')"
    @update:open="onOpenChange"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <template v-if="!hasProject">
          <p class="text-sm text-muted">
            {{ t('apiKeyPicker.emptyProject') }}
          </p>
        </template>

        <template v-else>
          <UFormField
            v-if="showProjectSelect"
            :label="t('apiKeyPicker.projectLabel')"
          >
            <USelect
              v-model="selectedProjectId"
              :items="projectItems"
              class="w-full"
            />
          </UFormField>

          <UFormField :label="t('apiKeyPicker.keyLabel')">
            <USelect
              v-model="selectedKeyId"
              :items="keyItems"
              :loading="loadingKeys"
              :disabled="loadingKeys || keys.length === 0"
              class="w-full"
            />
          </UFormField>

          <p
            v-if="loadFailed"
            class="text-sm text-error"
          >
            {{ t('apiKeyPicker.loadFailed') }}
          </p>
          <p
            v-else-if="noUsableKey"
            class="text-sm text-muted"
          >
            {{ t('apiKeyPicker.empty') }}
          </p>
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :label="t('apiKeyPicker.cancel')"
          @click="settle(null)"
        />
        <UButton
          v-if="!hasProject || noUsableKey || loadFailed"
          :to="dashboardApiKeysUrl"
          target="_blank"
          :label="t('apiKeyPicker.goDashboard')"
          trailing-icon="i-lucide-arrow-up-right"
        />
        <UButton
          v-else
          :disabled="selectedKeyId == null"
          :label="t('apiKeyPicker.confirm')"
          @click="settle(selectedKeyId)"
        />
      </div>
    </template>
  </UModal>
</template>
