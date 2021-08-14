//joi VALIDATION
import Joi from 'joi'

/* connectorController Validation */
const connectorValidation = {
  updateConnectorValidation: Joi.object().keys({
    appName: Joi.string().trim().required().max(55).label('Invalid appName!'),
    tenantId: Joi.string().trim().required().max(55).label('Invalid tenantId!'),
    url: Joi.string().trim().lowercase().label('Invalid url!'),
    apiKey: Joi.string().trim().min(4).max(25).label('Invalid apiKey!'),
    isAppIntigrated: Joi.bool().label('Invalid isAppIntigrated!'),
  }),

  connectorValidation: Joi.object().keys({
    url: Joi.string().trim().required().lowercase().label('Invalid url!'),
    apiKey: Joi.string().trim().required().min(4).max(25).label('Invalid apiKey!'),
  }),

}

module.exports = {
  updateConnectorValidation : connectorValidation.updateConnectorValidation,
  connectorValidation : connectorValidation.connectorValidation,
}
