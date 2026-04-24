import type { Collections } from '@nuxt/content'
import type { RouteLocation } from 'vue-router'
import SimpleOAS, { type HttpMethods } from '~/utils/oas'
import { flattenOasPaths } from '~/utils/openapi'

function prettifyGroupTitle(key: string) {
  const base = key.replace(/^\//, '')
  if (!base) return '/'
  return base
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const oasInstanceStore = new Map<string, SimpleOAS>()

const useOpenApi = (collectionName: keyof Collections = 'openapi', parentPath: string = 'api-reference') => {
  const { locale } = useI18n()
  const openapi = useState<OpenApiProps | null>(`${collectionName}-${locale.value}`, () => null)
  const schemas = useState<Record<string, SchemaProps>>(`${collectionName}Schemas-${locale.value}`, () => ({}))

  const server = useState<string>(`${collectionName}Server-${locale.value}`, () => '')
  const paths = useState<OasRoutePath[]>(`${collectionName}Paths-${locale.value}`, () => ([]))

  const oasInstanceLoaded = useState<boolean>(`${collectionName}Loaded-${locale.value}`, () => false)

  const apiNavData = computed<NavLink[]>(() => {
    const groupMap = new Map<string, OasRoutePath[]>()
    paths.value.forEach((item: OasRoutePath) => {
      const firstSegment = item.path.split('/').filter(Boolean)[0] ?? ''
      const groupKey = firstSegment ? `/${firstSegment}` : '/'

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(item)
    })

    const items: NavLink[] = []
    const singleItems: NavLink[] = []

    groupMap.forEach((groupItems, groupKey) => {
      if (groupItems.length === 1) {
        const item = groupItems[0]
        if (item) {
          singleItems.push({
            title: (item.summary as string) || '',
            path: item.routePath,
            method: item.method as 'get' | 'post' | 'put' | 'delete'
          })
        }
      } else {
        const groupTitle = prettifyGroupTitle(groupKey)
        items.push({
          title: groupTitle,
          children: groupItems
            .map(p => ({
              title: (p.summary as string) || '',
              path: p.routePath,
              method: p.method as 'get' | 'post' | 'put' | 'delete'
            }))
        })
      }
    })

    return singleItems.concat(items)
  })

  const route = useRoute()

  function _getOasInstance() {
    const storeKey = `${collectionName}-${locale.value}`
    if (oasInstanceStore.has(storeKey)) {
      return oasInstanceStore.get(storeKey)
    }
    return null
  }

  function _setOasInstance(oasInstance: SimpleOAS) {
    const storeKey = `${collectionName}-${locale.value}`
    if (!oasInstanceStore.has(storeKey)) {
      oasInstanceStore.set(storeKey, oasInstance)
      oasInstanceLoaded.value = true
    }
  }

  // Fetch OpenAPI data
  async function getOpenApi() {
    const { data } = await useAsyncData(`openapi-data-${collectionName}-${parentPath}-${locale.value}`, async () => {
      return queryCollection(collectionName).all()
    })

    let doc

    if (collectionName === 'dashboardApi') {
      const targetPath = route.path.startsWith('/cn')
        ? 'cn/api_docs/api'
        : 'en/api_docs/api'

      doc = data.value?.find(item => item.stem === targetPath)
    } else {
      doc = data.value?.[0]
    }

    if (!doc) return

    doc = {
      ...doc,
      openapi: doc.meta.openapi,
      info: doc.meta.info,
      servers: doc.meta.servers,
      security: doc.meta.security,
      paths: doc.meta.paths,
      components: doc.meta.components
    }

    const oas = new SimpleOAS(doc)
    await oas.dereference()
    _setOasInstance(oas)

    openapi.value = (doc as unknown as OpenApiProps) ?? null
    schemas.value = openapi.value?.components?.schemas ?? {}

    server.value = oas.url()
    paths.value = flattenOasPaths(oas, parentPath, collectionName as unknown as CollectionName)
  }

  function getApiByRoute(route: RouteLocation): OasRoutePath | undefined {
    let normalizedPath = route.path.replace(/^\/cn/, '').replace(/\/$/, '') || '/'
    normalizedPath = normalizedPath.split('-').map(s => s.toLowerCase()).join('-')
    return paths.value.find(path => path.routePath === normalizedPath)
  }

  function getCurrentRouteIndex(route: RouteLocation): number {
    let normalizedPath = route.path.replace(/^\/cn/, '').replace(/\/$/, '') || '/'
    normalizedPath = normalizedPath.split('-').map(s => s.toLowerCase()).join('-')
    return paths.value.findIndex(path => path.routePath === normalizedPath)
  }

  function getSecurityWithTypes(path: string, method: HttpMethods): SecurityProps[] {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getSecurityWithTypes(path, method)
    }
    return []
  }

  function getParameters(path: string, method: HttpMethods): ParameterObject[] {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getParameters(path, method)
    }
    return []
  }

  function getRequestBody(path: string, method: HttpMethods): OasRequestBody | null {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas) {
        const body = oas.getRequestBody(path, method)
        const contentType = oas.getContentType(path, method)
        return { contentType, body }
      }
    }
    return null
  }

  function getResponseStatusCodes(path: string, method: HttpMethods): string[] {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getResponseStatusCodes(path, method)
    }
    return []
  }

  function getResponseByStatusCode(path: string, method: HttpMethods, statusCode: string | number): ResponseObject | null {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getResponseByStatusCode(path, method, statusCode)
    }
    return null
  }

  function getResponseContentTypes(path: string, method: HttpMethods, statusCode: string | number): string[] {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getResponseContentTypes(path, method, statusCode)
    }
    return []
  }

  function getResponseContentType(path: string, method: HttpMethods, statusCode: string | number): string {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getResponseContentType(path, method, statusCode)
    }
    return 'null'
  }

  function getResponseAsJSONSchema(path: string, method: HttpMethods, statusCode: string | number, contentType?: string): SchemaObject | null {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas)
        return oas.getResponseAsJSONSchema(path, method, statusCode, contentType)
    }
    return null
  }

  function generateResponseExample(path: string, method: HttpMethods, statusCode: string | number, contentType?: string): Record<string, unknown> {
    if (import.meta.server || oasInstanceLoaded.value) {
      const oas = _getOasInstance()
      if (oas) {
        const examples = oas.generateResponseExample(path, method, statusCode)
        if (contentType) {
          return (examples?.[contentType] as Record<string, unknown>) ?? {}
        }
        const preferredType = oas.getResponseContentType(path, method, statusCode)
        return (examples?.[preferredType] as Record<string, unknown>) ?? {}
      }
    }
    return {}
  }

  function getContentInfo(oas: SimpleOAS, path: string, method: HttpMethods) {
    const contentType = oas.getContentType(path, method)
    const requestBodySchema = oas.getRequestBodyAsJSONSchema(path, method)
    return { contentType, schema: requestBodySchema }
  }

  function getValue(prop: Record<string, unknown>): string | number | boolean {
    if (!prop) return 'null'
    if (prop.type === 'string') {
      if (prop.enum) return `"${(prop.enum as string[])[0]}"`
      if (prop.format === 'date') return '"2023-01-01"'
      if (prop.format === 'date-time') return '"2023-01-01T00:00:00Z"'
      if (prop.format === 'email') return '"example@example.com"'
      return '"<string>"'
    }
    if (prop.type === 'array') return '[]'
    if (prop.type === 'integer') return (prop.default as number) ?? 0
    if (prop.type === 'number') return (prop.default as number) ?? 0
    if (prop.type === 'boolean') return true
    if (prop.type === 'object') return '{}'
    return 'null'
  }

  function generateRequestBodyData(oas: SimpleOAS, path: string, method: HttpMethods, contentType: string): string {
    const example = oas.getRequestBodyExample(path, method, contentType)

    if (!example) {
      return '{}'
    }

    const jsonLines: string[] = []
    jsonLines.push('{')

    const entries = Object.entries(example as Record<string, unknown>)
    entries.forEach(([key, value], index) => {
      const isLast = index === entries.length - 1
      const comma = isLast ? '' : ','

      if (Array.isArray(value)) {
        jsonLines.push(`    "${key}": [`)
        value.forEach((item, itemIndex) => {
          const itemComma = itemIndex < value.length - 1 ? ',' : ''
          if (typeof item === 'object' && item !== null) {
            jsonLines.push(`     ${JSON.stringify(item)}${itemComma}`)
          } else if (typeof item === 'string') {
            jsonLines.push(`      "${item}"${itemComma}`)
          } else {
            jsonLines.push(`      ${JSON.stringify(item)}${itemComma}`)
          }
        })
        jsonLines.push(`    ]${comma}`)
      } else if (typeof value === 'object' && value !== null) {
        jsonLines.push(`    "${key}": ${JSON.stringify(value)}${comma}`)
      } else if (typeof value === 'string') {
        jsonLines.push(`    "${key}": "${value}"${comma}`)
      } else {
        jsonLines.push(`    "${key}": ${JSON.stringify(value)}${comma}`)
      }
    })

    jsonLines.push('  }')
    return jsonLines.join('\n')
  }

  function generateCurlSnippet(oas: SimpleOAS, path: string, method: HttpMethods) {
    const httpMethod = method.toUpperCase()
    const baseUrl = oas.url()
    const { contentType, schema } = getContentInfo(oas, path, method)
    const auth = oas.getSecurityWithTypes(path, method)

    const curlLines: string[] = []
    curlLines.push(`curl -request ${httpMethod}`)
    curlLines.push(`  --url ${baseUrl}${path}`)

    if (auth && auth.length > 0) {
      auth.forEach((s) => {
        if (s.scheme?.type === 'apiKey') {
          if (s.scheme.in === 'header') {
            curlLines.push(`  --header '${s.scheme.name}: Token YOUR_API_KEY'`)
          }
        } else if (s.scheme?.type === 'http' && s.scheme.scheme === 'bearer') {
          curlLines.push(`  --header 'Authorization: Bearer YOUR_TOKEN'`)
        }
      })
    }

    if (contentType && schema) {
      curlLines.push(`  --header 'Content-Type: ${contentType}'`)
      const dataStr = generateRequestBodyData(oas, path, method, contentType)
      curlLines.push(`  --data '${dataStr}'`)
    }

    return curlLines.join(' \\\n')
  }

  function generatePythonHttpSnippet(oas: SimpleOAS, path: string, method: HttpMethods) {
    const baseUrl = oas.url()
    const auth = oas.getSecurityWithTypes(path, method)
    const { contentType, schema } = getContentInfo(oas, path, method)

    const pyLines: string[] = []
    pyLines.push('import os')
    pyLines.push('import requests')
    pyLines.push('import json')
    pyLines.push('')

    if (auth && auth.length > 0) {
      pyLines.push('os.environ["API_KEY"] = "YOUR_API_KEY"')
    }
    pyLines.push(`os.environ["BASE_URL"] = "${baseUrl}"`)
    pyLines.push('')

    const example = oas.getRequestBodyExample(path, method, contentType)
    if (example) {
      pyLines.push('data = {')
      Object.entries(example as Record<string, unknown>).forEach(([key, value], index, entries) => {
        const isLast = index === entries.length - 1
        const comma = isLast ? '' : ','

        if (Array.isArray(value)) {
          pyLines.push(`  "${key}": [`)
          value.forEach((item, itemIndex) => {
            const itemComma = itemIndex < value.length - 1 ? ',' : ''
            if (typeof item === 'object' && item !== null) {
              pyLines.push(`    ${JSON.stringify(item)}${itemComma}`)
            } else if (typeof item === 'string') {
              pyLines.push(`    "${item}"${itemComma}`)
            } else {
              pyLines.push(`    ${JSON.stringify(item)}${itemComma}`)
            }
          })
          pyLines.push(`  ]${comma}`)
        } else if (typeof value === 'object' && value !== null) {
          pyLines.push(`  "${key}": ${JSON.stringify(value)}${comma}`)
        } else if (typeof value === 'string') {
          pyLines.push(`  "${key}": "${value}"${comma}`)
        } else {
          pyLines.push(`  "${key}": ${JSON.stringify(value)}${comma}`)
        }
      })
      pyLines.push('}')
    } else if (schema && (schema as Record<string, unknown>).properties) {
      pyLines.push('data = {')
      Object.entries((schema as Record<string, unknown>).properties as Record<string, unknown>).forEach(([key, prop]) => {
        pyLines.push(`    "${key}": ${getValue(prop as Record<string, unknown>)}`)
      })
      pyLines.push('}')
    }

    pyLines.push('headers = {')
    if (contentType) {
      pyLines.push(`  "Content-Type": "${contentType}",`)
    }
    if (auth && auth.length > 0) {
      auth.forEach((s) => {
        if (s.scheme?.type === 'apiKey' && s.scheme.in === 'header') {
          pyLines.push(`  "${s.scheme.name}": f"Token {os.environ['MEMOS_API_KEY']}"`)
        } else if (s.scheme?.type === 'http' && s.scheme.scheme === 'bearer') {
          pyLines.push(`  "Authorization": f"Bearer {os.environ['MEMOS_API_KEY']}"`)
        }
      })
    }
    pyLines.push('}')
    pyLines.push(`url = f"{os.environ['BASE_URL']}${path}"`)
    pyLines.push('')

    if (schema) {
      if (path === '/search/memory') {
        pyLines.push(`res = requests.${method.toLowerCase()}(url=url, headers=headers, data=json.dumps(data))`)
        pyLines.push('')
        pyLines.push('for memory in res.json()["data"]["memory_detail_list"]:')
        pyLines.push('  print(f"Related memory：{memory[\'memory_value\']}")')
      } else {
        pyLines.push(`requests.${method.toLowerCase()}(url=url, headers=headers, data=json.dumps(data))`)
      }
    } else {
      pyLines.push(`requests.${method.toLowerCase()}(url=url, headers=headers)`)
    }

    return pyLines.join('\n')
  }

  function generatePythonSdkSnippet(oas: SimpleOAS, path: string, method: HttpMethods) {
    const { schema, contentType } = getContentInfo(oas, path, method)

    const pyLines: string[] = []
    pyLines.push('from memos.api.client import MemOSClient')
    pyLines.push('')
    pyLines.push('client = MemOSClient(api_key="YOUR_API_KEY")')
    pyLines.push('')

    const example = oas.getRequestBodyExample(path, method, contentType)
    if (example) {
      Object.entries(example as Record<string, unknown>).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          pyLines.push(`${key} = [`)
          value.forEach((item, index) => {
            const comma = index < value.length - 1 ? ',' : ''
            if (typeof item === 'object' && item !== null) {
              pyLines.push(`  ${JSON.stringify(item)}${comma}`)
            } else if (typeof item === 'string') {
              pyLines.push(`  "${item}"${comma}`)
            } else {
              pyLines.push(`  ${JSON.stringify(item)}${comma}`)
            }
          })
          pyLines.push(']')
        } else if (typeof value === 'object' && value !== null) {
          pyLines.push(`${key} = ${JSON.stringify(value)}`)
        } else if (typeof value === 'string') {
          pyLines.push(`${key} = "${value}"`)
        } else {
          pyLines.push(`${key} = ${JSON.stringify(value)}`)
        }
      })
      pyLines.push('')
    } else if (schema && (schema as Record<string, unknown>).properties) {
      Object.entries((schema as Record<string, unknown>).properties as Record<string, unknown>).forEach(([key, prop]) => {
        pyLines.push(`${key} = ${getValue(prop as Record<string, unknown>)}`)
      })
      pyLines.push('')
    }

    const keys = Object.keys(example ?? schema?.properties ?? {})
    if (path === '/search/memory') {
      pyLines.push(`res = client.add_message(${keys.map(key => `${key}=${key}`).join(', ')})`)
      pyLines.push('')
      pyLines.push('for memory in res.data.memory_detail_list:')
      pyLines.push('  print(f"Related memory：{memory.memory_value}")')
    } else {
      pyLines.push(`client.add_message(${keys.map(key => `${key}=${key}`).join(', ')})`)
    }

    return pyLines.join('\n')
  }

  function generateSnippet(path: string, method: HttpMethods, lang: LangType): string {
    if (!oasInstanceLoaded.value) {
      return `# OAS instance not loaded yet`
    }

    const oas = _getOasInstance()
    if (!oas) {
      return `# OAS instance not available`
    }

    try {
      if (lang === 'curl') return generateCurlSnippet(oas, path, method)
      if (lang === 'python-http') return generatePythonHttpSnippet(oas, path, method)
      if (lang === 'python-sdk') return generatePythonSdkSnippet(oas, path, method)
      return `# Unsupported language: ${lang}`
    } catch (error) {
      console.error('Error generating snippet:', error)
      return `# Error generating snippet for ${lang}`
    }
  }

  return {
    openapi,
    schemas,
    server,
    paths,
    apiNavData,
    getOpenApi,
    getApiByRoute,
    getCurrentRouteIndex,
    getSecurityWithTypes,
    getParameters,
    getRequestBody,
    getResponseStatusCodes,
    getResponseByStatusCode,
    getResponseContentType,
    getResponseContentTypes,
    getResponseAsJSONSchema,
    generateResponseExample,
    generateSnippet
  }
}

export { useOpenApi }
