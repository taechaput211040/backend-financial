import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/orm.config';
import { ConfigModule, ConfigService } from '@nestjs/config'; //npm install --save @nestjs/config
import * as redisStore from 'cache-manager-redis-store';
import { TypeOrmModule } from '@nestjs/typeorm'; //npm install --save @nestjs/typeorm typeorm mysql
import ormConfigProd from './config/orm.config.prod';
import { SwaggerModule } from '@nestjs/swagger';
import { SettingModule } from './Setting/setting.module';
import { AuthModule } from './auth/auth.module';
import { WebsiteModule } from './Website/website.module';
import { TopupRefModule } from './Topupref/topupref.module';
import { ProviderBOModule } from './provider_bo/provider_bo.module';
import { NotifyModule } from './LineNotify/notify.module';
import { DepositNotify } from "src/Entity/deposit.notify.entity";
import { Notify } from "src/Entity/notify.entity";
import { ProviderBO } from "src/Entity/provider.bo.entity";
import { RegisterNotify } from "src/Entity/register.notify.entity";
import { TopupRef } from "src/Entity/topup.ref.entity";
import { User } from "src/Entity/User.entity";
import { Website } from "src/Entity/website.entity";
import { WithdrawNotify } from "src/Entity/withdraw.notify.entity";
import { GatewayModule } from './Gateway/gateway.module';
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
      db:4
    }),
    ConfigModule.forRoot({
      isGlobal:true,
      // load:[ormConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'cockroachdb',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities:[Website,User,TopupRef,ProviderBO,Notify,DepositNotify,WithdrawNotify,RegisterNotify,Members], 
        synchronize: true,
        ssl: {
          rejectUnauthorized:false
          // ca: atob(process.env.CROCK_DB_CERT),
        },
      }),
      inject: [ConfigService],
    }),

 
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: process.env.MYSQL_DB_HOST,
    //     port: Number(process.env.MYSQL_DB_PORT),
    //     username: process.env.MYSQL_DB_USER,
    //     password: process.env.MYSQL_DB_PASSWORD,
    //     database: process.env.MYSQL_DB_NAME,
    //     entities: [Members],
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    //   name:'Rico_DB'
    // }),
    WebsiteModule,
    ProviderBOModule,
    TopupRefModule,
    SwaggerModule,
    AuthModule,
    NotifyModule,
    GatewayModule,
    MemberModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}

//npm install bcrypt
//npm install --save-dev @types/bcrypt