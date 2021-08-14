import {joi} from '../../middlewares/joiValidator'
import {loginValidation, signUpUserValidation} from '../../validations/user'
import {tenantSignUpValidation} from '../../validations/tenant'
import { login, signup, requestForgotPasswordLink } from '../../services/user'

const routes = (app) => {
  app
    .route(`${process.env.BASE_PATH}/users/login`) 
    .post(joi(loginValidation, 'body'), login)
  app
    .route(`${process.env.BASE_PATH}/signup`)
    .post(joi(tenantSignUpValidation, 'body'), joi(signUpUserValidation, 'body'), signup)
  app
    .route(`${process.env.BASE_PATH}/users/forgotPassword`)
    .post(requestForgotPasswordLink)
}

export default routes

