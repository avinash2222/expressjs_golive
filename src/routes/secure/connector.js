import { createConnector, getConnectors, updateConnector, deleteConnector } from '../../services/connector'
import {grantAccess} from '../../security/auth'

const routes = (app) => {
  app
    .route(`${process.env.BASE_PATH}/connector`)
    .get(grantAccess('readAny', 'connector'), getConnectors)
  app
    .route(`${process.env.BASE_PATH}/connector/:_id`)
    .put(grantAccess('updateAny', 'connector'), updateConnector)
  app
    .route(`${process.env.BASE_PATH}/connector`)
    .post(grantAccess('createAny', 'connector'), createConnector)
  app
    .route(`${process.env.BASE_PATH}/connector/:_id`)
    .delete(grantAccess('deleteAny', 'connector'), deleteConnector)
}

export default routes
