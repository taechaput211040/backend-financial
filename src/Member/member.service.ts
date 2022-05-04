import { BadRequestException, HttpService, Injectable, Logger } from '@nestjs/common';
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
import { AxiosResponse } from 'axios'; 
import { CreateAffMemberSettingDto } from 'src/Input/create.aff.member.setting.dto';
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


        const member = await this.memberRepository.save(input)
        this.logger.log('member created');
        return member
    }
    public async updateMember(member : Members,input: UpdateMemberDto) {


        const members = await this.memberRepository.save({...member,...input})
        this.logger.log('member saved');

        return members
    }
    public async saveOrUpdateManyMember(input: CreateMemberDto[] | CreateMemberDto) {


        await this.memberRepository.createQueryBuilder()
            .insert()
            .into(Members)
            .values(input)
            .orUpdate({
                conflict_target: ['username'],
                overwrite: ["rico_id", "name", "lastname", "bankName", "bankAcc", "bankAccRef", "phone", "bonusid", "password", "hash", "agent", "company", "nameEng",

                    "lastnameEng", "lineID", "recommender", "knowFrom", "remark", "birthdate", "gender", "dpAuto", "wdAuto", "operator", "member_uuid", "member_token", 'aff_id'],

            }


            )
            .execute();
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

            setting_result = await this.httpService.get(aff_setting_url,{headers:headersRequest}).toPromise()
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
    
        //do register aff null parent

    //     const aff_member = `${process.env.AFF_MEMBER}/api/Aff/RegisterNullParent`
    //     const data = {
    //         username: member.username,
    //         company: member.company,
    //         agent: member.agent,
    //         child_config_id: setting_id.id,
    //         aff_link: process.env.AFF_LINK,
    //         aff_register_link: process.env.AFF_REGISTER_LINK,
    //         member_link: `https://member.${web.website}`,
    //         hash: member.hash
    //     }
    //     this.logger.log('registering aff member ');
    //     try {
    //         let res = await this.httpService.post(aff_member, data).toPromise()
    //         console.log(res.data)
    //         member.aff_id = res.data.id
    //         this.logger.log('registering aff member ok');
    //         await this.memberRepository.save(member)
    //         this.logger.log('member saved');
    //         return member
    //     } catch (error) {
    //         this.logger.log('registering aff member error');
    //         console.log(error.response.data)
    //     }

    //         // register aff_setting
    //         try {
    //             const register_setting_url =  `${process.env.AFF_SETTING}/api/Aff/Member`
    // const setting_data = new CreateAffMemberSettingDto()
    // setting_data.aff_id = res.data.id
    //             await this.httpService.post(register_setting_url,)
    //         } catch (error) {
                
    //         }
    //     return member
    }

    public async getCreditByDisplayname(member : Members): Promise<AxiosResponse | object>{
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.SMART_ADMIN_TOKEN}`,
        };
        const url = `${process.env.SMART_URL}/api/v1/member/${member.member_uuid}`

        try {
            const res = await this.httpService.get(url,{headers:headersRequest}).toPromise()
            return res.data
        } catch (error) {
            throw new BadRequestException(error.response.data)
        }
    }
}

