import axios from 'axios'
import { logger } from '../utils/logger.js'

export class SearchService {
  constructor() {
    this.apiKey = process.env.SERPER_API_KEY
  }

  async search(query) {
    if (!this.apiKey) {
      logger.warn('Serper API key missing, skipping web search')
      return 'عذراً، خاصية البحث أونلاين غير مفعلة حالياً.'
    }

    try {
      const response = await axios.post('https://google.serper.dev/search',
        { q: query, gl: 'eg', hl: 'ar' },
        { headers: { 'X-API-KEY': this.apiKey, 'Content-Type': 'application/json' } }
      )

      // استخراج أهم النتائج والملخص
      const results = response.data.organic.slice(0, 3).map(res => `- ${res.title}: ${res.snippet}`).join('\n')
      const answer = response.data.answerBox?.answer || response.data.answerBox?.snippet || ''

      return `نتائج البحث عن "${query}":\n${answer}\n\nتفاصيل إضافية:\n${results}`
    } catch (error) {
      logger.error('Search API error:', error.message)
      return 'فشل الاتصال بمحرك البحث.'
    }
  }
}

export const searchService = new SearchService()