import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Setting } from "src/Setting/setting.entity";
import { Repository } from "typeorm";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
     
        constructor(
   
    ) {
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:process.env.AUTH_SECRET
        })
     }

     async validate(payload:any){
         return payload.role;
     }


}