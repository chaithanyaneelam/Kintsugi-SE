import { z } from 'zod'

/**
 * Zod validation schema for frontend environment variables.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .min(1, { message: 'VITE_API_BASE_URL must be a non-empty string.' })
    .url({ message: 'VITE_API_BASE_URL must be a valid HTTP/HTTPS URL.' }),
  VITE_WS_BASE_URL: z
    .string()
    .trim()
    .min(1, { message: 'VITE_WS_BASE_URL must be a non-empty string.' })
    .refine(
      (val) => val.startsWith('ws://') || val.startsWith('wss://') || val.startsWith('http://') || val.startsWith('https://'),
      { message: 'VITE_WS_BASE_URL must be a valid WebSocket (ws:// or wss://) or HTTP URL.' },
    ),
})

/**
 * Raw environment values from import.meta.env with dev fallbacks.
 */
const rawEnv = {
  VITE_API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : 'http://localhost:8000/api/v1'),
  VITE_WS_BASE_URL:
    import.meta.env.VITE_WS_BASE_URL ||
    (typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1/ws`
      : 'ws://localhost:8000/api/v1/ws'),
}

const parsed = envSchema.safeParse(rawEnv)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  const errorMessage =
    `\n❌ Invalid or missing environment configuration:\n${issues}\n\n` +
    `Resolution: Create a .env file in the web root directory based on .env.example with valid configuration.\n`

  // eslint-disable-next-line no-console
  console.error(errorMessage)
  throw new Error(errorMessage)
}

/**
 * Immutable strongly-typed application environment configuration.
 * Single source of truth — do not access import.meta.env directly.
 */
export const env = Object.freeze({
  API_BASE_URL: parsed.data.VITE_API_BASE_URL,
  WS_BASE_URL: parsed.data.VITE_WS_BASE_URL,
})

export type AppEnv = typeof env
export default env
