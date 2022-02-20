import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; //npm install --save @nestjs/config
import * as redisStore from 'cache-manager-redis-store';
import { TypeOrmModule } from '@nestjs/typeorm'; //npm install --save @nestjs/typeorm typeorm mysql
import { SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { WebsiteModule } from './Website/website.module';
import { Website } from "src/Entity/website.entity";
import { Members } from './Member/member.entiry';
import { MemberModule } from './Member/member.module';
@Module({ 
  
  imports: [
   
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_SERVER,
      port: process.env.REDIS_PORT,
      password:process.env.REDIS_PASSWORD,
      ttl:null,
      db:7
    }),
    ConfigModule.forRoot({
      isGlobal:true,
      // load:[ormConfig],
    }),
    TypeOrmModule.forRootAsync({
      name:'default',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
    
        type: 'cockroachdb',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities:[Members], 
        synchronize: true,
        ssl: {
          rejectUnauthorized:false
          // ca: atob(process.env.CROCK_DB_CERT),
        },
      }),
      inject: [ConfigService],
    }),

 
    TypeOrmModule.forRootAsync({
      name:'support',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
      
        type: 'cockroachdb',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_SUPPORT,
        entities: [Website],
        synchronize: false,
        ssl: {
          rejectUnauthorized:false
          // ca: atob(process.env.CROCK_DB_CERT),
        },
      }),
      inject: [ConfigService],
      
    }),
   
    
    SwaggerModule,
   WebsiteModule,
    MemberModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}

//npm install bcrypt
//npm install --save-dev @types/bcrypt