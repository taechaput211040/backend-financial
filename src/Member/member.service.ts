import { BadRequestException, CACHE_MANAGER, HttpService, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
import { Between, Like, Repository, SelectQueryBuilder } from 'typeorm';
import { Members } from './member.entiry';
import { AxiosResponse } from 'axios';
import { CreateAffMemberSettingDto } from 'src/Input/create.aff.member.setting.dto';
import { MemberConfig } from 'src/Entity/member.config.entiry';
import { PageOptionsDto } from 'src/Page/page.option.dto';
import { PageDto } from 'src/Page/page.dto';
import { MemberAgentDto } from 'src/Input/member.agent.dto';
import { PageMetaDto } from 'src/Page/page-meta.dto';
import { CreateMemberAgentDto } from 'src/Input/create.member.agent.dto';
import { TopupSmartDto } from 'src/Input/topup.smart.dto';
import { Setting } from 'src/Setting/setting.entity';
import { CreditV1Dto } from 'src/Input/credit.v1.dto';
import { CreditV2Dto } from 'src/Input/credit.v2.dto';
import { MemberTurnService } from './member.turn.service';
import { CutCreditDto } from 'src/Input/cut.credit.dto';
import { HttpException } from '@nestjs/common/exceptions';

import { Cache } from "cache-manager";
import { plainToClass } from 'class-transformer';
import { ChangePasswordFrontendDto } from 'src/Input/change.password.frontend.dto';
import { SettingDto } from 'src/Input/setting.dto';
const qs = require('querystring');
@Injectable()
export class MemberService {
    private readonly logger = new Logger(MemberService.name)
    constructor(
        @InjectRepository(Members)
        private readonly memberRepository: Repository<Members>,

        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private httpService: HttpService,
        private readonly configService: ConfigService,


    ) {

    }


    public async getMember(username: string): Promise<Members> {



        const cacheName = `_memberRepo_${username.toLowerCase()}`

        const value = await this.cacheManager.get(cacheName)
        if (value) return plainToClass(Members, value)
        console.log('get _memberRepo_ :', username)
        const member = await this.memberRepository.findOne({ where: { username: username }, loadEagerRelations: true });

        await this.cacheManager.set(cacheName, member, { ttl: null })

        return member

    }
    public async verifyMember(company: string, agent: string, fromBankRef: string): Promise<Members[]> {



        return await this.memberRepository.find({ where: { company: company, agent: agent, bankAccRef: fromBankRef } });

    }
    public async getSettingByhash(hash: string) {

        const url_allsetting = `${process.env.ALL_SETTING}/api/Setting/${hash}`


        try {
            const setting = await this.httpService.get(url_allsetting).toPromise()
            return setting.data
        } catch (error) {
            console.log(error)
            return null
        }
    }
    public async getMemberById(id: string): Promise<Members> {

        return await this.memberRepository.findOne(id);

    }
    public async searchMemberByUsername(pageOptionsDto: PageOptionsDto, company: string, agent: string, keyword: string) {
        // public async searchMember(pageOptionsDto:PageOptionsDto, company: string, agent: string , keyword:string): Promise<PageDto<MemberAgentDto>> {

        const user = await this.memberRepository
            .createQueryBuilder("m")
            .where("m.company = :company", { company: company })
            .where("m.agent = :agent", { agent: agent })
            .andWhere("m.username like :keyword", { keyword: `%${keyword}%` })
            .orderBy("m.created_at", "DESC")
            .take(pageOptionsDto.take)
            .skip(pageOptionsDto.skip)
            .getMany();
        const itemCount = user.length;


        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(user, pageMetaDto);


    }


    public async getMemberPaginate(pageOptionsDto: PageOptionsDto, company: string, agent: string): Promise<PageDto<MemberAgentDto>> {
        // public async getMemberPaginate(pageOptionsDto: PageOptionsDto, company: string, agent: string) {

        if (pageOptionsDto.start && pageOptionsDto.end) {
            const [result, total] = await this.memberRepository.findAndCount({
                where: { agent: agent, company: company, created_at: Between(pageOptionsDto.start, pageOptionsDto.end) },
                order: { created_at: 'DESC' },
                skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
                take: pageOptionsDto.take
            })
            const itemCount = total;


            const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

            return new PageDto(result, pageMetaDto);

        } else {
            console.log("here")
            const skip: number = (pageOptionsDto.page - 1) * pageOptionsDto.take
            const [result, total] = await this.memberRepository.findAndCount({
                where: { agent: agent, company: company },
                order: { created_at: 'DESC' },
                skip: skip,
                take: pageOptionsDto.take
            })
            const itemCount = total;


            const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });
            // console.log(pageMetaDto)
            const a = new PageDto(result, pageMetaDto);

            console.log(a)
            return a
        }

    }
    public async topupSmart(input: TopupSmartDto) {
        if (!input.amount || input.amount <= 0 || !input.username) throw new BadRequestException("invalid amount! or username!")


        if (input.method == 'deposit') {

            return await this.deposit(input.username, input.amount);

        } else if (input.method == 'withdraw') {

            return await this.withdraw(input.username, input.amount);

        }
    }
    public async deposit(username: string, amount: number): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            Authorization: `Bearer ${process.env.SMART_ADMIN_TOKEN}`,
        };

        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if (amount == 0 || amount < 0) {
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
        const url = process.env.SMART_URL + '/api/Credit/Deposit';

        console.log(url)
        try {
            const result = await this.httpService
                .post(url, { username: username, amount: amount }, { headers: headersRequest })
                .toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.data);
            throw new BadRequestException(error.response.data);
        }
    }
    public async withdraw(username: string, amount: number): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            Authorization: `Bearer ${process.env.SMART_ADMIN_TOKEN}`,
        };

        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if (amount == 0 || amount < 0) {
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
        const url = process.env.SMART_URL + '/api/Credit/Withdraw';

        try {
            const result = await this.httpService
                .post(url, { username: username, amount: amount }, { headers: headersRequest })
                .toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.message);
            throw new UnauthorizedException();
        }
    }
    public async createMember(input: CreateMemberDto) {


        const member = await this.memberRepository.save(input)
        this.logger.log('member created');
        return member
    }
    public async updateMember(member: Members, input: UpdateMemberDto) {


        const members = await this.memberRepository.save({ ...member, ...input })
        this.logger.log('member saved');

        return members
    }
    public async updateMemberPassword(member: Members, input: ChangePasswordFrontendDto) {

        member.password = input.newpass
        const members = await this.memberRepository.save(member)
        this.logger.log('member saved');

        return members
    }
    public async saveMemberEntity(member: Members) {


        const members = await this.memberRepository.save(member)
        this.logger.log('member saved');

        return members
    }

    public async validateMemberData(input: CreateMemberDto) {
        console.log('checking phone')
        const phone_check = await this.memberRepository.findOne({

            where: { phone: input.phone, agent: input.agent, company: input.company }
        })
        
       
        if (phone_check) throw new BadRequestException('เบอร์โทรศัพท์นี้ได้สมัครใช้งานแล้ว')
        console.log('checking bank acc')
        const bankAcc_check = await this.memberRepository.findOne({

            where: { bankAcc: input.bankAcc, agent: input.agent, company: input.company }
        })
        if (bankAcc_check) throw new BadRequestException('เลขบัญชีนี้ได้สมัครใช้งานแล้ว')

        console.log('checkingname lastname')
        const name_lastname = await this.memberRepository.findOne({

            where: { name: input.name, lastname: input.lastname, agent: input.agent, company: input.company }
        })
        if (name_lastname) throw new BadRequestException('ชื่อ - นามสกุลนี้ได้สมัครใช้งานแล้ว')
        console.log('checking criminal')
        const criminal_check = await this.checkCriminal(input)
        if (criminal_check) throw new BadRequestException('ข้อมูล ซ้ำกับมิจฉาชีพ  ไม่สามารถสมัครได้')
        console.log('checking company bank')
        const company_bank_check = await this.checkCompanyBank(input)
        if (company_bank_check) throw new BadRequestException('เลขบัญชีซ้ำกับในระบบ')
      
      

    }
    public async generateMember(input:CreateMemberDto,setting:Setting){
        input.username = await this.generateUsername(input)
        if (input.bankName == "KBANK") {
            input.bankAccRef = `X-${input.bankAcc.slice(6)}` //Str::substr($bankAcc, 6);
        } else if (input.bankName  == "TRUEWALLET") {
            input.bankAccRef   = input.phone
        } else if (input.bankName  == "GSB") {
            input.bankAccRef  = `X${input.bankAcc.slice(6)}` // Str::substr($bankAcc, 6);
        } else if (input.bankName  == "BAAC") {
            input.bankAccRef = `X${input.bankAcc.slice(6)}` // Str::substr($bankAcc, 6);
        } else {
            input.bankAccRef  = `X${input.bankAcc.slice(4)}` // Str::substr($bankAcc, 4);
        }
        input.sync = true
      
        const member = await this.memberRepository.save(input)
        return member
    }
    private async generateUsername(input:CreateMemberDto):Promise<string>{
        let username_temp = `${input.agent.toLowerCase()}${input.phone.slice(3)}`
        for (let index = 3; index > 0; index--) {
           
            const member_temp = await this.memberRepository.findOne({where:{username:username_temp}})
            if(member_temp){
                username_temp = `${input.agent.toLowerCase()}${input.phone.slice(index)}`
            } else {
                return username_temp
            }
        }
        return username_temp
    }
    public async checkCompanyBank(input: CreateMemberDto) {
        const url_all_company_bank = `${process.env.ALL_CRIMINAL}/api/Company/Check/${input.bankAcc}`

        try {
            const result = await this.httpService.get(url_all_company_bank).toPromise()
            if (result.data.result == true) return true
            return false
        } catch (error) {
            return false
        }
    }
    public async checkCriminal(input: CreateMemberDto) {
        const url_criminal = `${process.env.ALL_CRIMINAL}/api/CheckAll`
        const body = {
            name: input.name,
            lastname: input.lastname,
            phone: input.phone,
            bankAcc: input.bankAcc
        }
        try {
            const result = await this.httpService.post(url_criminal, body).toPromise()
            if (result.data.valid == 1) return true
            return false
        } catch (error) {
            return false
        }
    }
    public async saveOrUpdateManyMember(input: CreateMemberDto[] | CreateMemberDto | CreateMemberAgentDto) {


        await this.memberRepository.createQueryBuilder()
            .insert()
            .into(Members)
            .values(input)
            .orUpdate({
                conflict_target: ['username'],
                overwrite: ["rico_id", "name", "lastname", "bankName", "bankAcc", "bankAccRef", "phone", "bonusid", "password", "hash", "agent", "company", "nameEng",

                    "lastnameEng", "lineID", "recommender", "knowFrom", "remark", "birthdate", "gender", "dpAuto", "wdAuto", "operator", "member_uuid", "member_token",

                    'aff_id', 'parent_id', 'parent_username'],

            }


            )
            .execute();

    }

    public async cutCreditAffiliate(member: Members, amount: number) {
        const url_all_deposit = `${process.env.ALL_DEPOSIT}/api/Aff/Report/CheckV2`
        const body = { username: member.username, amount: amount }
        try {
            const res = await this.httpService.post(url_all_deposit, body).toPromise()
            return res.data
        } catch (error) {
            console.log('affiliate check error: ', member.username)
            throw new HttpException(error.response.data, error.response.status)
        }

    }

    public async changePasswordSmart(member: Members, mew_password: string): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.SMART_OLD_ADMIN_TOKEN}`,
        };

        const data = {
            old_password: member.password,
            new_password: mew_password
        }
        const url = `${process.env.SMART_URL_OLD}/api/v1/member/${member.member_uuid}/reset-password`
        try {
            const res = await this.httpService.post(url, data, { headers: headersRequest }).toPromise()
            return res.data


        } catch (error) {
            throw new BadRequestException(error.response.data)
        }


    }
    public async generateAffid(member: Members, web: Website) {

        const aff_member_get_data = `${process.env.AFF_MEMBER}/api/Aff/Member/Data/${member.username}`
        this.logger.log('getting aff member');
        try {
            let res_aff_member = await this.httpService.get(aff_member_get_data).toPromise()
            console.log(res_aff_member.data)

            if (res_aff_member.data.id) {
                member.aff_id = res_aff_member.data.id
                this.logger.log('getting aff member ok');
                await this.memberRepository.save(member)
                this.logger.log('member saved');
                return member
            }
        } catch (error) {
            this.logger.log('getting aff member error');
            console.log(error.response.data)
        }
        //getDefault aff seting
        let setting_result
        let setting_id
        const headersRequest = {
            'origin': `${web.website}` // afaik this one is not needed

        };
        const aff_setting_url = `${process.env.AFF_SETTING}/api/Aff/Member/${member.username}`
        this.logger.log('getting aff setting');
        try {

            setting_result = await this.httpService.get(aff_setting_url, { headers: headersRequest }).toPromise()
            setting_id = setting_result.data.setting_id
            member.aff_id = setting_result.data.aff_id
            this.logger.log('registering aff member ok');
            await this.memberRepository.save(member)
            this.logger.log('member saved');
            return member

        } catch (error) {
            this.logger.log('getting aff setting error');
            console.log(error.response.data)
            return member
        }


    }

    public async getCreditByDisplayname(member: Members): Promise<CreditV1Dto> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.SMART_OLD_ADMIN_TOKEN}`,
        };
        const url = `${process.env.SMART_URL_OLD}/api/v1/member/${member.member_uuid}`
        // const url =`https://agent-service-backend-kdz5uqbpia-as.a.run.app/api/v1/member/6d0fca9f932e4fe1857e13849ca2182c`
        try {
            const res = await this.httpService.get(url, { headers: headersRequest }).toPromise()
            return res.data


        } catch (error) {
            throw new BadRequestException(error.response.data)
        }
    }
    public async getCreditByDisplaynameV2(member: Members, setting: Setting): Promise<CreditV2Dto> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'apikey': `${setting.token}`,
        };
        const url = `${process.env.SMART_V2}/v1alpha/permanant/credit-tranfer/balance/${member.username.toLowerCase()}`
        // const url =`https://agent-service-backend-kdz5uqbpia-as.a.run.app/api/v1/member/6d0fca9f932e4fe1857e13849ca2182c`
        try {
            const res = await this.httpService.get(url, { headers: headersRequest }).toPromise()
            return res.data


        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: `Can not connect API,Please try again or contact admin.`, turnStatus: true })
        }
    }
    public async adjustCreditToV2(creditv1: number, creditv2: number, member: Members, setting: Setting) {


        //v1-v2 = x
        //v2 = x+v2

        const div_credit = creditv1 - creditv2


        const sync_credit = await this.topupV2(div_credit, member, setting)
        return sync_credit.amount
    }

    private async topupV2(credit: number, member: Members, setting: Setting) {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'apikey': `${setting.token}`,
        };
        const url = `${process.env.SMART_V2}/v1alpha/permanant/credit-tranfer/deposit/`

        const body = {
            username: member.username,
            amount: credit
        }
        try {
            const res = await this.httpService.post(url, body, { headers: headersRequest }).toPromise()

            console.log("topup:", res.data)
            return res.data


        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: `Can not connect API,Please try again or contact admin.`, turnStatus: true })
        }
    }


    public async cutCreditV2(credit: number, member: Members, setting: Setting) {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'apikey': `${setting.token}`,
        };
        const url = `${process.env.SMART_V2}/v1alpha/permanant/credit-tranfer/withdraw/`

        const body = {
            username: member.username,
            amount: credit
        }
        try {

            const res = await this.httpService.post(url, body, { headers: headersRequest }).toPromise()

            console.log("withdrawV2:", res.data)
            return res.data


        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: `Can not connect API,Please try again or contact admin.`, turnStatus: true })
        }
    }
    public async sendWithdrawList(credit_result: CutCreditDto, member: Members) {

        const url = `${process.env.ALL_WITHDRAW}/api/Withdraw/Member`

        const body = {
            member: member,
            result: credit_result
        }
        try {
            console.log('sending withdrawlist', member.username)

            const res = await this.httpService.post(url, body).toPromise()

            //    console.log("withdrawV2:",res.data)
            member.wd_count++
            await this.saveMemberEntity(member)

            return res.data


        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: `Can not connect API,Please try again or contact admin.`, turnStatus: true })
        }
    }

    private async withdrawV2(credit: number, member: Members, setting: Setting) {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'apikey': `${setting.token}`,
        };
        const url = `${process.env.SMART_V2}/v1alpha/permanant/credit-tranfer/withdraw/`

        const body = {
            username: member.username,
            amount: credit
        }
        try {
            const res = await this.httpService.post(url, body, { headers: headersRequest }).toPromise()

            console.log("withdrawV2:", res.data)
            return res.data


        } catch (error) {
            throw new BadRequestException(error.response.data)
        }
    }
    public async saveRealUsername(username: string, provider: string) {

    }

    public async updateSyncedMember(member: Members) {


        member.sync = true
        await this.memberRepository.save(member)
        console.log('member sync updated')
    }
}

