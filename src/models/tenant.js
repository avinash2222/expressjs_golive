import mongoose from 'mongoose'
const opts = { timestamps: { currentTime: () => Math.round(new Date().getTime()) }}

const TenantSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: false },
  key: { type: String },
  archived: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number,
}, opts)

module.exports = TenantSchema
