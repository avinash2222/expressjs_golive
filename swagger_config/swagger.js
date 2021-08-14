import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  info: {
    title: 'Avinash Api',
    version: '3.0.0',
    description:'Avinash API',
    license: {
      name: 'Licensed Under Avinash',
      url: 'https://beta.avinash.com/',
    },
  },
  basePath: process.env.BASE_PATH,
}

const DisableAuthorizePlugin = function() {
  return {
    wrapComponents: {
      authorizeBtn: () => () => null,
    },
  }
}

const swaggerOptions = {
  swaggerOptions: {
    plugins: [
      DisableAuthorizePlugin,
    ],
    defaultModelsExpandDepth: -1,
  },
}

const options = {
  swaggerDefinition: swaggerDefinition,
  apis: [`${__dirname}/*.yaml`],
}

const swaggerSpec = swaggerJSDoc(options)

export {
  swaggerSpec,
  swaggerOptions,
}
