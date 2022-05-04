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
    imports:[TypeOrmModule.forFeature(),JwtModule.registerAsync({
        useFactory:()=>({
            secret:process.env.AUTH_SECRET,
            signOptions:{
                expiresIn:'60m'
            }
        })
    })],
    providers:[AuthService,JwtStrategy],
    controllers:[AuthController]
})
export class AuthModule{}