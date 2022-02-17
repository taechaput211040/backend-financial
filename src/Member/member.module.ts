import { CacheModule, HttpModule, Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notify } from 'src/Entity/notify.entity';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import * as redisStore from 'cache-manager-redis-store';
import { DepositNotify } from 'src/Entity/deposit.notify.entity';
import { WithdrawNotify } from 'src/Entity/withdraw.notify.entity';
import { RegisterNotify } from 'src/Entity/register.notify.entity';
import { Members } from './member.entiry';
import { WebsiteService } from 'src/Website/website.service';
import { Website } from 'src/Entity/website.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Notify,DepositNotify,WithdrawNotify,RegisterNotify,Members,Website]), CacheModule.register({
        store: redisStore,
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        ttl: null,
        db: 4
    
      }),
        HttpModule,
        SwaggerModule],
    controllers: [MemberController],
    providers: [MemberService,WebsiteService],
})
export class MemberModule {};