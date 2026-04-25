import axios from 'axios'
import { logger } from '../utils/logger.js'

export class WhatsAppService {
  constructor(io, aiService) {
    this.io = io
    this.aiService = aiService
    this.baseUrl = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION || 'v18.0'}`
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  }

  initialize() {
    if (!this.accessToken || !this.phoneNumberId) {
      logger.info('WhatsApp not configured, skipping...')
      return
    }
    logger.info('WhatsApp service initialized')
  }

  async sendMessage(to, message, options = {}) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: { body: message, preview_url: false }
      }

      if (options.type === 'template') {
        payload.type = 'template'
        payload.template = { name: options.templateName, language: { code: options.language || 'ar' } }
      }

      const response = await axios.post(`${this.baseUrl}/${this.phoneNumberId}/messages`, payload, {
        headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' }
      })

      logger.info(`WhatsApp sent to ${to}`)
      return response.data
    } catch (error) {
      logger.error('WhatsApp error:', error.response?.data || error.message)
      throw error
    }
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/\D/g, '')
    if (!cleaned.startsWith('2') && cleaned.length === 10) cleaned = '2' + cleaned
    return cleaned
  }

  async handleIncomingMessage(data) {
    const { from, text, timestamp, id } = data
    logger.info(`WhatsApp from ${from}: ${text?.body || ''}`)
    this.io.emit('whatsapp:message', { from, text: text?.body, timestamp, messageId: id })
  }
}