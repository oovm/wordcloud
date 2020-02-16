import { describe, it, expect, beforeEach } from 'vitest'
import { DataAnalyzer } from '../src/data-analyzer'
import type { WordFrequency } from '../src/types'

describe('DataAnalyzer', () => {
  let analyzer: DataAnalyzer
  
  beforeEach(() => {
    analyzer = new DataAnalyzer()
  })
  
  describe('constructor', () => {
    it('should create data analyzer', () => {
      expect(analyzer).toBeInstanceOf(DataAnalyzer)
    })
  })
  
  describe('parseCSV', () => {
    it('should parse simple CSV with word and frequency columns', () => {
      const csvData = 'word,frequency\nhello,10\nworld,5\ntest,3'
      const result = analyzer.parseCSV(csvData)
      
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ text: 'hello', frequency: 10 })
      expect(result[1]).toEqual({ text: 'world', frequency: 5 })
      expect(result[2]).toEqual({ text: 'test', frequency: 3 })
    })
    
    it('should handle custom column names', () => {
      const csvData = 'term,count\nhello,10\nworld,5'
      const result = analyzer.parseCSV(csvData, {
        textColumn: 'term',
        frequencyColumn: 'count'
      })
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ text: 'hello', frequency: 10 })
    })
    
    it('should handle CSV with additional columns', () => {
      const csvData = 'word,frequency,category\nhello,10,greeting\nworld,5,noun'
      const result = analyzer.parseCSV(csvData)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ text: 'hello', frequency: 10 })
    })
    
    it('should filter out invalid rows', () => {
      const csvData = 'word,frequency\nhello,10\n,5\nworld,\ntest,3'
      const result = analyzer.parseCSV(csvData)
      
      expect(result).toHaveLength(2)
      expect(result.map(r => r.text)).toEqual(['hello', 'test'])
    })
  })
  
  describe('parseJSON', () => {
    it('should parse array of word frequency objects', () => {
      const jsonData = JSON.stringify([
        { text: 'hello', frequency: 10 },
        { text: 'world', frequency: 5 }
      ])
      
      const result = analyzer.parseJSON(jsonData)
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ text: 'hello', frequency: 10 })
    })
    
    it('should handle object with custom property names', () => {
      const jsonData = JSON.stringify([
        { word: 'hello', count: 10 },
        { word: 'world', count: 5 }
      ])
      
      const result = analyzer.parseJSON(jsonData, {
        textProperty: 'word',
        frequencyProperty: 'count'
      })
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ text: 'hello', frequency: 10 })
    })
    
    it('should handle nested object structure', () => {
      const jsonData = JSON.stringify({
        words: [
          { text: 'hello', frequency: 10 },
          { text: 'world', frequency: 5 }
        ]
      })
      
      const result = analyzer.parseJSON(jsonData, {
        arrayPath: 'words'
      })
      
      expect(result).toHaveLength(2)
    })
    
    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json }'
      
      expect(() => analyzer.parseJSON(invalidJson)).toThrow()
    })
  })
  

})