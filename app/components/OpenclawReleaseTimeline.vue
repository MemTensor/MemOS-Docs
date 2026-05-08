<script setup lang="ts">
interface ReleaseSection {
  title?: string
  items: string[]
}

interface ReleasePlugin {
  title: string
  version: string
  summary?: string
  sections?: ReleaseSection[]
}

interface ReleaseItem {
  date: string
  plugins?: ReleasePlugin[]
}

const props = withDefaults(defineProps<{
  releases?: ReleaseItem[]
}>(), {
  releases: () => []
})

function normalizeSections(sections?: ReleaseSection[]) {
  if (!sections || sections.length === 0) return []
  return sections.filter(section => section?.items?.length)
}

function normalizePlugins(plugins?: ReleasePlugin[]) {
  if (!plugins || plugins.length === 0) return []
  return plugins.filter((plugin) => {
    return !!plugin.summary || normalizeSections(plugin.sections).length > 0
  })
}
</script>

<template>
  <div class="relative pl-8">
    <div class="relative border-l border-[#5478dc59] pl-6">
      <div
        v-for="release in props.releases"
        :key="release.date"
        class="relative mb-8 before:absolute before:size-3 before:rounded-full before:bg-[#1d4ed8] before:content-[''] before:-left-7.75 before:top-1 before:shadow-[0_0_0_4px_rgba(29,78,216,0.2)]"
      >
        <div class="mb-3.25 text-lg font-medium tracking-[0.01em] text-slate-500 dark:text-[#94a3b8]">
          {{ release.date }}
        </div>
        <div class="rounded-[16px] border border-slate-200/80 bg-white px-5 pt-5 pb-4 shadow-sm dark:border-[#94a3b82e] dark:bg-[linear-gradient(160deg,rgba(8,13,25,0.96),rgba(5,8,18,0.96))] dark:shadow-none">
          <div
            v-for="(plugin, pluginIndex) in normalizePlugins(release.plugins)"
            :key="`${release.date}-${plugin.title}-${plugin.version}`"
            class="mt-4"
          >
            <div
              class="mb-1 text-[17px] font-bold text-[#60a5fa]"
              :class="pluginIndex % 2 === 1 ? 'text-[#10b981]' : ''"
            >
              {{ plugin.title }}
            </div>
            <div class="mb-2.25 text-[19px] font-bold text-slate-900 dark:text-white">
              {{ plugin.version }}
            </div>
            <div
              v-if="plugin.summary"
              class="-mt-0.75 mb-3 leading-[1.7] text-slate-500 dark:text-[#cbd5e1]"
            >
              <MDC
                tag="div"
                :value="plugin.summary"
              />
            </div>
            <template
              v-for="(section, index) in normalizeSections(plugin.sections)"
              :key="`${release.date}-${plugin.title}-${index}`"
            >
              <div
                v-if="section.title"
                class="mt-3.5 mb-1 font-semibold text-slate-900 dark:text-[#f8fafc]"
              >
                {{ section.title }}：
              </div>
              <ul class="mt-0.5 mb-2.5 list-disc pl-5">
                <li
                  v-for="(item, itemIndex) in section.items"
                  :key="`${release.date}-${plugin.title}-${index}-${itemIndex}`"
                  class="leading-[1.75] text-slate-600 dark:text-[#cbd5e1]"
                >
                  <MDC
                    tag="span"
                    unwrap="p"
                    :value="item"
                  />
                </li>
              </ul>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
