export const CHANGELOG_PRODUCT_LINES = [
  'cloud',
  'docs',
  'playground',
  'plugin',
  'mcp',
  'opensource'
] as const

export const CHANGELOG_CATEGORIES = [
  'New Features',
  'Improvements',
  'Bug Fixes'
] as const

export type ChangelogProductLine = (typeof CHANGELOG_PRODUCT_LINES)[number]
export type ChangelogCategory = (typeof CHANGELOG_CATEGORIES)[number]

export interface ChangelogItem {
  type: string
  changedInfo: string[]
}

export type ChangelogCategoryMap = Partial<Record<ChangelogCategory, ChangelogItem[]>>

export interface ChangelogVersion {
  name: string
  date: string
  description?: string
  products?: Partial<Record<ChangelogProductLine, ChangelogCategoryMap>>
  changedInfo?: ChangelogCategoryMap
  legacy?: boolean
}

interface RawChangelogData {
  versions?: ChangelogVersion[]
}

const V2_BASE_VERSION = 'v2.0.0'

function parseVersionNumber(name: string): number[] | null {
  const match = name.match(/^v(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function isPreV2ChangelogVersion(name: string): boolean {
  const parts = parseVersionNumber(name)
  const base = parseVersionNumber(V2_BASE_VERSION)
  if (!parts || !base) return false
  for (let i = 0; i < 3; i++) {
    if (parts[i]! < base[i]!) return true
    if (parts[i]! > base[i]!) return false
  }
  return false
}

function filterCategoryMap(categories: ChangelogCategoryMap | undefined): ChangelogCategoryMap {
  if (!categories) return {}

  return Object.fromEntries(
    CHANGELOG_CATEGORIES
      .filter(cat => (categories[cat]?.length ?? 0) > 0)
      .map(cat => [cat, categories[cat]!])
  ) as ChangelogCategoryMap
}

function filterProducts(
  products: Partial<Record<ChangelogProductLine, ChangelogCategoryMap>> | undefined
): Partial<Record<ChangelogProductLine, ChangelogCategoryMap>> {
  if (!products) return {}

  return Object.fromEntries(
    CHANGELOG_PRODUCT_LINES
      .map((line) => {
        const filtered = filterCategoryMap(products[line])
        return Object.keys(filtered).length > 0 ? [line, filtered] : null
      })
      .filter(Boolean) as [ChangelogProductLine, ChangelogCategoryMap][]
  )
}

function migrateLegacyVersion(version: ChangelogVersion): ChangelogVersion {
  if (isPreV2ChangelogVersion(version.name)) {
    const legacyCategories = filterCategoryMap(version.changedInfo)
    return {
      ...version,
      legacy: true,
      changedInfo: legacyCategories,
      products: undefined
    }
  }

  if (version.products && Object.keys(filterProducts(version.products)).length > 0) {
    return {
      ...version,
      legacy: false,
      products: filterProducts(version.products)
    }
  }

  const legacyCategories = filterCategoryMap(version.changedInfo)
  if (Object.keys(legacyCategories).length === 0) {
    return { ...version, legacy: false, products: {} }
  }

  return {
    ...version,
    legacy: false,
    products: {
      opensource: legacyCategories
    }
  }
}

export function normalizeChangelogVersions(data: RawChangelogData | null | undefined): ChangelogVersion[] {
  if (!data?.versions) return []

  return data.versions
    .map(migrateLegacyVersion)
    .filter((version) => {
      if (version.legacy) {
        return Object.keys(version.changedInfo ?? {}).length > 0
      }
      return Object.keys(version.products ?? {}).length > 0
    })
}

export function getOrderedProductLines(
  products: Partial<Record<ChangelogProductLine, ChangelogCategoryMap>>
): ChangelogProductLine[] {
  return CHANGELOG_PRODUCT_LINES.filter(line => products[line] && Object.keys(products[line]!).length > 0)
}

export function getOrderedCategories(categories: ChangelogCategoryMap): ChangelogCategory[] {
  return CHANGELOG_CATEGORIES.filter(cat => (categories[cat]?.length ?? 0) > 0)
}
