//joi VALIDATION
import Joi from 'joi'

/* userController Validation */
const tenantValidation = {
  
  signupValidation: Joi.object().keys({
    organizationName: Joi.string().trim().required().lowercase().label('Invalid organization name!'),
  }),

}

module.exports = {
  tenantSignUpValidation : tenantValidation.signupValidation,
}
