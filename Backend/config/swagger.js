import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReadHub API',
      version: '1.0.0',
      description: 'API documentation for ReadHub backend',
    },
    servers: [
      {
        url: 'https://readhub-study.onrender.com',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication related endpoints',
      },
      {
        name: 'User',
        description: 'Endpoints for user profile management',
      },
      {
        name: 'Books',
        description: 'Endpoints for book management',
      },
      {
        name: 'Notes',
        description: 'Endpoints for note management',
      },
    ],
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // path to your route files
}

const swaggerSpec = swaggerJSDoc(options)

export default swaggerSpec
