import { defineEventHandler } from 'h3'
import { generateLlmsTxt, textResponse } from '../utils/llms-core.mjs'

export default defineEventHandler(() => textResponse(generateLlmsTxt()))
