import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Agent } from './models/Agent.js'
import { AIService } from './services/ai.js'
import agentRoutes from './routes/agents.js'
import chatRoutes from './routes/chat.js'

dotenv.config()
const app = express()
const httpServer = createServer(app)

app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// الربط بقاعدة البيانات (حتى لو فشل السيرفر مش هيقف)
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-customer-service'
mongoose.connect(dbUri).then(async () => {
    console.log('✅ MongoDB Connected')
    const count = await Agent.countDocuments()
    if (count === 0) {
      await Agent.create([{ name: 'أحمد', avatar: '🤖', specialty: 'دعم ومبيعات', personality: 'friendly', isActive: true }])
    }
}).catch(e => console.error('❌ DB Error:', e.message))

// مسارات مفتوحة تماماً للتجربة
app.use('/api/agents', agentRoutes)
app.use('/api/chat', chatRoutes)
app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, '0.0.0.0', () => console.log(`🚀 SERVER LIVE`))
export const aiService = new AIService()
