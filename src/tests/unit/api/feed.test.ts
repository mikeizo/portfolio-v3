import type { APIContext } from 'astro'

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DELETE, PATCH, POST, PUT } from '@/pages/api/admin/[feed]'
import { deleteData, insertData, updateData } from '@/utils/mongodb'
import { writeModels } from '@/models'

vi.mock('@/utils/mongodb', () => ({
  insertData: vi.fn<typeof insertData>(),
  updateData: vi.fn<typeof updateData>(),
  deleteData: vi.fn<typeof deleteData>()
}))

const insertDataMock = vi.mocked(insertData)
const updateDataMock = vi.mocked(updateData)
const deleteDataMock = vi.mocked(deleteData)

const makeContext = (feed: string, method: string, body: unknown) =>
  ({
    params: { feed },
    request: new Request(`http://localhost:3030/api/admin/${feed}`, {
      method,
      body: JSON.stringify(body)
    })
  }) as unknown as APIContext

beforeEach(() => {
  vi.resetAllMocks()
})

describe('feed whitelist', () => {
  it('covers exactly the registered write models', () => {
    expect(Object.keys(writeModels).sort()).toEqual(['about', 'experience', 'settings', 'work'])
  })

  it.each([
    ['POST', POST],
    ['PATCH', PATCH],
    ['PUT', PUT],
    ['DELETE', DELETE]
  ])('%s returns 404 for a collection outside the whitelist', async (method, handler) => {
    const response = await handler(makeContext('users', method, { id: '1' }))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Invalid collection users' })
    expect(insertDataMock).not.toHaveBeenCalled()
    expect(updateDataMock).not.toHaveBeenCalled()
    expect(deleteDataMock).not.toHaveBeenCalled()
  })
})

describe('POST /api/admin/[feed]', () => {
  it('returns 200 with the inserted document', async () => {
    insertDataMock.mockResolvedValue({ _id: '1', name: 'x' } as never)

    const response = await POST(makeContext('work', 'POST', { name: 'x' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ _id: '1', name: 'x' })
    expect(insertDataMock).toHaveBeenCalledWith('work', { name: 'x' })
  })

  it('returns 400 when the insert produces no result', async () => {
    insertDataMock.mockResolvedValue(null)

    const response = await POST(makeContext('work', 'POST', { name: 'x' }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Failed to insert data from the work collection'
    })
  })

  it.each(['ValidationError', 'StrictModeError', 'CastError'])(
    'maps a rejected %s to 400 with details',
    async (name) => {
      insertDataMock.mockRejectedValue({ name, message: 'bad', errors: { field: 'why' } })

      const response = await POST(makeContext('work', 'POST', { name: 'x' }))

      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({
        error: 'Validation failed',
        name,
        message: 'bad',
        details: { field: 'why' }
      })
    }
  )

  it('maps unexpected errors to 500', async () => {
    insertDataMock.mockRejectedValue(new Error('boom'))

    const response = await POST(makeContext('work', 'POST', { name: 'x' }))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
  })
})

describe('PATCH and PUT /api/admin/[feed]', () => {
  it.each([
    ['PATCH', PATCH],
    ['PUT', PUT]
  ])('%s returns 200 with the updated document', async (method, handler) => {
    updateDataMock.mockResolvedValue({ _id: '1', title: 'new' } as never)

    const response = await handler(makeContext('settings', method, { title: 'new' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ _id: '1', title: 'new' })
    expect(updateDataMock).toHaveBeenCalledWith('settings', { title: 'new' })
  })

  it.each([
    ['PATCH', PATCH],
    ['PUT', PUT]
  ])('%s returns 400 when no document was updated', async (method, handler) => {
    updateDataMock.mockResolvedValue(null)

    const response = await handler(makeContext('settings', method, { title: 'new' }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Failed to update data from the settings collection'
    })
  })

  it.each([
    ['PATCH', PATCH],
    ['PUT', PUT]
  ])('%s maps a rejected ValidationError to 400 with details', async (method, handler) => {
    updateDataMock.mockRejectedValue({
      name: 'ValidationError',
      message: 'bad',
      errors: { field: 'why' }
    })

    const response = await handler(makeContext('settings', method, { title: 'new' }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: 'Validation failed',
      name: 'ValidationError',
      message: 'bad',
      details: { field: 'why' }
    })
  })

  it.each([
    ['PATCH', PATCH],
    ['PUT', PUT]
  ])('%s maps unexpected errors to 500', async (method, handler) => {
    updateDataMock.mockRejectedValue(new Error('boom'))

    const response = await handler(makeContext('settings', method, { title: 'new' }))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Internal server error' })
  })
})

describe('DELETE /api/admin/[feed]', () => {
  it('returns 200 with the deleted document', async () => {
    deleteDataMock.mockResolvedValue({ _id: '1' } as never)

    const response = await DELETE(makeContext('work', 'DELETE', { id: '1' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ _id: '1' })
    expect(deleteDataMock).toHaveBeenCalledWith('work', '1')
  })

  it('returns 400 when the body has no id', async () => {
    deleteDataMock.mockResolvedValue({ _id: '1' } as never)

    const response = await DELETE(makeContext('work', 'DELETE', {}))

    expect(response.status).toBe(400)
    expect(deleteDataMock).toHaveBeenCalledWith('work', undefined)
  })
})
