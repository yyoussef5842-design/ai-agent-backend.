import { Router } from 'express'
import { Company } from '../models/Company.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const company = await Company.findById(req.companyId)
    res.json(company?.integrations || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/:platform/connect', async (req, res) => {
  try {
    const { platform } = req.params
    const { config } = req.body

    const updatePath = `integrations.${platform}`
    const company = await Company.findByIdAndUpdate(
      req.companyId,
      { $set: { [`${updatePath}.enabled`]: true, [`${updatePath}...config`]: config } },
      { new: true }
    )

    res.json({ success: true, platform, status: 'connected' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router