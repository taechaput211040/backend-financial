import { CacheModule, HttpModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as redisStore from 'cache-manager-redis-store';
import { SwaggerModule } from "@nestjs/swagger";
import { TopupRefService} from "./topupref.service";
import { TopupRefController } from "./topupref.controller";
import { TopupRef } from "src/Entity/topup.ref.entity";
import { SmartService } from "src/Website/smart.service";

@Module({
  // imports:[],
  // controllers:[],
  // providers:[]

  imports: [TypeOrmModule.forFeature([TopupRef]), CacheModule.register({
    store: redisStore,
    host: process.env.REDIS_SERVER,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    ttl: null,
    db: 4

  }),
    HttpModule,
    SwaggerModule],
  controllers: [TopupRefController],
  providers: [TopupRefService,SmartService]
})
export class TopupRefModule { }