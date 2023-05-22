import { HttpModule, Module, CacheModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Members } from 'src/Member/member.entiry';
import { MemberService } from 'src/Member/member.service';
// import { Token } from "src/User/token.entiry";
// import { TokenService } from "src/User/token.service";
// import { User } from "src/User/user.entity";
// import { UserService } from "src/User/user.service";
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

import * as redisStore from 'cache-manager-redis-store';
import { WebsiteService } from 'src/Website/website.service';
import { Website } from 'src/Entity/website.entity';
import { UserAccounting } from 'src/Entity/user.accounting.entity';
import { AccountService } from 'src/account/account.service';
import { monthly_report } from 'src/Entity/monthly.report.entity';
import { Records } from 'src/Entity/records.entity';
import { UserToken } from 'src/Entity/user.token.entity';
import { transaction_report } from 'src/Entity/transaction.account.entitiy';
@Module({
  imports: [
    TypeOrmModule.forFeature([Members]),
    TypeOrmModule.forFeature(
      [Records, monthly_report, UserAccounting, UserToken, transaction_report],
      'allaccounting',
    ),
    TypeOrmModule.forFeature([Website], 'support'),

    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '2d',
        },
      }),
    }),

    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_SERVER,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      ttl: null,
      db: 4,
    }),
    HttpModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    WebsiteService,
    AuthService,
    AccountService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
