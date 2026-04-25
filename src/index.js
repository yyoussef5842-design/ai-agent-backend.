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

// 1. فتح كل الأبواب (No Security barriers for now)
app.use(cors({ origin: '*', credentials: true }))
app.use(express.json())

// 2. الربط بقاعدة البيانات مع بناء الموظفين تلقائياً
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-customer-service')
  .then(async () => {
    console.log('✅ MongoDB Connected')
    const count = await Agent.countDocuments()
    if (count === 0) {
      console.log('🌱 Database is empty, seeding default agents...')
      await Agent.create([
        { name: 'أحمد', avatar: '🤖', specialty: 'دعم فني ومبيعات', personality: 'friendly', isActive: true },
        { name: 'سارة', avatar: '👩‍💼', specialty: 'خدمة عملاء', personality: 'professional', isActive: true }
      ])
      console.log('✅ Default agents created!')
    }
  })

// 3. المسارات (Routes) مبسطة جداً وبدون Auth
app.use('/api/agents', agentRoutes)
app.use('/api/chat', chatRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// 4. تشغيل السيرفر على كل الشبكات
const PORT = 5000
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI SERVER V2.0 IS LIVE ON: http://192.168.8.5:${PORT}`)
})

export const aiService = new AIService()
