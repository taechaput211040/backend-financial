import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  if(process.env.NODE_ENV == 'development'){
  const config = new DocumentBuilder()
  .setTitle('All Company Bank Microservice')
  .setDescription(`API service for Member,Mobile App UNICORN AUTO,Rico : BASE URL = ${process.env.APP_URL }`)
  .setVersion('1.0')
  .addTag('Rico CRUD')
  .addTag('Mobile App UNICORN') 
  .addTag('Member')
  .addTag('Rico Dashboard')
  .build(); 
  const document = SwaggerModule.createDocument(app, config); 
  SwaggerModule.setup('api', app, document);
} 
  process.env.TZ = 'Asia/Bangkok'

const setTZ = require('set-tz')
setTZ('Asia/Bangkok')
  
  
  await app.listen(5150); 
} 
bootstrap();  
//npm install --save @nestjs/jwt passport-jwt 
//npm install --save-dev @types/passport-jwt
//npm install --save @nestjs/passport 