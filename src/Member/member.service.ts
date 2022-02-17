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
        @InjectRepository(Notify)
        private readonly notifyRefRepository: Repository<Notify>,
        @InjectRepository(DepositNotify)
        private readonly depositNotifyRepository: Repository<DepositNotify>,
        @InjectRepository(WithdrawNotify)
        private readonly withdrawNotifyRepository: Repository<WithdrawNotify>,
        @InjectRepository(RegisterNotify)
        private readonly registerNotifyRepository: Repository<WithdrawNotify>,


        private httpService: HttpService,
        private readonly configService: ConfigService,
    ) {

    }
    private getEventsBaseQuery(): SelectQueryBuilder<Notify> {
        return this.notifyRefRepository
            .createQueryBuilder('n')

    }

    public async getMember(username: string): Promise<Members> {
        this.logger.log(username)
        return await this.memberRepository.findOne({ where: { username: username } });

    }
    public async createMember(input: CreateMemberDto) {
    
        
     const member =   await this.memberRepository.save(input)
       this.logger.log('member created');
       return member
    }
    public async updateSetting(noti: Notify, input: UpdateNotifyDto): Promise<Notify> {
        return await this.notifyRefRepository.save(
            new Notify({
                ...noti, ...input



            })
        );
    }


    public async saveDepositTransaction(input: DepositNotifyDto): Promise<DepositNotify> {

        return await this.depositNotifyRepository.save(input)
    }
    public async saveWithdrawTransaction(input: WithdrawNotifyDto): Promise<WithdrawNotify> {
        return await this.withdrawNotifyRepository.save(input)
    }
    public async saveRegisterTransaction(input: RegisterNotifyDto): Promise<RegisterNotify> {
        return await this.registerNotifyRepository.save(input)
    }
    public async pushDeposit(noti_setting: Notify, deposit: DepositNotify) {

        const headersRequest = {
            'Content-Type': 'application/x-www-form-urlencoded', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${noti_setting.deposit_token}`
        };

        const url = process.env.LINE_URL;
        this.logger.log(url)
        this.logger.log(headersRequest)
        this.logger.log(noti_setting.deposit_token)
        const msg = "รายการเติมเครดิตจาก " + deposit.username + ' : จำนวนเงิน ' + ' : ' + deposit.amount + ' : จำนวนโบนัส = ' + deposit.bonus + '  โดย:' + deposit.create_by
        let data = qs.stringify({ message: msg })
        this.logger.log(data)
        try {
            const res = await this.httpService.post(url, data, { headers: headersRequest }).toPromise()
            this.logger.log('ok')
            this.logger.log(res.data)
        } catch (error) {
            this.logger.log('error')
            this.logger.log(error)
        }
    }
    public async pushWithdraw(noti_setting: Notify, withdraw: WithdrawNotify) {

        const headersRequest = {
            'Content-Type': 'application/x-www-form-urlencoded', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${noti_setting.withdraw_token}`
        };

        const url = process.env.LINE_URL;
        this.logger.log(url)
        const msg = "รายการถอนจาก " + withdraw.username + ' : จำนวนเงิน ' + ' : ' + withdraw.amount + ' โดย ' + withdraw.create_by
        let data = qs.stringify({ message: msg })

        try {
            const res: any = await this.httpService.post(url, data, { headers: headersRequest }).toPromise()

            this.logger.log(res.data)
        } catch (error) {
            this.logger.log(error.response)
        }
    }
    public async pushRegister(noti_setting: Notify, user: RegisterNotify) {

        const headersRequest = {
            'Content-Type': 'application/x-www-form-urlencoded', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${noti_setting.register_token}`
        };

        const url = process.env.LINE_URL;
        this.logger.log(url)
        const msg = "สมาชิกใหม่ ชื่อ " + user.name + ' ' + user.lastname + 'username : ' + user.username + ' สมัครผ่าน : ' + user.create_from + ' สมัครโดย :' + user.create_by
        let data = qs.stringify({ message: msg })

        try {
            const res: any = await this.httpService.post(url, data, { headers: headersRequest }).toPromise()

            this.logger.log(res.data)
        } catch (error) {
            this.logger.log(error.response)
        }
    }
}

