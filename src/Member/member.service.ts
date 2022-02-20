import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DepositNotify } from 'src/Entity/deposit.notify.entity';
import { Notify } from 'src/Entity/notify.entity';
import { RegisterNotify } from 'src/Entity/register.notify.entity';
import { Website } from 'src/Entity/website.entity';
import { WithdrawNotify } from 'src/Entity/withdraw.notify.entity';
import { DepositNotifyDto } from 'src/Input/create.deposit.notify.dto';
import { CreateMemberDto } from 'src/Input/create.member.dto';
import { CreateNotifyDto } from 'src/Input/create.notify.setting.dto';
import { RegisterNotifyDto } from 'src/Input/create.register.notify.dto';
import { WithdrawNotifyDto } from 'src/Input/create.withdraw.notify.dto';
import { DepositDto } from 'src/Input/deposit.dto';
import { UpdateMemberDto } from 'src/Input/update.member.dto.ts';
import { UpdateNotifyDto } from 'src/Input/update.notify.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Members } from './member.entiry';
const qs = require('querystring');
@Injectable()
export class MemberService {
    private readonly logger = new Logger(MemberService.name)
    constructor(
        @InjectRepository(Members)
        private readonly memberRepository: Repository<Members>,


        private httpService: HttpService,
        private readonly configService: ConfigService,
    ) {

    }


    public async getMember(username: string): Promise<Members> {
       
        return await this.memberRepository.findOne({ where: { username: username } });

    }
    public async createMember(input: CreateMemberDto) {
    
        
     const member =   await this.memberRepository.save(input)
       this.logger.log('member created');
       return member
    }
    public async updateMember(input: UpdateMemberDto) {
    
        
        const member =   await this.memberRepository.save(input)
          this.logger.log('member saved');
          
          return member
       }
}

