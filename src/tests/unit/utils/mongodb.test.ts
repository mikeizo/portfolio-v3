import { beforeEach, describe, expect, it, vi } from 'vitest'
import { connectToDatabase } from '@/utils/mongodb'
import mongoose from 'mongoose'

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn<() => Promise<typeof mongoose>>(),
    connection: { collection: vi.fn<() => unknown>() }
  }
}))

vi.mock('@/models', () => ({ writeModels: {} }))

const connectMock = vi.mocked(mongoose.connect)
const globalCache = globalThis as typeof globalThis & {
  __mongooseConn?: Promise<typeof mongoose> | null
}

beforeEach(() => {
  vi.clearAllMocks()
  globalCache.__mongooseConn = null
})

describe('connectToDatabase', () => {
  it('shares a single connect call across concurrent callers', async () => {
    connectMock.mockResolvedValue(mongoose)

    const results = await Promise.all([
      connectToDatabase(),
      connectToDatabase(),
      connectToDatabase()
    ])

    expect(connectMock).toHaveBeenCalledTimes(1)
    for (const result of results) {
      expect(result).toBe(mongoose.connection)
    }
  })

  it('reuses the established connection on later calls', async () => {
    connectMock.mockResolvedValue(mongoose)

    await connectToDatabase()
    await connectToDatabase()

    expect(connectMock).toHaveBeenCalledTimes(1)
  })

  it('clears the cache on failure so the next call retries', async () => {
    connectMock.mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(mongoose)

    await expect(connectToDatabase()).rejects.toThrow('down')
    await expect(connectToDatabase()).resolves.toBe(mongoose.connection)

    expect(connectMock).toHaveBeenCalledTimes(2)
  })

  it('connects with serverless pool options', async () => {
    connectMock.mockResolvedValue(mongoose)

    await connectToDatabase()

    expect(connectMock).toHaveBeenCalledWith(
      'mongodb://127.0.0.1:27017',
      expect.objectContaining({
        dbName: 'unit-test',
        maxPoolSize: 5,
        minPoolSize: 0,
        maxIdleTimeMS: 15_000,
        serverSelectionTimeoutMS: 5_000
      })
    )
  })
})
