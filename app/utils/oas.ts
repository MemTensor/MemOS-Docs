import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'

// Basic type definitions
export type HttpMethods = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options' | 'trace'

export type OASDocument = OpenAPIV3_1.Document | OpenAPIV3.Document
export type OperationObject = OpenAPIV3_1.OperationObject | OpenAPIV3.OperationObject
export type ParameterObject = OpenAPIV3_1.ParameterObject | OpenAPIV3.ParameterObject
export type RequestBodyObject = OpenAPIV3_1.RequestBodyObject | OpenAPIV3.RequestBodyObject
export type ResponseObject = OpenAPIV3_1.ResponseObject | OpenAPIV3.ResponseObject
export type SchemaObject = OpenAPIV3_1.SchemaObject | OpenAPIV3.SchemaObject
export type ReferenceObject = OpenAPIV3_1.ReferenceObject | OpenAPIV3.ReferenceObject
export type SecurityRequirementObject = OpenAPIV3_1.SecurityRequirementObject | OpenAPIV3.SecurityRequirementObject
export type SecuritySchemeObject = OpenAPIV3_1.SecuritySchemeObject | OpenAPIV3.SecuritySchemeObject
export type MediaTypeObject = OpenAPIV3_1.MediaTypeObject | OpenAPIV3.MediaTypeObject

// Code snippet generation related types and functions
export type LangType = 'curl' | 'python-sdk' | 'python-http'

// Server related type definitions
export type ServerObject = OpenAPIV3_1.ServerObject | OpenAPIV3.ServerObject
export type ServerVariableObject = OpenAPIV3_1.ServerVariableObject | OpenAPIV3.ServerVariableObject
export type ServerVariable = Record<
  string,
  { default?: number | string }[] | Record<string, never> | number | string | { default?: number | string }
>

export interface SecurityProps {
  name: string
  type: string
  scheme?: SecuritySchemeObject
  requirements: string[]
}

// Utility functions
function isRef(obj: unknown): obj is { $ref: string } {
  return obj !== null && typeof obj === 'object' && '$ref' in obj
}

function resolveRef(ref: string, api: OASDocument): unknown {
  const parts = ref.replace('#/', '').split('/')
  let result: unknown = api
  for (const part of parts) {
    result = (result as Record<string, unknown>)[part]
    if (!result) return null
  }
  return result
}

// MIME type matching utility functions
function matchesMimeType(types: string[], mediaType: string): boolean {
  return types.some(type => mediaType.indexOf(type) > -1)
}

const mimeTypeMatchers = {
  json: (contentType: string): boolean => {
    return matchesMimeType([
      'application/json',
      'application/x-json',
      '+json'
    ], contentType)
  }
}

function matchesJsonMimeType(mimeType: string): boolean {
  return mimeTypeMatchers.json(mimeType)
}

/**
 * Get the preferred content type
 * @param contentTypes List of available content types
 * @param preferJson Whether to prefer JSON type
 * @returns The preferred content type
 */
function getPreferredContentType(contentTypes: string[], preferJson: boolean = true): string {
  if (!contentTypes.length) {
    return 'application/json'
  }

  // If there's only one type, return it directly
  if (contentTypes.length === 1) {
    return contentTypes[0] || 'application/json'
  }

  // If JSON is preferred, search for JSON type first
  if (preferJson) {
    for (const type of contentTypes) {
      if (mimeTypeMatchers.json(type)) {
        return type
      }
    }
  }

  // If no matching known type, return the first one
  return contentTypes[0] || 'application/json'
}

// Polymorphism detection and handling utility functions
function usesPolymorphism(schema: SchemaObject): boolean {
  return !!(schema.oneOf || schema.anyOf || schema.allOf)
}

