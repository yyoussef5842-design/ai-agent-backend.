import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true, trim: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'EGP' },
  images: [String],
  category: { type: String, required: true },
  tags: [String],
  sku: String,
  features: [String],
  specifications: [{ key: String, value: String }],
  stock: { quantity: { type: Number, default: 0 }, trackInventory: { type: Boolean, default: true } },
  status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  salesCount: { type: Number, default: 0 },
  rating: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
}, { timestamps: true })

export const Product = mongoose.model('Product', productSchema)