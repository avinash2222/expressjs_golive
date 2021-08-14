
import mongoose from 'mongoose'

/* handle duplicate field in model*/
async function handleDuplicateError (err) {
  if (err.name === 'MongoError' && err.code === 11000) return true
  else return false
}

/* handle objectId cast error*/
async function handleObjectIdCastError (err) {
  if (err.name == 'ValidationError') return true
  else return false
}

/* handle error during saving record in DB*/
export async function handleSaveRecordError(err){
  if (await handleDuplicateError(err)) return {status: 'error', message: `There was a duplicate key error, ${err}`}
  if (await handleObjectIdCastError(err)) return {status: 'error', message: err.message}
  return {status: 'error', message: 'Some unknown server error occured!'}
}

/* 
this function to check for valid objectId to avoid cost error
return true if objectId is valid else return false
*/
export async function checkForValidObjectId(params) {
  return mongoose.Types.ObjectId.isValid(params)
}
