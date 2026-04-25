import TelegramBot from 'node-telegram-bot-api'
import { logger } from '../utils/logger.js'

export class TelegramService {
  constructor(io, aiService) {
    this.io = io
    this.aiService = aiService
    this.bot = null
  }

  initialize() {
    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN.trim() === '') {
      logger.info('Telegram bot token not configured, skipping...')
      return
    }

    try {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

      this.bot.on('message', async (msg) => {
        logger.info(`Telegram from ${msg.from.id}: ${msg.text}`)
        
        this.io.emit('telegram:message', {
          from: msg.from.id,
          text: msg.text,
          username: msg.from.username,
          timestamp: new Date()
        })

        try {
          const aiResponse = await this.aiService.generateResponse({
            messages: [{ role: 'user', content: msg.text }],
            systemPrompt: 'You are a helpful customer service agent. Reply in Arabic.'
          })

          this.bot.sendMessage(msg.chat.id, aiResponse.text)
        } catch (error) {
          logger.error('Telegram AI reply error:', error.message)
        }
      })

      this.bot.on('polling_error', (error) => {
        logger.error('Telegram polling error:', error.message)
      })

      logger.info('Telegram bot initialized')
    } catch (err) {
      logger.error('Telegram init failed:', err.message)
    }
  }
}