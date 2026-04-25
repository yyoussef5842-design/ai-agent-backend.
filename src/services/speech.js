import OpenAI from 'openai'
import { logger } from '../utils/logger.js'

export class SpeechService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  async speechToText(audioBuffer, options = {}) {
    try {
      const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' })
      
      const response = await this.openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: options.language === 'ar' ? 'ar' : 'en'
      })

      return { text: response.text, language: response.language }
    } catch (error) {
      logger.error('Speech-to-text error:', error.message)
      throw new Error('Failed to transcribe audio')
    }
  }

  async textToSpeech(text, options = {}) {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: options.voice || 'alloy',
        input: text,
        speed: options.speed || 1.0
      })

      const buffer = Buffer.from(await response.arrayBuffer())
      return { audio: buffer, format: 'mp3' }
    } catch (error) {
      logger.error('Text-to-speech error:', error.message)
      throw new Error('Failed to generate speech')
    }
  }
}