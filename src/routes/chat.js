import { Router } from 'express'
import { aiService } from '../index.js'
import { Agent } from '../models/Agent.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { message, agentId } = req.body
    const agent = await Agent.findById(agentId)

    const aiResponse = await aiService.generateResponse({
      messages: [{ role: 'user', content: message }],
      systemPrompt: `You are ${agent?.name || 'AI'}. Reply in Egyptian Arabic.`
    })

    res.json({ aiResponse: aiResponse.text })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
