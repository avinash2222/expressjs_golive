import { User, Tenant } from '../models/model'
import mongoose from 'mongoose'
import { generateToken, setToken } from '../security/auth'
import { sendConfirmationEmail, sendInviteEmail, sendForgotPasswordEmail } from './email-svc'
import _ from 'lodash'
import {handleSaveRecordError} from '../utils/generic_utils'
import { logger } from '../utils/logger'
import { generateHash } from '../utils/bcrypt-helper'
import { rollbacks } from 'npm'

// const userFields = ['firstName', 'lastName' ]

/* get all users */
export async function  getUsers(req, res){
  const {limit, skip, page} = req.pagination
  const filterTenantRecord = req.filterTenantRecord || {}

  try {
    let [users] = await User.aggregate([
      {$match: filterTenantRecord},
      {'$facet': {
        meta: [ { $count: 'total' }, { $addFields: { page: page } } ],
        data: [ { $skip: skip }, { $limit: limit } ], 
      }},
      {$project:  global.paginationProject},
    ])
    if (_.isEmpty(users['data'])) res.status(404).send({status: 'error', message: 'record not found!'}) 
    else res.status(201).send(users)
  } catch(err) {
    res.status(500).send({status: 'error', message: err})
  }
}

/** 
 * user login
 * @access public
 * @param {email} email - email id of the user
 * @param {password} password - password of the user
*/
export async function login(req, res){  
  try {
    let {email, password} = req.body
    let user = await User.findOne({email: email}) 
    if (!user) return res.status(404).send({status: 'error', message : "User doesn't exist"})
    if (_.isUndefined(user.password)) return res.status(422).send({status: 'failed', message: 'Please reset your password'})
    if (!user['isActive']) return res.status(403).send({status: 'error', message: 'Your account marked as inActive, Please contact support team'})
    if (user['archived']) return res.status(403).send({status: 'error', message: 'Your account marked as deactivated, Please contact support team'})
    
    await generateToken(user, password, function (err, result) {
      let {statusCode, status, message, accessToken, tenantId} = result || err
      if (err) res.status(statusCode).send({status, message, accessToken, tenantId}) 
      else res.status(statusCode).send({status, message, accessToken, tenantId})
    }) 
  } catch(error) {
    res.status(500).send({status: 'error', message: 'server error, please try after sometime!'})
  } 
}

export async function signup(req, res) {
  const session = await global.db.startSession()
  try {
    const { firstName, lastName, email } = req.body
    await session.withTransaction(async () => {
      let tenant = await Tenant.findOne({ name: new RegExp('^' + req.body.organizationName + '$', 'i') }).select('_id')
      if (!_.isNull(tenant)) return res.status(409).send({status: 'success', message: `tenant with the name ${req.body.organizationName} is already registered!`})
      let newTenant = new Tenant({ name:  req.body.organizationName})
      let { _id } = await newTenant.save({ session })

      let user = await User.findOne({ email: email }).select('_id')
      if (!_.isNull(user)) {
        res.status(409).send({status: 'success', message: `user with email: ${req.body.email} is already registered!`})
        return await session.abortTransaction()
      }
      const newUser = new User({ firstName, lastName, email, userRole: 'ORG_ADMIN', tenantId: _id })
      let savedUser = await newUser.save({ session })
      let token = setToken(savedUser)
      console.log(token)
      await sendConfirmationEmail(email, token)
      res.status(201).json({ status: 'success', message: 'Successfully created a new tenant, kindly verify your email to proceed' })
    })
    session.endSession()
  } catch (err) {
    res.status(500).send(await handleSaveRecordError(err))
  }
}

export async function verifyEmailAndSetPassword(req, res) {
  try {
    let {_id} = req.user
    let userFromDb = await User.findOne({ _id: _id })
    if (userFromDb.isVerified) return res.status(400).json({ status: 'Failure', message: 'Already verified user' })
    let hashedPassword = await generateHash(req.body.password)
    await User.findByIdAndUpdate({ _id : _id }, { $set: { password: hashedPassword, isVerified: true, isActive: true }},{})
    return res.status(200).json({ status: 'success', message:'Successfully updated the user', token: setToken(userFromDb) })
  } catch (err) {
    logger.info('Error while verifying the user')
    res.status(500).send({status: 'error', message: err.message})
  }
}

/** This API is used to add a new org user by an org admin */
export async function addOrgUser(req, res) {
  try {
    const { firstName, lastName, email, userRole } = req.body
    const newUser = new User({ firstName, lastName, email, userRole: userRole, tenantId: req.user.tenantId })
    let orgUser = await newUser.save()
    await sendInviteEmail(email, setToken(orgUser))
    return res.status(201).json({ status: 'success', message: `Successfully invited ${email} to Avinash`})
  } catch (err) {
    logger.info('Error while adding an orgs user')
    return res.status(500).send(await handleSaveRecordError(err))
  }
}

/** This API send's a reset password email to the user */
export async function requestForgotPasswordLink(req, res) {
  try {
    let { email } = req.body

    let userFromDb = await User.findOne({ email: email })
    if (!userFromDb) return res.status(404).json({ status: 'Error', message: 'User not found' })
    await sendForgotPasswordEmail(email, setToken(userFromDb))
    return res.status(200).json({ status: 'success', message: 'Kindly Check Your inbox for further steps'})
  } catch (err) {
    logger.info('Error while sending forgot password link')
    return res.status(500).send({status: 'error', message: err.message})
  }
}

/**
 *  This API updates the password of a given user
 *  This API can be used until the token expires, which is not a good thing
 *  TODO: Need to create a new feild in the dB which expires the link to update password
 */
export async function updatePassword(req, res) {
  try {
    let user = req.user
    let { password } = req.body

    let hashedPassword = await generateHash(password)
    await User.findOneAndUpdate({ _id: user._id }, { $set: { password: hashedPassword }})
    return res.status(200).json({ status: 'success', message: 'Updated the password of the user'})
  } catch (err) {
    logger.info(err)
    return res.status(500).send({status: 'error', message: err.message})
  }
}
