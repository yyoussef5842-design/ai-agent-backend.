import { Router } from 'express'
import crypto from 'crypto'

export default function webhookRoutes(services) {
  const router = Router()

  // WhatsApp verification
  router.get('/whatsapp', (req, res) => {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  })

  // WhatsApp messages
  router.post('/whatsapp', async (req, res) => {
    res.sendStatus(200)
    try {
      const body = req.body
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value?.messages) {
            for (const message of change.value.messages) {
              await services.whatsapp.handleIncomingMessage({
                from: message.from,
                text: message.text,
                timestamp: message.timestamp,
                id: message.id
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('WhatsApp webhook error:', error.message)
    }
  })

  // Telegram webhook
  router.post('/telegram/:token', async (req, res) => {
    res.sendStatus(200)
    // Handled by polling in TelegramService
  })

  return router
}