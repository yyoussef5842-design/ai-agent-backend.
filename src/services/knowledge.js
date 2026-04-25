import pdf from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'
import { logger } from '../utils/logger.js'

export class KnowledgeService {
  async extractText(file) {
    const { buffer, mimetype } = file

    try {
      if (mimetype === 'application/pdf') {
        const data = await pdf(buffer)
        return data.text
      } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const data = await mammoth.extractRawText({ buffer })
        return data.value
      } else if (mimetype === 'text/plain') {
        return buffer.toString('utf8')
      }
      throw new Error('Unsupported file type')
    } catch (error) {
      logger.error('Text extraction error:', error.message)
      throw error
    }
  }

  // بسيطة لتقطيع النص لأجزاء صغيرة (Chunks) عشان الـ AI يستوعبها
  chunkText(text, size = 1000) {
    const chunks = []
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.substring(i, i + size))
    }
    return chunks
  }
}

export const knowledgeService = new KnowledgeService()