import { WordFrequency } from './types';

/**
 * 文本分析器 - 支持分词和词频统计
 */
export class TextAnalyzer {
  private stopWords: Set<string>;
  private chineseStopWords: Set<string>;

  constructor() {
    this.stopWords = new Set([
      // 英文停用词
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
      'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
      'this', 'that', 'these', 'those', 'here', 'there', 'where', 'when', 'why', 'how',
      'what', 'which', 'who', 'whom', 'whose', 'all', 'any', 'some', 'no', 'not', 'only',
      'just', 'very', 'so', 'too', 'more', 'most', 'much', 'many', 'few', 'little', 'less',
      'as', 'than', 'if', 'then', 'else', 'because', 'since', 'while', 'during', 'before', 'after',
      'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'once', 'now', 'then'
    ]);

    this.chineseStopWords = new Set([
      // 中文停用词
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很',
      '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '他', '她',
      '它', '我们', '你们', '他们', '她们', '它们', '这个', '那个', '这些', '那些', '这里', '那里',
      '什么', '怎么', '为什么', '哪里', '哪个', '怎样', '多少', '几个', '第一', '第二', '第三',
      '可以', '应该', '必须', '需要', '想要', '希望', '觉得', '认为', '知道', '明白', '理解',
      '但是', '然后', '因为', '所以', '如果', '虽然', '尽管', '无论', '不管', '除了', '包括',
      '关于', '对于', '由于', '根据', '按照', '通过', '经过', '来自', '来到', '回到', '走到',
      '非常', '特别', '尤其', '特殊', '普通', '一般', '通常', '经常', '总是', '从来', '永远',
      '已经', '正在', '将要', '曾经', '刚刚', '马上', '立刻', '突然', '慢慢', '快速', '迅速'
    ]);
  }

  /**
   * 分析文本并返回词频统计
   */
  analyzeText(text: string, options: AnalyzeOptions = {}): WordFrequency[] {
    const {
      minLength = 2,
      maxLength = 20,
      caseSensitive = false,
      includeNumbers = false,
      customStopWords = [],
      language = 'auto'
    } = options;

    // 检测语言
    const detectedLanguage = language === 'auto' ? this.detectLanguage(text) : language;
    
    // 分词
    const words = this.tokenize(text, detectedLanguage);
    
    // 过滤和清理
    const filteredWords = this.filterWords(words, {
      minLength,
      maxLength,
      caseSensitive,
      includeNumbers,
      customStopWords,
      language: detectedLanguage
    });
    
    // 统计词频
    return this.calculateFrequency(filteredWords);
  }

  /**
   * 检测文本语言
   */
  private detectLanguage(text: string): 'chinese' | 'english' | 'mixed' {
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const englishChars = text.match(/[a-zA-Z]/g) || [];
    
    const chineseRatio = chineseChars.length / text.length;
    const englishRatio = englishChars.length / text.length;
    
    if (chineseRatio > 0.3) {
      return englishRatio > 0.2 ? 'mixed' : 'chinese';
    } else if (englishRatio > 0.3) {
      return 'english';
    }
    
    return 'mixed';
  }

  /**
   * 分词
   */
  private tokenize(text: string, language: string): string[] {
    // 清理文本
    let cleanText = text
      .replace(/[\r\n\t]+/g, ' ') // 替换换行符和制表符
      .replace(/[""'']/g, '') // 移除引号
      .trim();

    if (language === 'chinese' || language === 'mixed') {
      return this.chineseTokenize(cleanText);
    } else {
      return this.englishTokenize(cleanText);
    }
  }

