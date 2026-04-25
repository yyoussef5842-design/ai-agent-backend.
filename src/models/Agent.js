import mongoose from 'mongoose'

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, default: '🤖' },
  specialty: { type: String, default: 'موظف ذكي' },
  personality: { type: String, default: 'friendly' },
  isActive: { type: Boolean, default: true },
  systemPrompt: { type: String, default: '' },
  searchEnabled: { type: Boolean, default: true }
}, { timestamps: true })

export const Agent = mongoose.model('Agent', agentSchema)
