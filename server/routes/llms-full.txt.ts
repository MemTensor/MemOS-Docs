import { defineEventHandler } from 'h3'
import { generateLlmsFullTxt, textResponse } from '../utils/llms-core.mjs'

export default defineEventHandler(() => textResponse(generateLlmsFullTxt()))
