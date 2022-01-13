import { CacheModule, HttpModule, HttpService, Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/Entity/User.entity";
import { Website } from "src/Entity/website.entity";
import { Setting } from "src/Setting/setting.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports:[TypeOrmModule.forFeature([User]),JwtModule.registerAsync({
        useFactory:()=>({
            secret:process.env.AUTH_SECRET,
            signOptions:{
                expiresIn:'60m'
            }
        })
    }),HttpModule, CacheModule.register({
        store: redisStore,
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        ttl: null,
        db: 4
    
      }),],
    providers:[AuthService,JwtStrategy],
    controllers:[AuthController]
})
export class AuthModule{}