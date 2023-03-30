import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { urlencoded, json } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  if (process.env.NODE_ENV == 'development') {
    const config = new DocumentBuilder()
      .setTitle('All Company Bank Microservice')
      .setDescription(
        `API service for Member,Mobile App UNICORN AUTO,Rico : BASE URL = ${process.env.APP_URL}`,
      )
      .setVersion('1.0')
      .addTag('Rico CRUD')
      .addTag('Mobile App UNICORN')
      .addTag('Member')
      .addTag('Rico Dashboard')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('bible', app, document);
  }
  process.env.TZ = 'Asia/Bangkok';
  app.use(json({ limit: '250mb' }));
  app.use(urlencoded({ extended: true, limit: '250mb' }));
  const setTZ = require('set-tz');
  setTZ('Asia/Bangkok');

  await app.listen(5150);
}

bootstrap();
//npm install --save @nestjs/jwt passport-jwt
//npm install --save-dev @types/passport-jwt
//npm install --save @nestjs/passport
