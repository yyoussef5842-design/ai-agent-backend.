import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { logger } from '../utils/logger.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Access denied' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user || !user.isActive) return res.status(401).json({ error: 'User not found' })

    req.user = user
    req.companyId = decoded.companyId
    next()
  } catch (error) {
    logger.error('Auth error:', error.message)
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' })
  next()
}