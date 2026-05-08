export type JSONPrimitive = string | number | boolean | null
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue }

export function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function renderHighlightedJson(value: JSONValue, indent = 0): string {
  const pad = '  '.repeat(indent)
  const nextPad = '  '.repeat(indent + 1)
  const punctuationClass = 'text-slate-600 dark:text-slate-300'
  const keyClass = 'text-[#023d7a] dark:text-[#9CDCFE]'
  const valueClass = 'text-[#0d5c1f] dark:text-[#B5CEA8]'
  const stringClass = 'text-[#052045] dark:text-[#CE9178]'

  if (value === null) return `<span class="${valueClass}">null</span>`
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value
      .map((v, i) => `${nextPad}${renderHighlightedJson(v as JSONValue, indent + 1)}${i < value.length - 1 ? `<span class="${punctuationClass}">,</span>` : ''}`)
      .join('\n')
    return `[
${items}
${pad}]`
  }
  const type = typeof value
  if (type === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) return '{}'
    const inner = entries
      .map(([k, v], i) => `${nextPad}<span class="${keyClass}">"${escapeHtml(k)}"</span><span class="${punctuationClass}">: </span>${renderHighlightedJson(v as JSONValue, indent + 1)}${i < entries.length - 1 ? `<span class="${punctuationClass}">,</span>` : ''}`)
      .join('\n')
    return `{
${inner}
${pad}}`
  }
  if (type === 'number') return `<span class="${valueClass}">${value}</span>`
  if (type === 'boolean') return `<span class="${valueClass}">${value}</span>`
  return `<span class="${stringClass}">"${escapeHtml(String(value))}"</span>`
}
