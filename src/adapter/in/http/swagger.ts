import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'shop API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // JSDoc 주석은 실행 방식(tsx/node)과 무관하게 파일 텍스트를 그대로 읽어서 파싱하므로
  // .ts 소스 경로를 그대로 가리키면 된다.
  apis: ['./src/adapter/in/http/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
