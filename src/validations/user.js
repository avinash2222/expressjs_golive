//joi VALIDATION
import Joi from 'joi'

let roles = Joi.string().valid('ORG_USER', 'ORG_ADMIN', 'ADMIN', 'SUPER_ADMIN').required().label('Invalid userType role!')

/* userController Validation */
const userValidation = {
  updateUserValidation: Joi.object().keys({
    firstName: Joi.string().trim().allow('').optional().max(55).label('Invalid firstName!'),
    lastName: Joi.string().trim().allow('').optional().max(55).label('Invalid lastName!'),
    email: Joi.string().trim().email().lowercase().label('Invalid emailAddress!'),
    password: Joi.string().trim().allow('').optional().min(4).max(25).label('Invalid password!'),
    archived: Joi.bool().label('Invalid archived!'),
    isActive: Joi.bool().label('Invalid isActive!'),
    isVerified: Joi.bool().label('Invalid isVerified!'),
    isOnline: Joi.bool().label('Invalid isOnline!'),
    userRole: Joi.array().items(roles),
  }),
  signUpUserValidation: Joi.object().keys({
    firstName: Joi.string().trim().required().max(55).label('Invalid firstName!'),
    lastName: Joi.string().trim().required().max(55).label('Invalid lastName!'),
    email: Joi.string().trim().email().lowercase().required().label('Invalid emailAddress!'),
    password: Joi.string().trim().allow('').optional().min(4).max(25).label('Invalid password!'),
  }),

  loginValidation: Joi.object().keys({
    email: Joi.string().trim().required().email().lowercase().label('Invalid emailAddress!'),
    password: Joi.string().trim().required().min(4).max(25).label('Invalid password!'),
  }),

}

module.exports = {
  updateUserValidation : userValidation.updateUserValidation,
  loginValidation : userValidation.loginValidation,
  signUpUserValidation: userValidation.signUpUserValidation,
}
