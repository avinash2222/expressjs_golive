import { Connector, Tenant } from '../models/model'
import _ from 'lodash'
import {handleSaveRecordError} from '../utils/generic_utils'
import { logger } from '../utils/logger'
import {ObjectId} from 'mongodb'

const ConnectorFields = ['appLogo', 'appName', 'url', 'apiKey']

/** This API is used to add a new org connector by an org admin */
export async function createConnector(req, res) {
  try {
    let fieldsToUpdate = _.pick(req.body, ConnectorFields)
    const newConnector = new Connector(fieldsToUpdate)
    newConnector.tenantId = ObjectId(req.user.tenantId)
    let result = await newConnector.save()
    return res.status(201).send(result)
  } catch (err) {
    logger.info(err)
    return res.status(500).send(await handleSaveRecordError(err))
  }
}

/* get all connectors */
export async function  getConnectors(req, res){
  const {limit, skip, page} = req.pagination
  const filterTenantRecord = req.filterTenantRecord || {}

  try {
    let [connectors] = await Connector.aggregate([
      {$match: filterTenantRecord},
      {'$facet': {
        meta: [ { $count: 'total' }, { $addFields: { page: page } } ],
        data: [ { $skip: skip }, { $limit: limit } ], 
      }},
      {$project:  global.paginationProject},
    ])
    if (_.isEmpty(connectors['data'])) res.status(404).send({status: 'error', message: 'record not found!'}) 
    else res.status(201).send(connectors)
  } catch(err) {
    res.status(500).send({status: 'error', message: err})
  }
}

export async function updateConnector(req, res) {
  try {
    const fieldsToUpdate = _.pick(req.body, ConnectorFields)
    let isUpdated = await Connector.findOneAndUpdate({ _id: req.params._id }, { $set: fieldsToUpdate}, {new: true})
    if (_.isNull(isUpdated)) return res.status(422).json({ status: 'error', message: 'unable to update, please check Id'})
    res.status(200).json({ status: 'success', message: 'Updated the password of the connector'})
  } catch (err) {
    logger.info(err)
    return res.status(500).send({status: 'error', message: err.message})
  }
}

export async function deleteConnector(req, res) {
  try {
    const result = await Connector.findOneAndDelete({_id: req.params._id})
    if (_.isNull(result)) return res.status(422).json({ status: 'error', message: 'unable to delete'})
    res.status(201).json({ status: 'success', message: 'Successfully removed connector credentails' })
  } catch (err) {
    res.status(500).send(await handleSaveRecordError(err))
  }
}
