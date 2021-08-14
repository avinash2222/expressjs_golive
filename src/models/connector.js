import mongoose from 'mongoose'
import { generateHash } from '../utils/bcrypt-helper'
const opts = { timestamps: { currentTime: () => Math.round(new Date().getTime()) }}

const ConnectorSchema = mongoose.Schema({
  appName: { type: String, required: true, trim: true },
  appLogo: { type: String, required: true, unique: true, trim: true },
  tenantId: { type: mongoose.Types.ObjectId, ref: 'Tenant', required: true, sparse: true, trim: true },
  url: { type: String, required: true, unique: true, trim: true },
  apiKey: { type: String, required: true, unique: true, trim: true },
  isAppIntigrated: { type: Boolean, default: false },
  createdAt: Number,
  updatedAt: Number,
}, opts)

ConnectorSchema.pre('save', async function(next) {
  let connector = this 
  if (!connector.isModified('apiKey')) return next()
  connector.apiKey = await generateHash(connector.apiKey)
  connector.isAppIntigrated = true
  next()
})


module.exports = ConnectorSchema
