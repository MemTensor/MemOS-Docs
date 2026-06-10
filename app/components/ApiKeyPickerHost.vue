<script setup lang="ts">
import type { ApiKeyMasked } from '~/composables/useApiKeyResolver'

/**
 * API Key 选择器宿主（app.vue 全局挂载一次）。
 * 安全约束：仅展示 keyName 与掩码 key，明文永不进入本组件 / DOM。
 */

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const { isOpen, context, settle, clearContext } = useApiKeyPicker()

const selectedProjectId = ref<string | undefined>()
// id 为不透明值（list 返回字符串），原样回传，绝不数值化
const selectedKeyId = ref<string | number | undefined>()
const keys = ref<ApiKeyMasked[]>([])
const loadingKeys = ref(false)
const loadFailed = ref(false)

const newKeyName = ref('')
const creating = ref(false)
const createFailed = ref(false)

const hasProject = computed(() => Boolean(context.value?.projects.length))
const noUsableKey = computed(() =>
  hasProject.value && !loadingKeys.value && !loadFailed.value && keys.value.length === 0
)
/** 无可用 Key 时的页内创建表单（仅在 resolver 提供 createKey 时启用） */
const showCreateForm = computed(() => noUsableKey.value && Boolean(context.value?.createKey))
const newKeyNameValid = computed(() => {
  const name = newKeyName.value.trim()
  return name.length >= 1 && name.length <= 100
})

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

async function switchProject(projectId: string | undefined) {
  selectedKeyId.value = undefined
  keys.value = []
  loadFailed.value = false
  createFailed.value = false
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
    selectedProjectId.value = undefined
    selectedKeyId.value = undefined
    keys.value = []
    loadFailed.value = false
    newKeyName.value = ''
    creating.value = false
    createFailed.value = false
    return
  }
  selectedProjectId.value = ctx.projects[0]?.id
}, { immediate: true })

watch(selectedProjectId, projectId => switchProject(projectId))

// 进入创建表单时预填默认名，用户可直接一键创建
watch(showCreateForm, (show) => {
  if (show && !newKeyName.value) newKeyName.value = t('apiKeyPicker.defaultKeyName')
})

async function onCreateAndUse() {
  const ctx = context.value
  const projectId = selectedProjectId.value
  if (!ctx?.createKey || !projectId || creating.value || !newKeyNameValid.value) return

  creating.value = true
  createFailed.value = false
  try {
    // 明文仅经局部变量直达 settle，即取即弃，不进响应式状态
    const plainKey = await ctx.createKey(projectId, newKeyName.value.trim())
    settle({ plainKey })
  } catch {
    createFailed.value = true
  } finally {
    creating.value = false
  }
}

function onConfirm() {
  settle(selectedKeyId.value == null ? null : { apiKeyId: selectedKeyId.value })
}

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
    @after:leave="clearContext"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <template v-if="!hasProject">
          <p class="text-sm text-muted">
            {{ t('apiKeyPicker.emptyProject') }}
          </p>
        </template>

        <template v-else>
          <!-- 项目下拉始终展示（含单项目），让用户明确 Key 的归属项目 -->
          <UFormField :label="t('apiKeyPicker.projectLabel')">
            <USelect
              v-model="selectedProjectId"
              :items="projectItems"
              :disabled="creating"
              class="w-full"
            />
          </UFormField>

          <template v-if="showCreateForm">
            <p class="text-sm text-muted">
              {{ t('apiKeyPicker.empty') }}
            </p>
            <UFormField :label="t('apiKeyPicker.keyNameLabel')">
              <UInput
                v-model="newKeyName"
                :placeholder="t('apiKeyPicker.keyNamePlaceholder')"
                maxlength="100"
                :disabled="creating"
                class="w-full"
              />
            </UFormField>
            <p
              v-if="createFailed"
              class="text-sm text-error"
            >
              {{ t('apiKeyPicker.createFailed') }}
            </p>
          </template>

          <template v-else>
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

          <i18n-t
            keypath="apiKeyPicker.manageInDashboard"
            scope="global"
            tag="p"
            class="text-sm text-muted"
          >
            <template #dashboard>
              <a
                :href="dashboardApiKeysUrl"
                target="_blank"
                class="text-primary hover:underline"
              >Dashboard</a>
            </template>
          </i18n-t>
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
          v-if="showCreateForm"
          :loading="creating"
          :disabled="!newKeyNameValid"
          :label="t('apiKeyPicker.create')"
          @click="onCreateAndUse"
        />
        <UButton
          v-else-if="!hasProject || noUsableKey || loadFailed"
          :to="dashboardApiKeysUrl"
          target="_blank"
          :label="t('apiKeyPicker.goDashboard')"
          trailing-icon="i-lucide-arrow-up-right"
        />
        <UButton
          v-else
          :disabled="selectedKeyId == null"
          :label="t('apiKeyPicker.confirm')"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
