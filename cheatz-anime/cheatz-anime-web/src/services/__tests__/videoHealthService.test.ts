/**
 * Video Health Service Tests
 * 
 * Tests for core video health check functionality including:
 * - URL validation
 * - Health check logic (HEAD/GET fallback)
 * - Store management
 * - Stats tracking
 */

import { checkVideoUrl, getHealthStats, resetStore } from '../videoHealthService'

// Mock fetch globally
global.fetch = jest.fn()

describe('videoHealthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetStore()
  })

  describe('checkVideoUrl', () => {
    it('should return error for empty URL', async () => {
      const result = await checkVideoUrl('')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Empty URL')
    })

    it('should return ok for 200 response on HEAD request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const result = await checkVideoUrl('https://example.com/video.mp4')
      expect(result.ok).toBe(true)
      expect(result.error).toBe(null)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/video.mp4',
        expect.objectContaining({
          method: 'HEAD',
        })
      )
    })

    it('should fallback to GET with Range header on 403 response', async () => {
      // First HEAD request returns 403
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
      })

      // Second GET request returns 200
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      })

      const result = await checkVideoUrl('https://cdn.example.com/video.mp4')
      expect(result.ok).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      
      // Verify GET request with Range header was made
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://cdn.example.com/video.mp4',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Range': 'bytes=0-0' },
        })
      )
    })

    it('should return error for 404 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await checkVideoUrl('https://example.com/missing.mp4')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('HTTP 404')
    })

    it('should return timeout error on AbortError', async () => {
      const abortError: any = { name: 'AbortError', message: 'The operation was aborted' }
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError)

      const result = await checkVideoUrl('https://slow.example.com/video.mp4')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Timeout (5s)')
    })

    it('should return network error on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'))

      const result = await checkVideoUrl('https://broken.example.com/video.mp4')
      expect(result.ok).toBe(false)
      expect(result.error).toBe('Network failure')
    })
  })

  describe('getHealthStats', () => {
    it('should return initial stats with zero counts', () => {
      const stats = getHealthStats()
      expect(stats.total).toBe(0)
      expect(stats.working).toBe(0)
      expect(stats.broken).toBe(0)
      expect(stats.fixed).toBe(0)
      expect(stats.checking).toBe(0)
      expect(stats.unchecked).toBe(0)
      expect(stats.scanProgress).toBe(0)
      expect(stats.isScanning).toBe(false)
      expect(stats.lastScanAt).toBe(null)
    })

    it('should return a copy of stats (not the original object)', () => {
      const stats1 = getHealthStats()
      const stats2 = getHealthStats()
      expect(stats1).not.toBe(stats2) // Different object references
      expect(stats1).toEqual(stats2) // But same values
    })
  })

  describe('resetStore', () => {
    it('should reset all stats to initial values', () => {
      resetStore()
      const stats = getHealthStats()
      expect(stats.total).toBe(0)
      expect(stats.working).toBe(0)
      expect(stats.isScanning).toBe(false)
    })
  })
})