function resolvePolymorphicSchema(schema: SchemaObject, api: OASDocument): SchemaObject[] {
  const schemas: SchemaObject[] = []

  // Handle oneOf
  if (schema.oneOf) {
    schema.oneOf.forEach((subSchema) => {
      if (isRef(subSchema)) {
        const resolved = resolveRef(subSchema.$ref, api) as SchemaObject
        if (resolved) schemas.push(resolved)
      } else {
        schemas.push(subSchema as SchemaObject)
      }
    })
  }

  // Handle anyOf
  if (schema.anyOf) {
    schema.anyOf.forEach((subSchema) => {
      if (isRef(subSchema)) {
        const resolved = resolveRef(subSchema.$ref, api) as SchemaObject
        if (resolved) schemas.push(resolved)
      } else {
        schemas.push(subSchema as SchemaObject)
      }
    })
  }

  // Handle allOf - need to merge all schemas
  if (schema.allOf) {
    const mergedSchema: SchemaObject = { ...schema }
    delete mergedSchema.allOf

    schema.allOf.forEach((subSchema) => {
      let resolvedSchema: SchemaObject
      if (isRef(subSchema)) {
        resolvedSchema = resolveRef(subSchema.$ref, api) as SchemaObject
      } else {
        resolvedSchema = subSchema as SchemaObject
      }

      if (resolvedSchema) {
        // Merge properties
        if (resolvedSchema.properties) {
          mergedSchema.properties = { ...mergedSchema.properties, ...resolvedSchema.properties }
        }
        if (resolvedSchema.required) {
          mergedSchema.required = [...(mergedSchema.required || []), ...resolvedSchema.required]
        }
        // Merge other properties
        Object.keys(resolvedSchema).forEach((key) => {
          if (key !== 'properties' && key !== 'required' && !(key in mergedSchema)) {
            (mergedSchema as Record<string, unknown>)[key] = (resolvedSchema as Record<string, unknown>)[key]
          }
        })
      }
    })

    schemas.push(mergedSchema)
  }

  return schemas
}

function generateSampleFromPolymorphicSchema(schema: SchemaObject, api: OASDocument): unknown {
  if (!usesPolymorphism(schema)) {
    return generateSampleFromSchema(schema, api)
  }

  const resolvedSchemas = resolvePolymorphicSchema(schema, api)
  if (resolvedSchemas.length === 0) return null

  // For oneOf and anyOf, return the example of the first schema
  // For allOf, return the example of the merged schema
  return generateSampleFromSchema(resolvedSchemas[0] || schema, api)
}

function generateSampleFromSchema(schema: SchemaObject, api: OASDocument): unknown {
  if (!schema) return null

  // Handle references
  if (isRef(schema)) {
    const resolved = resolveRef((schema as { $ref: string }).$ref, api) as SchemaObject
    return resolved ? generateSampleFromSchema(resolved, api) : null
  }

  // Handle polymorphism
  if (usesPolymorphism(schema)) {
    return generateSampleFromPolymorphicSchema(schema, api)
  }

  // If there's an example, return it directly
  if (schema.example !== undefined) {
    return schema.example
  }

  // Generate examples based on type
  switch (schema.type) {
    case 'string':
      if (schema.enum) return schema.enum[0]
      if (schema.format === 'date') return '2023-01-01'
      if (schema.format === 'date-time') return '2023-01-01T00:00:00Z'
      if (schema.format === 'email') return 'example@example.com'
      return '<string>'

    case 'number':
    case 'integer':
      if (schema.enum) return schema.enum[0]
      return schema.minimum || 0

    case 'boolean':
      return true

    case 'array':
      if (schema.items) {
        const itemSample = generateSampleFromSchema(schema.items as SchemaObject, api)
        return [itemSample]
      }
      return []

    case 'object': {
      const obj: Record<string, unknown> = {}
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, propSchema]) => {
          obj[key] = generateSampleFromSchema(propSchema as SchemaObject, api)
        })
      } else if ('items' in schema) {
        return generateSampleFromSchema((schema as any).items as SchemaObject, api)
      }

      return obj
    }

    default:
      return null
  }
}