  /**
   * 中文分词（简单实现）
   */
  private chineseTokenize(text: string): string[] {
    const words: string[] = [];
    
    // 分离中文和英文
    const segments = text.split(/([\u4e00-\u9fff]+|[a-zA-Z]+|\d+)/g).filter(s => s.trim());
    
    for (const segment of segments) {
      if (/[\u4e00-\u9fff]/.test(segment)) {
        // 中文字符 - 简单按字符分割（实际应用中可使用jieba等分词库）
        words.push(...this.simplifyChineseSegment(segment));
      } else if (/[a-zA-Z]/.test(segment)) {
        // 英文单词
        words.push(segment.toLowerCase());
      } else if (/\d/.test(segment)) {
        // 数字
        words.push(segment);
      }
    }
    
    return words;
  }

  /**
   * 简化的中文分词（按词汇长度组合）
   */
  private simplifyChineseSegment(segment: string): string[] {
    const words: string[] = [];
    const chars = Array.from(segment);
    
    // 尝试2-4字词组合
    for (let i = 0; i < chars.length; i++) {
      // 单字
      words.push(chars[i]);
      
      // 双字词
      if (i < chars.length - 1) {
        words.push(chars[i] + chars[i + 1]);
      }
      
      // 三字词
      if (i < chars.length - 2) {
        words.push(chars[i] + chars[i + 1] + chars[i + 2]);
      }
      
      // 四字词
      if (i < chars.length - 3) {
        words.push(chars[i] + chars[i + 1] + chars[i + 2] + chars[i + 3]);
      }
    }
    
    return words;
  }

  /**
   * 英文分词
   */
  private englishTokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ') // 移除标点符号
      .split(/\s+/) // 按空格分割
      .filter(word => word.length > 0);
  }

  /**
   * 过滤词汇
   */
  private filterWords(words: string[], options: FilterOptions): string[] {
    const {
      minLength,
      maxLength,
      caseSensitive,
      includeNumbers,
      customStopWords,
      language
    } = options;

    const allStopWords = new Set([
      ...this.stopWords,
      ...this.chineseStopWords,
      ...customStopWords
    ]);

    return words.filter(word => {
      const processedWord = caseSensitive ? word : word.toLowerCase();
      
      // 长度检查
      if (processedWord.length < minLength || processedWord.length > maxLength) {
        return false;
      }
      
      // 数字检查
      if (!includeNumbers && /^\d+$/.test(processedWord)) {
        return false;
      }
      
      // 停用词检查
      if (allStopWords.has(processedWord)) {
        return false;
      }
      
      // 纯标点符号检查
      if (/^[^\w\u4e00-\u9fff]+$/.test(processedWord)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * 计算词频
   */
  private calculateFrequency(words: string[]): WordFrequency[] {
    const frequencyMap = new Map<string, number>();
    
    for (const word of words) {
      frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
    }
    
    return Array.from(frequencyMap.entries())
      .map(([word, frequency]) => ({ word, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
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

  /**
   * 添加自定义停用词
   */
  addStopWords(words: string[], language: 'english' | 'chinese' = 'english'): void {
    const targetSet = language === 'chinese' ? this.chineseStopWords : this.stopWords;
    words.forEach(word => targetSet.add(word.toLowerCase()));
  }

  /**
   * 移除停用词
   */
  removeStopWords(words: string[], language: 'english' | 'chinese' = 'english'): void {
    const targetSet = language === 'chinese' ? this.chineseStopWords : this.stopWords;
    words.forEach(word => targetSet.delete(word.toLowerCase()));
  }

  /**
   * 获取停用词列表
   */
  getStopWords(language: 'english' | 'chinese' = 'english'): string[] {
    const targetSet = language === 'chinese' ? this.chineseStopWords : this.stopWords;
    return Array.from(targetSet);
  }
}

// 分析选项接口
export interface AnalyzeOptions {
  minLength?: number;
  maxLength?: number;
  caseSensitive?: boolean;
  includeNumbers?: boolean;
  customStopWords?: string[];
  language?: 'auto' | 'chinese' | 'english' | 'mixed';
}

// 过滤选项接口
interface FilterOptions {
  minLength: number;
  maxLength: number;
  caseSensitive: boolean;
  includeNumbers: boolean;
  customStopWords: string[];
  language: string;
}