const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Trivia Game API',
    version: '1.0.0',
    description: 'API documentation for the Trivia Game platform - Educational word learning game',
    contact: {
      name: 'API Support',
      email: 'support@triviagame.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server'
    },
    {
      url: 'https://your-production-domain.com/api',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID'
          },
          name: {
            type: 'string',
            description: 'User name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email'
          },
          hasPaid: {
            type: 'boolean',
            description: 'Whether user has paid for premium access'
          },
          gamesPlayed: {
            type: 'number',
            description: 'Number of games played by user'
          }
        }
      },
      Question: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Question ID'
          },
          word: {
            type: 'string',
            description: 'Hebrew word to translate'
          },
          answers: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Array of 4 possible answers (shuffled)'
          },
          correctAnswer: {
            type: 'string',
            description: 'The correct answer'
          },
          ashkenaziAudioFile: {
            type: 'string',
            description: 'Path to Ashkenazi pronunciation audio file'
          },
          sephardiAudioFile: {
            type: 'string',
            description: 'Path to Sephardi pronunciation audio file'
          }
        }
      },
      Score: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Score record ID'
          },
          score: {
            type: 'number',
            description: 'Final game score'
          },
          rank: {
            type: 'number',
            description: 'Player rank compared to all players'
          },
          title: {
            type: 'string',
            description: 'Humorous title based on score'
          }
        }
      },
      Settings: {
        type: 'object',
        properties: {
          difficulty: {
            type: 'string',
            enum: ['fast', 'normal'],
            description: 'Game speed difficulty'
          },
          pronunciationType: {
            type: 'string',
            enum: ['ashkenazi', 'sephardi'],
            description: 'Preferred pronunciation type'
          },
          soundEnabled: {
            type: 'boolean',
            description: 'Whether sound effects are enabled'
          },
          vibrationEnabled: {
            type: 'boolean',
            description: 'Whether vibration is enabled'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object'
            },
            description: 'Detailed validation errors (if applicable)'
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
