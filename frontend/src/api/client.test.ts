import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, listBooks } from './client'

describe('API client error mapping', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps the server error body to an ApiError with status, code, and message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: 'CONFLICT', message: 'Duplicate' } }), { status: 409 }),
      ),
    )

    const error = await listBooks().catch((err: unknown) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, code: 'CONFLICT', message: 'Duplicate' })
  })

  it('falls back to a generic message when the body is not the expected shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>oops</html>', { status: 502 })))

    const error = await listBooks().catch((err: unknown) => err)

    expect(error).toMatchObject({ status: 502, code: 'UNKNOWN', message: 'Something went wrong. Please try again.' })
  })
})
