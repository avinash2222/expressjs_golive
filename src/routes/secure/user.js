import { getUsers, verifyEmailAndSetPassword, addOrgUser, updatePassword } from '../../services/user'
import {grantAccess} from '../../security/auth'

const routes = (app) => {
  app
    .route(`${process.env.BASE_PATH}/users`)
    .get(grantAccess('readAny', 'user'), getUsers)
  app
    .route(`${process.env.BASE_PATH}/users/verifyEmailAndSetPassword`)
    .patch(verifyEmailAndSetPassword)
  app
    .route(`${process.env.BASE_PATH}/users/addNewOrgUser`)
    .post(grantAccess('createAny', 'user'), addOrgUser)
  app
    .route(`${process.env.BASE_PATH}/users/updatePassword`)
    .post(updatePassword)
}

export default routes