// Server URL utility functions
function ensureProtocol(url: string): string {
  // Add protocol to urls starting with // e.g. //example.com
  if (url.match(/^\/\//)) {
    return `https:${url}`
  }

  // Add protocol to urls with no // within them
  if (!url.match(/\/\//)) {
    return `https://${url}`
  }

  return url
}

function stripTrailingSlash(url: string): string {
  if (url[url.length - 1] === '/') {
    return url.slice(0, -1)
  }

  return url
}

/**
 * Normalize a OpenAPI server URL by ensuring that it has a proper HTTP protocol and doesn't have a
 * trailing slash.
 */
function normalizedUrl(api: OASDocument, selected: number): string {
  const exampleDotCom = 'https://example.com'
  let url: string
  try {
    url = api.servers?.[selected]?.url || ''
    // This is to catch the case where servers = [{}]
    if (!url) throw new Error('no url')

    // Stripping the '/' off the end
    url = stripTrailingSlash(url)

    // Check if the URL is just a path a missing an origin, for example `/api/v3`. If so, then make
    // `example.com` the origin to avoid it becoming something invalid like `https:///api/v3`.
    if (url.startsWith('/') && !url.startsWith('//')) {
      const urlWithOrigin = new URL(exampleDotCom)
      urlWithOrigin.pathname = url
      url = urlWithOrigin.href
    }
  } catch {
    url = ''
  }

  return url ? ensureProtocol(url) : ''
}

// Simplified OAS class
export class SimpleOAS {
  private api: OASDocument
  private dereferenced: boolean = false

  constructor(apiDefinition: OASDocument | string) {
    if (typeof apiDefinition === 'string') {
      this.api = JSON.parse(apiDefinition)
    } else {
      this.api = apiDefinition
    }
  }

  /**
   * Dereference - simplified version, resolve $ref references
   */
  async dereference(): Promise<void> {
    if (this.dereferenced) return

    this.api = this.dereferenceObject(this.api) as OASDocument
    this.dereferenced = true
  }

  private dereferenceObject(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map(item => this.dereferenceObject(item))
    }

    if (obj && typeof obj === 'object') {
      if (isRef(obj)) {
        const resolved = resolveRef(obj.$ref, this.api)
        return resolved ? this.dereferenceObject(resolved) : obj
      }

      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.dereferenceObject(value)
      }
      return result
    }

    return obj
  }

  /**
   * Get content type
   */
  getContentType(path: string, method: HttpMethods): string {
    const operation = this.getOperation(path, method)
    if (!operation) return 'application/json'

    let requestBody = operation.requestBody as RequestBodyObject | ReferenceObject

    // Resolve reference
    if (requestBody && isRef(requestBody)) {
      requestBody = resolveRef(requestBody.$ref, this.api) as RequestBodyObject
    }

    if (requestBody && 'content' in requestBody && requestBody.content) {
      const contentTypes = Object.keys(requestBody.content)
      return getPreferredContentType(contentTypes, true)
    }

    return 'application/json'
  }

  /**
   * Get response Content-Types
   */
  getResponseContentTypes(path: string, method: HttpMethods, statusCode: string | number = '200'): string[] {
    const operation = this.getOperation(path, method)
    if (!operation?.responses) return []

    const response = operation.responses[statusCode.toString()]
    if (!response) return []

    let responseObj = response as ResponseObject | ReferenceObject

    // Resolve reference
    if (isRef(responseObj)) {
      responseObj = resolveRef(responseObj.$ref, this.api) as ResponseObject
    }

    if (responseObj && 'content' in responseObj && responseObj.content) {
      return Object.keys(responseObj.content)
    }

    return []
  }

  /**
   * Get response Content-Type
   */
  getResponseContentType(path: string, method: HttpMethods, statusCode: string | number = '200'): string {
    const operation = this.getOperation(path, method)
    if (!operation?.responses) return 'application/json'

    const response = operation.responses[statusCode.toString()]
    if (!response) return 'application/json'

    let responseObj = response as ResponseObject | ReferenceObject

    // Resolve reference
    if (isRef(responseObj)) {
      responseObj = resolveRef(responseObj.$ref, this.api) as ResponseObject
    }

    if (responseObj && 'content' in responseObj && responseObj.content) {
      const contentTypes = Object.keys(responseObj.content)
      return getPreferredContentType(contentTypes, true)
    }

    return 'application/json'
  }

  /**
   * Get parameters
   */
  getParameters(path: string, method: HttpMethods): ParameterObject[] {
    const operation = this.getOperation(path, method)
    if (!operation) return []

    const parameters: ParameterObject[] = []

    // Operation-level parameters
    if (operation.parameters) {
      parameters.push(...(operation.parameters as ParameterObject[]))
    }

    // Path-level parameters
    const pathItem = this.api?.paths?.[path]
    if (pathItem?.parameters) {
      parameters.push(...(pathItem.parameters as ParameterObject[]))
    }

    return parameters
  }

  /**
   * Get request body
   */
  getRequestBody(path: string, method: HttpMethods, mediaType?: string): MediaTypeObject | null {
    const operation = this.getOperation(path, method)
    if (!operation?.requestBody) return null

    const requestBody = operation.requestBody as RequestBodyObject
    if (!requestBody.content) return null

    if (mediaType) {
      return requestBody.content[mediaType] || null
    }

    // If no media type is specified, prioritize returning JSON
    const contentTypes = Object.keys(requestBody.content)
    for (const type of contentTypes) {
      if (matchesJsonMimeType(type)) {
        return requestBody.content[type] || null
      }
    }

    // Return the first available
    return requestBody.content[contentTypes[0] || ''] || null
  }

  /**
   * Get request body JSON Schema (supports polymorphism)
   */
  getRequestBodyAsJSONSchema(path: string, method: HttpMethods, mediaType?: string): SchemaObject | null {
    const mediaObj = this.getRequestBody(path, method, mediaType)
    if (!mediaObj?.schema) return null

    const schema = mediaObj.schema as SchemaObject
    if (usesPolymorphism(schema)) {
      const resolvedSchemas = resolvePolymorphicSchema(schema, this.api)
      return resolvedSchemas.length > 0 ? (resolvedSchemas[0] || null) : schema
    }

    return schema
  }

  /**
   * Get request body example
   */
  getRequestBodyExample(path: string, method: HttpMethods, mediaType?: string): Record<string, unknown> {
    const operation = this.getOperation(path, method)
    if (!operation?.requestBody) return null

    // Resolve reference
    let requestBody: RequestBodyObject
    if (isRef(operation.requestBody)) {
      requestBody = resolveRef(operation.requestBody.$ref, this.api) as RequestBodyObject
    } else {
      requestBody = operation.requestBody as RequestBodyObject
    }

    if (!requestBody?.content) return null

    // If mediaType is specified, use it directly
    if (mediaType && requestBody.content[mediaType]) {
      const mediaObj = requestBody.content[mediaType]

      // Return example if it exists
      if (mediaObj.example !== undefined) {
        return mediaObj.example
      }

      // Return first example from examples if it exists
      if (mediaObj.examples) {
        const firstExampleKey = Object.keys(mediaObj.examples)[0]
        if (firstExampleKey) {
          const exampleObj = mediaObj.examples[firstExampleKey]
          if (exampleObj && typeof exampleObj === 'object' && 'value' in exampleObj) {
            return exampleObj.value
          }
          return exampleObj
        }
      }

      // Generate example from schema if available
      if (mediaObj.schema) {
        return generateSampleFromSchema(mediaObj.schema as SchemaObject, this.api)
      }

      return null
    }

    return null
  }

  /**
   * Get response status codes list
   */
  getResponseStatusCodes(path: string, method: HttpMethods): string[] {
    const operation = this.getOperation(path, method)
    if (!operation?.responses) return []

    return Object.keys(operation.responses)
  }

  /**
   * Get response object by status code
   */
  getResponseByStatusCode(path: string, method: HttpMethods, statusCode: string | number): ResponseObject | null {
    const operation = this.getOperation(path, method)
    if (!operation?.responses) return null

    const response = operation.responses[statusCode.toString()]
    if (!response) return null

    // Resolve reference
    if (isRef(response)) {
      return resolveRef(response.$ref, this.api) as ResponseObject
    }

    return response as ResponseObject
  }

  /**
   * Get response JSON Schema (supports polymorphism)
   */
  getResponseAsJSONSchema(path: string, method: HttpMethods, statusCode: string | number, contentType?: string): SchemaObject | null {
    const response = this.getResponseByStatusCode(path, method, statusCode)
    if (!response?.content) return null

    if (contentType && response.content[contentType]) {
      const mediaObj = response.content[contentType]
      const schema = mediaObj.schema as SchemaObject
      if (schema && usesPolymorphism(schema)) {
        const resolvedSchemas = resolvePolymorphicSchema(schema, this.api)
        return resolvedSchemas.length > 0 ? (resolvedSchemas[0] || null) : schema
      }
      return schema || null
    }

    // Find JSON media type
    for (const [mediaType, mediaObj] of Object.entries(response.content)) {
      if (matchesJsonMimeType(mediaType)) {
        const schema = mediaObj.schema as SchemaObject
        if (schema && usesPolymorphism(schema)) {
          const resolvedSchemas = resolvePolymorphicSchema(schema, this.api)
          return resolvedSchemas.length > 0 ? (resolvedSchemas[0] || null) : schema
        }
        return schema || null
      }
    }

    // If no JSON type, return the first available schema
    const firstContent = Object.values(response.content)[0]
    if (firstContent?.schema) {
      const schema = firstContent.schema as SchemaObject
      if (schema && usesPolymorphism(schema)) {
        const resolvedSchemas = resolvePolymorphicSchema(schema, this.api)
        return resolvedSchemas.length > 0 ? (resolvedSchemas[0] || null) : schema
      }
      return schema
    }

    return null
  }

  /**
   * Check if response uses polymorphism
   */
  hasPolymorphicResponse(path: string, method: HttpMethods, statusCode: string = '200'): boolean {
    const response = this.getResponseByStatusCode(path, method, statusCode)
    if (!response?.content) return false

    for (const mediaType of Object.values(response.content)) {
      if (mediaType.schema && usesPolymorphism(mediaType.schema as SchemaObject)) {
        return true
      }
    }

    return false
  }

  /**
   * Generate response example (based on schema properties)
   */
  generateResponseExample(path: string, method: HttpMethods, statusCode: string | number = '200'): Record<string, unknown> {
    const response = this.getResponseByStatusCode(path, method, statusCode)
    if (!response?.content) return {}

    const examples: Record<string, unknown> = {}

    for (const [mediaType, mediaObj] of Object.entries(response.content)) {
      if (mediaObj.schema) {
        const example = generateSampleFromSchema(mediaObj.schema as SchemaObject, this.api)
        if (example !== null) {
          examples[mediaType] = example
        }
      }
    }

    return examples
  }

  /**
   * Get security configuration (with type information)
   */
  getSecurityWithTypes(path: string, method: HttpMethods): SecurityProps[] {
    const security = this.getSecurity(path, method)
    const result: SecurityProps[] = []

    security.forEach((securityRequirement) => {
      Object.keys(securityRequirement).forEach((schemeName) => {
        const scheme = this.api.components?.securitySchemes?.[schemeName] as SecuritySchemeObject
        if (scheme) {
          result.push({
            name: schemeName,
            type: scheme.type,
            scheme,
            requirements: securityRequirement[schemeName] || []
          })
        }
      })
    })

    return result
  }

  /**
   * Get security configuration
   */
  getSecurity(path: string, method: HttpMethods): SecurityRequirementObject[] {
    const operation = this.getOperation(path, method)

    // Prioritize operation-level security configuration
    if (operation?.security) {
      return operation.security
    }

    // Use global security configuration
    return this.api.security || []
  }

  /**
   * Get operation object
   */
  private getOperation(path: string, method: HttpMethods): OperationObject | null {
    const pathItem = this.api?.paths?.[path]
    if (!pathItem) return null

    return (pathItem as Record<string, unknown>)[method.toLowerCase()] as OperationObject || null
  }

  /**
   * Get all paths
   */
  getPaths(): Record<string, unknown> {
    return this.api.paths || {}
  }

  /**
   * Get server URL
   */
  url(selected = 0): string {
    return normalizedUrl(this.api, selected)
  }
}

export default SimpleOAS
