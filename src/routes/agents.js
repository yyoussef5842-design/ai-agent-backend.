import { Router } from 'express'
import { Agent } from '../models/Agent.js'

const router = Router()

// جلب الموظفين
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().lean()
    res.json(agents)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// إضافة موظف
router.post('/', async (req, res) => {
  try {
    const agent = await Agent.create(req.body)
    res.status(201).json(agent)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// تعديل موظف
router.put('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(agent)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// حذف موظف
router.delete('/:id', async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router
