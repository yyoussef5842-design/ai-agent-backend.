import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { Company } from '../models/Company.js'

const router = Router()

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
  body('companyName').trim().isLength({ min: 2 })
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { email, password, name, companyName } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(409).json({ error: 'Email already registered' })

    const company = await Company.create({
      name: companyName,
      slug: companyName.toLowerCase().replace(/\s+/g, '-')
    })

    const user = await User.create({ email, password, name, company: company._id })

    const token = jwt.sign(
      { id: user._id, companyId: company._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      company: { id: company._id, name: company.name, slug: company.slug }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.isActive) return res.status(401).json({ error: 'Account deactivated' })

    user.lastLogin = new Date()
    await user.save()

    const token = jwt.sign(
      { id: user._id, companyId: user.company, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router