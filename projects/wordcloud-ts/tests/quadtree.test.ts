import { describe, it, expect, beforeEach } from 'vitest'
import { QuadTree } from '../src/quadtree'
import type { WordCloudElement } from '../src/types'

describe('QuadTree', () => {
  let quadTree: QuadTree
  
  beforeEach(() => {
    quadTree = new QuadTree(0, 0, 800, 600)
  })
  
  describe('constructor', () => {
    it('should create a quadtree with correct bounds', () => {
      expect(quadTree.bounds.x).toBe(0)
      expect(quadTree.bounds.y).toBe(0)
      expect(quadTree.bounds.width).toBe(800)
      expect(quadTree.bounds.height).toBe(600)
    })
    
    it('should initialize with no elements', () => {
      expect(quadTree.getAllElements()).toHaveLength(0)
    })
  })
  
  describe('insert', () => {
    it('should insert a single element', () => {
      const element: WordCloudElement = {
        type: 'text',
        text: 'test',
        x: 100,
        y: 100,
        width: 50,
        height: 20,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
      }
      
      quadTree.insert(element)
      expect(quadTree.getAllElements()).toHaveLength(1)
      expect(quadTree.getAllElements()[0]).toBe(element)
    })
    
    it('should insert multiple elements', () => {
      const elements: WordCloudElement[] = [
        {
          type: 'text',
          text: 'test1',
          x: 100,
          y: 100,
          width: 50,
          height: 20,
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        },
        {
          type: 'text',
          text: 'test2',
          x: 200,
          y: 200,
          width: 60,
          height: 25,
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        }
      ]
      
      elements.forEach(el => quadTree.insert(el))
      expect(quadTree.getAllElements()).toHaveLength(2)
    })
    
    it('should trigger subdivision when capacity is exceeded', () => {
      // Insert more than MAX_OBJECTS (10) elements
      for (let i = 0; i < 12; i++) {
        const element: WordCloudElement = {
          type: 'text',
          text: `test${i}`,
          x: 10 + i * 5,
          y: 10 + i * 5,
          width: 30,
          height: 15,
          fontSize: 12,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        }
        quadTree.insert(element)
      }
      
      expect(quadTree.getAllElements()).toHaveLength(12)
    })
  })
  
  describe('queryIntersects', () => {
    beforeEach(() => {
      // Insert test elements
      const elements: WordCloudElement[] = [
        {
          type: 'text',
          text: 'center',
          x: 400,
          y: 300,
          width: 50,
          height: 20,
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        },
        {
          type: 'text',
          text: 'topleft',
          x: 100,
          y: 100,
          width: 40,
          height: 18,
          fontSize: 14,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        },
        {
          type: 'text',
          text: 'bottomright',
          x: 600,
          y: 500,
          width: 60,
          height: 22,
          fontSize: 18,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        }
      ]
      
      elements.forEach(el => quadTree.insert(el))
    })
    
    it('should find intersecting elements', () => {
      const queryRect = { x: 380, y: 280, width: 60, height: 60 }
      const results = quadTree.queryIntersects(queryRect)
      
      expect(results).toHaveLength(1)
      expect(results[0].text).toBe('center')
    })
    
    it('should return empty array when no intersections', () => {
      const queryRect = { x: 0, y: 0, width: 50, height: 50 }
      const results = quadTree.queryIntersects(queryRect)
      
      expect(results).toHaveLength(0)
    })
    
    it('should find multiple intersecting elements', () => {
      const queryRect = { x: 0, y: 0, width: 800, height: 600 }
      const results = quadTree.queryIntersects(queryRect)
      
      expect(results).toHaveLength(3)
    })
  })
  
  describe('checkCollision', () => {
    beforeEach(() => {
      const element: WordCloudElement = {
        type: 'text',
        text: 'existing',
        x: 200,
        y: 200,
        width: 100,
        height: 30,
        fontSize: 20,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
      }
      quadTree.insert(element)
    })
    
    it('should detect collision with existing element', () => {
      const newElement: WordCloudElement = {
        type: 'text',
        text: 'new',
        x: 220,
        y: 210,
        width: 80,
        height: 25,
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
      }
      
      expect(quadTree.checkCollision(newElement)).toBe(true)
    })
    
    it('should not detect collision when elements do not overlap', () => {
      const newElement: WordCloudElement = {
        type: 'text',
        text: 'new',
        x: 400,
        y: 400,
        width: 80,
        height: 25,
        fontSize: 18,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
      }
      
      expect(quadTree.checkCollision(newElement)).toBe(false)
    })
  })
  
  describe('clear', () => {
    it('should remove all elements', () => {
      const element: WordCloudElement = {
        type: 'text',
        text: 'test',
        x: 100,
        y: 100,
        width: 50,
        height: 20,
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0
      }
      
      quadTree.insert(element)
      expect(quadTree.getAllElements()).toHaveLength(1)
      
      quadTree.clear()
      expect(quadTree.getAllElements()).toHaveLength(0)
    })
  })
  
  describe('performance', () => {
    it('should handle large number of elements efficiently', () => {
      const startTime = performance.now()
      
      // Insert 1000 elements
      for (let i = 0; i < 1000; i++) {
        const element: WordCloudElement = {
          type: 'text',
          text: `word${i}`,
          x: Math.random() * 800,
          y: Math.random() * 600,
          width: 30 + Math.random() * 50,
          height: 15 + Math.random() * 20,
          fontSize: 12 + Math.random() * 8,
          fontFamily: 'Arial',
          color: '#000000',
          rotation: 0
        }
        quadTree.insert(element)
      }
      
      const insertTime = performance.now() - startTime
      
      // Query performance
      const queryStartTime = performance.now()
      for (let i = 0; i < 100; i++) {
        const queryRect = {
          x: Math.random() * 700,
          y: Math.random() * 500,
          width: 100,
          height: 100
        }
        quadTree.queryIntersects(queryRect)
      }
      const queryTime = performance.now() - queryStartTime
      
      expect(quadTree.getAllElements()).toHaveLength(1000)
      expect(insertTime).toBeLessThan(1000) // Should complete within 1 second
      expect(queryTime).toBeLessThan(500) // Queries should be fast
    })
  })
})