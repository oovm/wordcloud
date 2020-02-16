import { WordFrequency } from './types';

/**
 * 数据分析器 - 支持数据解析和处理
 */
export class DataAnalyzer {
  constructor() {
    // 移除分词相关功能
  }



  /**
   * 从CSV数据解析词频
   */
  parseCSV(csvText: string, wordColumn: number = 0, frequencyColumn: number = 1): WordFrequency[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    const result: WordFrequency[] = [];
    
    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length > Math.max(wordColumn, frequencyColumn)) {
        const word = columns[wordColumn];
        const frequency = parseFloat(columns[frequencyColumn]) || 1;
        
        if (word && word.length > 0) {
          result.push({ word, frequency });
        }
      }
    }
    
    return result;
  }

  /**
   * 从JSON数据解析词频
   */
  parseJSON(jsonText: string): WordFrequency[] {
    try {
      const data = JSON.parse(jsonText);
      
      if (Array.isArray(data)) {
        return data.map(item => {
          if (typeof item === 'object' && item.word && item.frequency) {
            return {
              word: String(item.word),
              frequency: Number(item.frequency) || 1,
              type: item.type,
              metadata: item.metadata
            };
          } else if (typeof item === 'string') {
            return { word: item, frequency: 1 };
          }
          return { word: String(item), frequency: 1 };
        });
      } else if (typeof data === 'object') {
        return Object.entries(data).map(([word, frequency]) => ({
          word,
          frequency: Number(frequency) || 1
        }));
      }
    } catch (error) {
      console.error('JSON解析错误:', error);
    }
    
    return [];
  }


}