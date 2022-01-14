import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { GatewayController } from "./gateway.controller";
import { GatewayService } from "./gateway.service";
import { Website } from "src/Entity/website.entity";

import { ProviderBO } from "src/Entity/provider.bo.entity";
import { Members } from "src/Entity/member.entiry";

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
    SwaggerModule
    
  ],
  controllers: [GatewayController],
  providers: [GatewayService]
})
export class GatewayModule { } 