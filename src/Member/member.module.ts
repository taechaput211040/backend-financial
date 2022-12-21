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
import { WebsiteModule } from 'src/Website/website.module';
import { AuthModule } from 'src/auth/auth.module';
import { MemberConfigService } from './member.config.service';
import { MemberConfig } from 'src/Entity/member.config.entiry';
import { MemberAgentController } from './member.agent.controller';
import { MemberTurn } from 'src/Entity/member.turn.entiry';
import { MemberTurnService } from './member.turn.service';
import { MemberTurnController } from './member.turn.controller';
import { LockDown } from 'src/Entity/rico.lockdown.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Members,MemberConfig,MemberTurn]), 
    TypeOrmModule.forFeature([Website],'support'), 
    TypeOrmModule.forFeature([LockDown],'rico'), 
    CacheModule.register({ 
        store: redisStore,
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        ttl: null,
        db: 7
    
      }),
        HttpModule,
        SwaggerModule
      ], 
    controllers: [MemberController,MemberAgentController,MemberTurnController],
    providers: [MemberService,WebsiteService,MemberConfigService,MemberTurnService],
})
export class MemberModule {};