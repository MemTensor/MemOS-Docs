import type { ContentNavigationItem } from '@nuxt/content'
import enSettings from '../../content/en/settings.yml'
import cnSettings from '../../content/cn/settings.yml'

interface ParsedTitle {
  icon?: string
  title: string
}

// Extract icon info from the title and convert to i-ri- format
const parseIconAndTitle = (raw: string): ParsedTitle => {
  const [, iconName, title] = raw.match(/\(ri:([^)]+)\)\s*(.*)/) || []
  return {
    ...(iconName ? { icon: `i-ri-${iconName}` } : {}),
    title: title || raw
  } as ParsedTitle
}

// Convert yml nav structure into content navigation structure
interface RawNavGroup {
  path?: string
  children?: RawNav[]
}

type RawNav = string | Record<string, RawNav[] | string | RawNavGroup>

// Recursively convert yml nav structure to @nuxt/content navigation structure
const toContentNav = (node: RawNav, locale: string): ContentNavigationItem | null => {
  // String form: "(icon) title: path.md"
  if (typeof node === 'string') {
    const [rawTitle, mdPath] = node.split(': ')
    if (!mdPath) return null

    const { icon, title } = parseIconAndTitle(rawTitle as string)
    const stem = mdPath.replace(/\.md$/, '')

    return {
      title,
      path: locale === 'cn' ? `/cn/${stem}` : `/${stem}`,
      stem,
      ...(icon ? { icon } : {}),
      framework: null,
      module: null,
      class: []
    }
  }

  // Object form: "title": [...children] | "title": "path.md"
  const [rawTitle, childrenOrPath] = Object.entries(node)[0] as [
    string,
    RawNav[] | string | RawNavGroup
  ]

  const { icon, title } = parseIconAndTitle(rawTitle as string)

  if (Array.isArray(childrenOrPath)) {
    const stem = title.toLowerCase().replace(/\s+/g, '_')
    return {
      title,
      stem,
      ...(icon ? { icon } : {}),
      children: childrenOrPath.map((item) => { return toContentNav(item, locale) }).filter(Boolean) as ContentNavigationItem[],
      page: false,
      class: []
    } as ContentNavigationItem
  }

  if (typeof childrenOrPath === 'object' && childrenOrPath !== null) {
    const stem = childrenOrPath.path
      ? childrenOrPath.path.replace(/\.md$/, '')
      : title.toLowerCase().replace(/\s+/g, '_')

    return {
      title,
      stem,
      ...(childrenOrPath.path ? { path: locale === 'cn' ? `/cn/${stem}` : `/${stem}` } : {}),
      ...(icon ? { icon } : {}),
      children: (childrenOrPath.children || [])
        .map(item => toContentNav(item, locale))
        .filter(Boolean) as ContentNavigationItem[],
      page: childrenOrPath.path ? undefined : false,
      class: []
    } as ContentNavigationItem
  }

  const stem = (childrenOrPath as string).replace(/\.md$/, '')
  const isApiReference = stem.includes('api-reference') || stem.includes('dashboard/api')

  return {
    title,
    path: locale === 'cn' ? `/cn/${stem}` : `/${stem}`,
    stem,
    ...(icon ? { icon } : {}),
    framework: null,
    module: null,
    class: [],
    target: isApiReference ? '_blank' : undefined
  }
}

const parseNavigation = (navItems: RawNav[], locale: string): ContentNavigationItem[] => {
  if (!Array.isArray(navItems)) {
    console.warn('parseNavigation received non-array input:', navItems)
    return []
  }
  return navItems.map((item) => {
    return toContentNav(item, locale)
  }).filter(Boolean) as ContentNavigationItem[]
}

export const useContentNavigation = (locale: Ref<string>) => {
  const navigation = computed(() => {
    try {
      const settings = locale.value === 'cn' ? cnSettings : enSettings
      if (!settings || typeof settings !== 'object') {
        console.error('Invalid settings object:', settings)
        return []
      }

      const navItems = (settings as { nav?: RawNav[] }).nav
      if (!navItems) {
        console.error('No nav items found in settings:', settings)
        return []
      }

      return parseNavigation(navItems, locale.value)
    } catch (error) {
      console.error('Error in useContentNavigation:', error)
      return []
    }
  })
  return navigation
}

// Flatten navigation tree into a linear list (pages only)
export const flattenNavigation = (items: ContentNavigationItem[] = []): ContentNavigationItem[] => {
  if (!Array.isArray(items)) {
    console.warn('flattenNavigation received non-array input:', items)
    return []
  }
  return items.flatMap((item) => {
    if (!item) return []
    return [item, ...(item.children ? flattenNavigation(item.children) : [])]
  })
}

// Get previous and next items (surround) for a given path
export const getSurround = (
  path: string,
  navItems: ContentNavigationItem[] = []
): ContentNavigationItem[] => {
  const flat = flattenNavigation(navItems).filter(item => item.path && item.page !== false)
  const idx = flat.findIndex(i => i.path === path)
  if (idx === -1) return []

  const prev = idx > 0 ? flat[idx - 1]! : undefined
  const next = idx < flat.length - 1 ? flat[idx + 1]! : undefined

  if (!prev && !next) return []

  return [
    prev as ContentNavigationItem,
    next as ContentNavigationItem
  ]
}

export type SurroundItem = ContentNavigationItem & { description?: string }

// Enrich surround items with front-matter description field
export const useSurroundWithDesc = async (
  path: string,
  navItems: ContentNavigationItem[] = [],
  locale: string = 'en',
  _env: string = 'prod'
): Promise<SurroundItem[]> => {
  const base = getSurround(path, navItems)

  if (base.length === 0) return []

  const docs = await Promise.all(
    base.map((item) => {
      if (!item) return null

      const docsPath = locale === 'cn' ? item.path : `/en${item.path}`

      return queryCollection('docs').path(`${docsPath}`).first()
    })
  )

  return base.map((item, i) => {
    if (!item) return item

    return {
      ...item,
      description: docs[i]?.desc
        // Remove code blocks
        ?.replace(/(?:<code>|`)(.*?)(?:<\/code>|`)/g, '$1')
        // Remove bold text markers
        ?.replace(/(?:<strong>|\*\*)(.*?)(?:<\/strong>|\*\*)/g, '$1')
        // Remove link markers [text](url)
        ?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    }
  })
}
