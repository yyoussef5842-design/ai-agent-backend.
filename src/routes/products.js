import { Router } from 'express'
import { Product } from '../models/Product.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ company: req.companyId, status: 'active' })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const product = await Product.create({ company: req.companyId, ...req.body })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, company: req.companyId },
      req.body,
      { new: true }
    )
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router