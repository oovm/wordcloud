import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LayoutEngine } from '../src/layout-engine'
import type { LayoutConfig, WordFrequency } from '../src/types'

describe('LayoutEngine', () => {
  let layoutEngine: LayoutEngine
  let config: LayoutConfig
  
  beforeEach(() => {
    config = {
      width: 800,
      height: 600,
      padding: 10,
      fontFamily: 'Arial',
      fontSizeRange: [12, 48],
      rotationRange: [-45, 45],
      rotationStep: 15,
      spiralStep: 2,
      maxAttempts: 1000
    }
    layoutEngine = new LayoutEngine(config)
  })
  
  describe('constructor', () => {
    it('should create layout engine with correct config', () => {
      expect(layoutEngine.config).toEqual(config)
    })
    
    it('should initialize quadtree with correct bounds', () => {
      expect(layoutEngine.quadTree.bounds.width).toBe(800)
      expect(layoutEngine.quadTree.bounds.height).toBe(600)
    })
  })
  
  describe('setMask', () => {
    it('should set mask image data', () => {
      const mockImageData = new ImageData(100, 100)
      layoutEngine.setMask(mockImageData)
      expect(layoutEngine.maskData).toBe(mockImageData)
    })
  })
  
  describe('layout', () => {
    it('should layout simple word frequency data', async () => {
      const wordFreqs: WordFrequency[] = [
        { text: 'hello', frequency: 10 },
        { text: 'world', frequency: 8 },
        { text: 'test', frequency: 5 }
      ]
      
      const result = await layoutEngine.layout(wordFreqs)
      
      expect(result.elements).toHaveLength(3)
      expect(result.bounds.width).toBeGreaterThan(0)
      expect(result.bounds.height).toBeGreaterThan(0)
      
      // Check that all elements have valid positions
      result.elements.forEach(element => {
        expect(element.x).toBeGreaterThanOrEqual(0)
        expect(element.y).toBeGreaterThanOrEqual(0)
        expect(element.width).toBeGreaterThan(0)
        expect(element.height).toBeGreaterThan(0)
      })
    })
    
    it('should handle empty word frequency array', async () => {
      const result = await layoutEngine.layout([])
      
      expect(result.elements).toHaveLength(0)
      expect(result.bounds.width).toBe(0)
      expect(result.bounds.height).toBe(0)
    })
    
    it('should respect font size range', async () => {
      const wordFreqs: WordFrequency[] = [
        { text: 'big', frequency: 100 },
        { text: 'small', frequency: 1 }
      ]
      
      const result = await layoutEngine.layout(wordFreqs)
      
      const bigElement = result.elements.find(el => el.text === 'big')
      const smallElement = result.elements.find(el => el.text === 'small')
      
      expect(bigElement?.fontSize).toBeGreaterThan(smallElement?.fontSize || 0)
      expect(bigElement?.fontSize).toBeLessThanOrEqual(config.fontSizeRange[1])
      expect(smallElement?.fontSize).toBeGreaterThanOrEqual(config.fontSizeRange[0])
    })
    
    it('should handle different element types', async () => {
      const wordFreqs: WordFrequency[] = [
        { text: 'text', frequency: 10, type: 'text' },
        { text: '😀', frequency: 8, type: 'emoji' },
        { text: 'image.png', frequency: 5, type: 'image', imageUrl: 'data:image/png;base64,test' }
      ]
      
      const result = await layoutEngine.layout(wordFreqs)
      
      expect(result.elements).toHaveLength(3)
      expect(result.elements.some(el => el.type === 'text')).toBe(true)
      expect(result.elements.some(el => el.type === 'emoji')).toBe(true)
      expect(result.elements.some(el => el.type === 'image')).toBe(true)
    })
  })
  
  describe('reset', () => {
    it('should clear quadtree and reset state', async () => {
      const wordFreqs: WordFrequency[] = [
        { text: 'test', frequency: 10 }
      ]
      
      await layoutEngine.layout(wordFreqs)
      expect(layoutEngine.quadTree.getAllElements()).toHaveLength(1)
      
      layoutEngine.reset()
      expect(layoutEngine.quadTree.getAllElements()).toHaveLength(0)
    })
  })
  
  describe('normalizeFrequencies', () => {
    it('should normalize frequencies to 0-1 range', () => {
      const wordFreqs: WordFrequency[] = [
        { text: 'high', frequency: 100 },
        { text: 'medium', frequency: 50 },
        { text: 'low', frequency: 10 }
      ]
      
      const normalized = (layoutEngine as any).normalizeFrequencies(wordFreqs)
      
      expect(normalized[0].normalizedFreq).toBe(1)
      expect(normalized[1].normalizedFreq).toBe(0.5)
      expect(normalized[2].normalizedFreq).toBe(0.1)
    })
    
    it('should handle single frequency', () => {
      const wordFreqs: WordFrequency[] = [
        { text: 'only', frequency: 42 }
      ]
      
      const normalized = (layoutEngine as any).normalizeFrequencies(wordFreqs)
      
      expect(normalized[0].normalizedFreq).toBe(1)
    })
  })
  
  describe('calculateFontSize', () => {
    it('should calculate font size based on normalized frequency', () => {
      const fontSize1 = (layoutEngine as any).calculateFontSize(1.0)
      const fontSize2 = (layoutEngine as any).calculateFontSize(0.5)
      const fontSize3 = (layoutEngine as any).calculateFontSize(0.0)
      
      expect(fontSize1).toBe(config.fontSizeRange[1])
      expect(fontSize2).toBe((config.fontSizeRange[0] + config.fontSizeRange[1]) / 2)
      expect(fontSize3).toBe(config.fontSizeRange[0])
    })
  })
  
  describe('getRandomRotation', () => {
    it('should return rotation within specified range', () => {
      for (let i = 0; i < 100; i++) {
        const rotation = (layoutEngine as any).getRandomRotation()
        expect(rotation).toBeGreaterThanOrEqual(config.rotationRange[0])
        expect(rotation).toBeLessThanOrEqual(config.rotationRange[1])
      }
    })
    
    it('should respect rotation step', () => {
      const rotations = new Set()
      for (let i = 0; i < 100; i++) {
        const rotation = (layoutEngine as any).getRandomRotation()
        rotations.add(rotation)
      }
      
      // All rotations should be multiples of rotationStep
      rotations.forEach(rotation => {
        expect((rotation as number) % config.rotationStep).toBe(0)
      })
    })
  })
  
  describe('measureText', () => {
    it('should return reasonable text dimensions', () => {
      const dimensions = (layoutEngine as any).measureText('Hello World', 16, 'Arial')
      
      expect(dimensions.width).toBeGreaterThan(0)
      expect(dimensions.height).toBeGreaterThan(0)
      expect(dimensions.height).toBeCloseTo(16, 5) // Height should be close to font size
    })
    
    it('should return different dimensions for different text', () => {
      const short = (layoutEngine as any).measureText('Hi', 16, 'Arial')
      const long = (layoutEngine as any).measureText('Hello World', 16, 'Arial')
      
      expect(long.width).toBeGreaterThan(short.width)
    })
  })
  
  describe('isWithinBounds', () => {
    it('should return true for element within bounds', () => {
      const element = {
        x: 100,
        y: 100,
        width: 50,
        height: 20
      }
      
      expect((layoutEngine as any).isWithinBounds(element)).toBe(true)
    })
    
    it('should return false for element outside bounds', () => {
      const element = {
        x: 900, // Outside width
        y: 100,
        width: 50,
        height: 20
      }
      
      expect((layoutEngine as any).isWithinBounds(element)).toBe(false)
    })
  })
  
  describe('isWithinMask', () => {
    beforeEach(() => {
      // Create a simple mask: white center, black edges
      const maskData = new ImageData(100, 100)
      for (let i = 0; i < maskData.data.length; i += 4) {
        const x = (i / 4) % 100
        const y = Math.floor((i / 4) / 100)
        
        // White center (50x50), black edges
        if (x >= 25 && x < 75 && y >= 25 && y < 75) {
          maskData.data[i] = 255     // R
          maskData.data[i + 1] = 255 // G
          maskData.data[i + 2] = 255 // B
          maskData.data[i + 3] = 255 // A
        } else {
          maskData.data[i] = 0       // R
          maskData.data[i + 1] = 0   // G
          maskData.data[i + 2] = 0   // B
          maskData.data[i + 3] = 255 // A
        }
      }
      
      layoutEngine.setMask(maskData)
    })
    
    it('should return true for element within mask', () => {
      const element = {
        x: 40, // Within white center
        y: 40,
        width: 10,
        height: 10
      }
      
      expect((layoutEngine as any).isWithinMask(element)).toBe(true)
    })
    
    it('should return false for element outside mask', () => {
      const element = {
        x: 10, // In black edge
        y: 10,
        width: 10,
        height: 10
      }
      
      expect((layoutEngine as any).isWithinMask(element)).toBe(false)
    })
    
    it('should return true when no mask is set', () => {
      layoutEngine.maskData = null
      
      const element = {
        x: 10,
        y: 10,
        width: 10,
        height: 10
      }
      
      expect((layoutEngine as any).isWithinMask(element)).toBe(true)
    })
  })
  
  describe('performance', () => {
    it('should layout large number of words efficiently', async () => {
      const wordFreqs: WordFrequency[] = []
      for (let i = 0; i < 100; i++) {
        wordFreqs.push({
          text: `word${i}`,
          frequency: Math.random() * 100
        })
      }
      
      const startTime = performance.now()
      const result = await layoutEngine.layout(wordFreqs)
      const endTime = performance.now()
      
      expect(result.elements.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })
})