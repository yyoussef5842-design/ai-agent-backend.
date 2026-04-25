import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'manager', 'agent'], default: 'admin' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  preferences: {
    language: { type: String, default: 'ar' },
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model('User', userSchema)