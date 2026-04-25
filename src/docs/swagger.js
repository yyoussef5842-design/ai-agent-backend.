import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Customer Service API',
      version: '1.0.0',
      description: 'API for AI-powered customer service platform'
    },
    servers: [
      { url: 'https://api.yourdomain.com/api', description: 'Production' },
      { url: 'http://localhost:5000/api', description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
}

export const specs = swaggerJsdoc(options)