require('dotenv').config()
import './env'
import { initClientDbConnection } from './src/db/dbConnection'
import express from 'express'
import cors from 'cors'
import {swaggerSpec,swaggerOptions} from './swagger_config/swagger'
import swaggerUi from 'swagger-ui-express'
import path from 'path'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { logger } from './src/utils/logger'
import {pagination} from './src/helpers/pagination'
import {authenticate} from './src/security/auth'
import {filterTenantRecord} from './src/security/roles'
import userSecureRoute from './src/routes/secure/user'
import connectorSecureRoute from './src/routes/secure/connector'
import userUnSecureRoute from './src/routes/unsecure/user'
import listEndpoints from 'express-list-endpoints'
import morgan from 'morgan'

mongoose.set('useCreateIndex', true)
const app = express()
const PORT = process.env.PORT || 8080

// general config
app.set('views', path.join(__dirname, './src/views'))
app.set('view engine', 'ejs')

/** API logger */
app.use(morgan('dev'))

const corsOptions = {
  credentials: true, origin:(origin, callback)=> {
    callback(null, true)
  },
}

/*API swagger documentation*/
app.use(`${process.env.BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec,swaggerOptions))

// Direct express to use helmet to enable simple security settings
app.use(helmet())
app.use(cors(corsOptions))
app.enable('trust proxy')
app.set('trust proxy', 1)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Accept, Authorization, Content-Type, Access-Control-Request-Method,Access-Control-Allow-Origin, Access-Control-Allow-Headers, Accept,x-auth-token, mix-panel',
  )
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    res.status(200).send({ success: true })
  } else next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json({ limit: '10kb' }))
app.use(pagination)

/* GET home page. */
app.get('/', function(req, res){
  res.render('index.ejs')
})

/* to retrieve a list of the passed router */
app.get(process.env.BASE_PATH + '/exposed', function (req, res) {
  res.status(200).send(listEndpoints(app))
})


/* Initializing the database connection */
global.clientConnection =  initClientDbConnection()

userUnSecureRoute(app)


/* route require authentication */
app.use(authenticate)
app.use(filterTenantRecord)
userSecureRoute(app)
connectorSecureRoute(app)

// Error handler at global level
app.use(function (error, req, res, next) {
  logger.error('Something went wrong : ', error)
  res.status(error.status ? error.status : 500).send(error.message ? error.message: error)
  next(error)
})

module.exports = app.listen(PORT, () => {
  logger.info(`Node_ENV : ${process.env.NODE_ENV}`)
  logger.info(`Server is running on port ${PORT}`)
})


