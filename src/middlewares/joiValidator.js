
export const joi = (schema, property) => {
  return async (req, res, next) => {
    try { 
      const { error } = schema.validate(req[property], { stripUnknown: { objects: true } , abortEarly: false})
      const valid = error == null
      if (valid) next()
      else {
        const { details } = error
        const message = details.map(i => i.context.label).join(',')
        res.status(422).send({success: false, message: message, statusCode: 422})
      }
    } catch (error) {
      next(error)
    }
  }
}

