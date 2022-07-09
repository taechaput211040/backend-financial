import { BadRequestException, HttpService, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
    public async searchMemberByUsername(pageOptionsDto:PageOptionsDto, company: string, agent: string , keyword:string) {
    // public async searchMember(pageOptionsDto:PageOptionsDto, company: string, agent: string , keyword:string): Promise<PageDto<MemberAgentDto>> {

        const user =await this.memberRepository
        .createQueryBuilder("m")
        .where("m.company = :company", { company: company })
        .where("m.agent = :agent", { agent: agent })
        .andWhere("m.username like :keyword", { keyword: `%${keyword}%` })
        .orderBy("m.created_at","DESC")
        .take(pageOptionsDto.take)
        .skip( pageOptionsDto.skip)
        .getMany();
        const itemCount = user.length;


        const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

        return new PageDto(user, pageMetaDto);
   
       
        }

    
    public async getMemberPaginate(pageOptionsDto: PageOptionsDto, company: string, agent: string): Promise<PageDto<MemberAgentDto>> {


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
            const [result, total] = await this.memberRepository.findAndCount({
                where: { agent: agent, company: company },
                order: { created_at: 'DESC' },
                skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
                take: pageOptionsDto.take
            })
            const itemCount = total;


            const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

            return new PageDto(result, pageMetaDto);
        }

    }
    public async topupSmart(input: TopupSmartDto) {
        if(!input.amount || input.amount <= 0 || !input.username ) throw new BadRequestException("invalid amount! or username!")

       
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

    public async getCreditByDisplayname(member: Members): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.SMART_ADMIN_TOKEN}`,
        };
        const url = `${process.env.SMART_URL}/api/v1/member/${member.member_uuid}`

        try {
            const res = await this.httpService.get(url, { headers: headersRequest }).toPromise()
            return res.data


        } catch (error) {
            throw new BadRequestException(error.response.data)
        }
    }

    public async saveRealUsername(username: string, provider: string) {

    }
}

