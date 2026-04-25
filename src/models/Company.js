import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  logo: String,
  plan: { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
  subscription: {
    status: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled'], default: 'active' },
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  settings: {
    maxAgents: { type: Number, default: 3 },
    aiModel: { type: String, default: 'gpt-4-turbo-preview' },
    welcomeMessage: { type: String, default: 'أهلاً بيك! إزاي أقدر أساعدك؟' }
  },
  integrations: {
    whatsapp: { enabled: { type: Boolean, default: false }, phoneNumberId: String, accessToken: String },
    telegram: { enabled: { type: Boolean, default: false }, botToken: String },
    facebook: { enabled: { type: Boolean, default: false }, pageAccessToken: String }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

export const Company = mongoose.model('Company', companySchema)