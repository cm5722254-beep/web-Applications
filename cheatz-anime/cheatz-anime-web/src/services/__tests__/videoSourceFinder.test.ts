/**
 * Video Source Finder Tests
 * 
 * Tests for alternative video source discovery including:
 * - Internal API fallback
 * - External animekill.com API fallback
 * - Rate limiting and retry logic
 */

import { findAlternativeSource } from '../videoSourceFinder'
import { apiClient } from '@/lib/api'
import * as videoHealthService from '../videoHealthService'

// Mock dependencies
jest.mock('@/lib/api')
jest.mock('../videoHealthService')

global.fetch = jest.fn()

describe('videoSourceFinder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findAlternativeSource', () => {
    it('should return URL from internal API if working', async () => {
      const mockUrl = 'https://internal-cdn.com/video.mp4'
      
      ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { playback_url: mockUrl },
      })
      
      ;(videoHealthService.checkVideoUrl as jest.Mock).mockResolvedValueOnce({
        ok: true,
        error: null,
      })

      const result = await findAlternativeSource('spy-family', 1)
      expect(result).toBe(mockUrl)
      expect(apiClient.get).toHaveBeenCalledWith('/playback?anime=spy-family&episode=1')
    })

    it('should fallback to external API if internal fails', async () => {
      const mockUrl = 'https://external-cdn.com/video.mp4'
      
      // Internal API fails
      ;(apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'))
      
      // External API succeeds
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ playback_url: mockUrl }),
      })
      
      ;(videoHealthService.checkVideoUrl as jest.Mock).mockResolvedValueOnce({
        ok: true,
        error: null,
      })

      const result = await findAlternativeSource('one-piece', 1000)
      expect(result).toBe(mockUrl)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://apis.animekill.com/api/v1/playback?anime=one-piece&episode=1000'
      )
    })

    it('should retry on 429 rate limit response', async () => {
      const mockUrl = 'https://external-cdn.com/video.mp4'
      
      // Internal API fails
      ;(apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'))
      
      // First external request: 429 rate limit
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
      })
      
      // Second external request: success
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ playback_url: mockUrl }),
      })
      
      ;(videoHealthService.checkVideoUrl as jest.Mock).mockResolvedValueOnce({
        ok: true,
        error: null,
      })

      const result = await findAlternativeSource('naruto', 220)
      expect(result).toBe(mockUrl)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should return null if both sources fail', async () => {
      // Internal API fails
      ;(apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'))
      
      // External API fails
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await findAlternativeSource('unknown-anime', 1)
      expect(result).toBe(null)
    })

    it('should return null if URL check fails for working response', async () => {
      const mockUrl = 'https://broken-cdn.com/video.mp4'
      
      ;(apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { playback_url: mockUrl },
      })
      
      // URL check fails (video not actually accessible)
      ;(videoHealthService.checkVideoUrl as jest.Mock).mockResolvedValueOnce({
        ok: false,
        error: 'Connection refused',
      })
      
      // External also fails
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const result = await findAlternativeSource('broken-anime', 1)
      expect(result).toBe(null)
    })
  })
})
