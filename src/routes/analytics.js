import { Router } from 'express'
import { Conversation } from '../models/Conversation.js'
import { Agent } from '../models/Agent.js'

const router = Router()

router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      activeConversations,
      totalCustomers,
      todaySales,
      resolvedIssues,
      hourlyActivity,
      agents
    ] = await Promise.all([
      Conversation.countDocuments({ company: req.companyId, status: 'active' }),
      Conversation.distinct('customer.id', { company: req.companyId }).then(arr => arr.length),
      Conversation.countDocuments({ company: req.companyId, 'sales.status': 'confirmed', updatedAt: { $gte: today } }),
      Conversation.countDocuments({ company: req.companyId, status: 'resolved', updatedAt: { $gte: today } }),
      Conversation.aggregate([
        { $match: { company: req.companyId, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Agent.find({ company: req.companyId })
    ])

    res.json({
      activeConversations,
      totalCustomers,
      todaySales,
      resolvedIssues,
      hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        conversations: hourlyActivity.find(h => h._id === i)?.count || 0
      })),
      agents: agents.map(a => ({
        id: a._id,
        name: a.name,
        avatar: a.avatar,
        totalChats: a.intelligence.totalConversations,
        satisfaction: a.intelligence.customerSatisfaction
      }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router