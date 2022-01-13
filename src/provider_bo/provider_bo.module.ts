import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { ProviderBOController } from "./provider_bo.controller";
import { ProviderBOService } from "./provider_bo.service";

import { ProviderBO } from "src/Entity/provider.bo.entity";

@Module({
  // imports:[],
  // controllers:[],
  // providers:[]

  imports: [TypeOrmModule.forFeature([ProviderBO]), 
    HttpModule,
    SwaggerModule],
  controllers: [ProviderBOController],
  providers: [ProviderBOService]
})
export class ProviderBOModule { }