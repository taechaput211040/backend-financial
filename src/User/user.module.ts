import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { UserService,  } from "./user.service";
import { Website } from "src/Entity/website.entity";
import { UserController } from "./user.controller";

@Module({
  // imports:[],
  // controllers:[],
  // providers:[]

  imports: [TypeOrmModule.forFeature([Website]), CacheModule.register({
    store: redisStore,
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    ttl: null,
    db: 4

  }),
    HttpModule,
    SwaggerModule],
  controllers: [UserController],
  providers: [UserService]
})
export class WebsiteModule { }