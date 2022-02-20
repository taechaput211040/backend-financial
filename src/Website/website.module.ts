import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { WebsiteController } from "./website.controller";
import { WebsiteService } from "./website.service";
import { Website } from "src/Entity/website.entity";

@Module({
  // imports:[],
  // controllers:[],
  // providers:[]

  imports: [TypeOrmModule.forFeature([Website], 'support'), CacheModule.register({
    store: redisStore,
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    ttl: null,
    db: 7

  }),
    HttpModule,
    SwaggerModule],
  controllers: [WebsiteController],
  providers: [WebsiteService]
})
export class WebsiteModule { }