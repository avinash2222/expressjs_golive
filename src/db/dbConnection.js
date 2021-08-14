import mongoose from 'mongoose'
import Promise from 'bluebird'
import { logger } from '../utils/logger'

const mongoOptions = {
  promiseLibrary: Promise,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: true,
  poolSize: 10,
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  user: process.env.DB_USER_NAME,
  pass: process.env.DB_PASS,
  dbName: process.env.DB_NAME,
  retryWrites:false,
  keepAlive: true,
}

export async function initClientDbConnection () {
  mongoose.Promise = global.Promise
  mongoose.connect(process.env.DB_URL, mongoOptions)
  global.db = mongoose.connection

  global.db.on('open', () => {
    logger.info(`Mongoose connection open to DB_URL: ${JSON.stringify(process.env.DB_URL)}`)
  })
  global.db.on('error', (err) => {
    logger.info(`Mongoose connection error: ${err} with connection info ${JSON.stringify(process.env.MONGODB_URL)}`)
    process.exit(0)
  })
  global.db.on('connected', function () {
    logger.info(`MongoDB :: connected to DB_NAME: ${this.name}`)
  })
  global.db.on('disconnected', function () {
    logger.info(`MongoDB :: disconnected ${this.name}`)
  })
  global.db.on('close', function () {
    logger.info(`MongoDB :: close ${this.name}`)
  })
  global.db.on('reconnected', function () {
    logger.info(`MongoDB :: reconnected ${this.name}`)
  })
  return global.db
}
