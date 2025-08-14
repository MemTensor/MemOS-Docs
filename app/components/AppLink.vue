<template>
  <NuxtLinkOriginal :to="smartTo" v-bind="$attrs">
    <slot />
  </NuxtLinkOriginal>
</template>

<script setup>
// 测试日志
console.log('🔗 自定义 NuxtLink 组件已加载')

// 直接导入 Nuxt 的 NuxtLink
import { NuxtLink as NuxtLinkOriginal } from '#components'

const props = defineProps(['to'])

// 智能处理链接路径
const smartTo = computed(() => {
  console.log('🔗 处理链接:', props.to)
  
  // 如果 to 不是字符串或者不是内部链接，直接返回
  if (typeof props.to !== 'string' || !props.to.startsWith('/')) {
    console.log('⏭️ 外部链接或非字符串，跳过处理')
    return props.to
  }
  
  // 如果已经有 /cn 前缀，直接返回
  if (props.to.startsWith('/cn')) {
    console.log('⏭️ 已有 /cn 前缀，跳过处理')
    return props.to
  }
  
  // 获取当前语言设置
  try {
    const { locale } = useNuxtApp().$i18n
    
    // 如果是中文模式，添加 /cn 前缀
    if (locale.value === 'cn') {
      const newPath = '/cn' + props.to
      console.log('🇨🇳 中文模式，添加前缀:', props.to, '->', newPath)
      return newPath
    } else {
      console.log('🇺🇸 英文模式，保持原路径:', props.to)
    }
  } catch (error) {
    // 如果 i18n 不可用，直接返回原路径
    console.warn('⚠️ i18n not available, using original path:', props.to)
  }
  
  // 默认返回原路径
  return props.to
})
</script>
