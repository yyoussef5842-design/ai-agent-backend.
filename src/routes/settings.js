import { Router } from 'express'
import { Company } from '../models/Company.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const company = await Company.findById(req.companyId)
    res.json(company?.settings || {})
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.companyId,
      { $set: { settings: req.body } },
      { new: true }
    )
    res.json(company.settings)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router