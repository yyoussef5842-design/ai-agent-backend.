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

// الربط بقاعدة البيانات
const dbUri = process.env.MONGODB_URI
mongoose.connect(dbUri).then(async () => {
    console.log('✅ MongoDB Connected')
    const count = await Agent.countDocuments()
    if (count === 0) {
      await Agent.create([{ name: 'أحمد', avatar: '🤖', specialty: 'مبيعات', personality: 'friendly', isActive: true }])
    }
}).catch(e => console.error('❌ DB Error:', e.message))

// مسارات مفتوحة 100%
app.use('/api/agents', agentRoutes)
app.use('/api/chat', chatRoutes)
app.get('/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, '0.0.0.0', () => console.log(`🚀 MASTER SERVER LIVE`))
export const aiService = new AIService()
