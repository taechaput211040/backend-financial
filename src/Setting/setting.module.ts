import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { Setting } from "./setting.entity";
import { SettingController } from "./setting.controller";
import { SettingService } from "./setting.service";

@Module({
  // imports:[],
  // controllers:[],
  // providers:[]

  imports: [TypeOrmModule.forFeature([Setting]), CacheModule.register({
    store: redisStore,
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    ttl: null,
    db: 4

  }),
    HttpModule,
    SwaggerModule],
  controllers: [SettingController],
  providers: [SettingService]
})
export class SettingModule { }