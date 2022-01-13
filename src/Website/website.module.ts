import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { WebsiteController } from "./website.controller";
import { WebsiteService } from "./website.service";
import { Website } from "src/Entity/website.entity";
import { SmartService } from "./smart.service";
import { SmartApiController } from "./smart.api.controller";
import { ProviderBOService } from "src/provider_bo/provider_bo.service";
import { ProviderBO } from "src/Entity/provider.bo.entity";

@Module({
  // imports:[],
  // controllers:[],
  // providers:[]

  imports: [TypeOrmModule.forFeature([Website,ProviderBO]), CacheModule.register({
    store: redisStore,
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    ttl: null,
    db: 4

  }),
    HttpModule,
    SwaggerModule],
  controllers: [WebsiteController,SmartApiController],
  providers: [WebsiteService,SmartService,ProviderBOService]
})
export class WebsiteModule { }