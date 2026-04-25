import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot', 'human'], required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  timestamp: { type: Date, default: Date.now },
  emotion: { score: Number, label: String },
  intent: { type: String, enum: ['greeting', 'sales', 'support', 'complaint', 'other'] }
}, { _id: false })

const conversationSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  customer: {
    id: { type: String, required: true },
    name: String,
    phone: String,
    platform: { type: String, enum: ['web', 'whatsapp', 'facebook', 'telegram', 'slack'], required: true },
    platformUserId: String
  },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  status: { type: String, enum: ['active', 'waiting', 'resolved', 'escalated', 'closed'], default: 'active' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  messages: [messageSchema],
  topic: String,
  tags: [String],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  customerSatisfaction: { rating: { type: Number, min: 1, max: 5 }, feedback: String }
}, { timestamps: true })

conversationSchema.index({ company: 1, status: 1 })
conversationSchema.index({ 'customer.platform': 1, 'customer.platformUserId': 1 })

export const Conversation = mongoose.model('Conversation', conversationSchema)