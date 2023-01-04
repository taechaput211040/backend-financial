import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Members } from "src/Member/member.entiry";
// import { User } from "src/User/user.entity";
import { Repository } from "typeorm";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
     
        constructor(
            @InjectRepository(Members)
            private readonly settingRepository: Repository<Members>,
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