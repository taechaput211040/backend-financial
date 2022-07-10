import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Req, SerializeOptions, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { DepositNotifyDto } from 'src/Input/create.deposit.notify.dto';
import { CreateNotifyDto } from 'src/Input/create.notify.setting.dto';
import { RegisterNotifyDto } from 'src/Input/create.register.notify.dto';
import { WithdrawNotifyDto } from 'src/Input/create.withdraw.notify.dto';
import { UpdateNotifyDto } from 'src/Input/update.notify.dto';
import { MemberService } from './member.service';
import { Cache } from "cache-manager";
import { CreateMemberDto } from 'src/Input/create.member.dto';
import { WebsiteService } from 'src/Website/website.service';
import { Members } from './member.entiry';
import { plainToClass } from 'class-transformer';
import { UpdateMemberDto } from 'src/Input/update.member.dto.ts';
import { AuthGuardJwt } from 'src/auth/autn-guard.jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { MemberConfigService } from './member.config.service';
@Controller('api/Member')
@SerializeOptions({ strategy: 'excludeAll' })
export class MemberController {
    private readonly logger = new Logger(MemberController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly memberService: MemberService,
        private readonly websiteService: WebsiteService,
        private readonly memberConfigService: MemberConfigService

    ) { }
 
    @Get('/testauth')
    @UseGuards(AuthGuard('jwt'))
    async testauth(
    ) {
        await this.cacheManager.reset()
        return 'ok'
    }
    @Get('/Reset')
    async resetCache(
    ) {
        await this.cacheManager.reset()
        return 'ok'
    }
    @Get(':displayname')
    async getMemberInfo(
        @Param('displayname') username: string
    ) {
        const value = await this.cacheManager.get('_member_info_' + username.toLocaleLowerCase());

        if (value) return plainToClass(Members, value)
        let member = await this.memberService.getMember(username.toLocaleLowerCase())
        if (!member) throw new NotFoundException()

        if (!member.aff_id) {
            this.logger.log('no aff_id  hit');
            const web = await this.websiteService.getWebInfoByHashAllData(member.hash)
            member = await this.memberService.generateAffid(member, web);
        }
        await this.cacheManager.set('_member_info_' + username.toLocaleLowerCase(), member, { ttl: null });
        return member
    }
    @Get('/ByUsername/:username')
    async getMemberByUsername(
        @Param('username') username: string
    ) {

        this.logger.log('getMemberByUsername  hit');
        const value = await this.cacheManager.get('_member_' + username.toLocaleLowerCase());

        if (value) return value
const decode_username = this.decodeSeamlessUsername(username.toLocaleLowerCase())
        const member = await this.memberService.getMember(this.decodeSeamlessUsername(username.toLocaleLowerCase()))
        if (!member) {
       
            throw new NotFoundException()
        }


        const cache_data = {
            companyKey: member.company,
            agentKey: member.agent,
            username: this.generateSeamlessUsername(member),
            displayUsername: member.username,
            depositUrl: await this.getMemberUrl(member),
            currency: 'THB'

        }
        await this.cacheManager.set('_member_' + username.toLocaleLowerCase(), cache_data, { ttl: null });

        return cache_data
    }

    @Get('/ByDisplayname/:displayname')
    async getMemberByDisplayname(
        @Param('displayname') displayname: string
    ) {
        this.logger.log('getMemberByUsername  hit');
        const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

        if (value) return value

        const member = await this.memberService.getMember(displayname.toLocaleLowerCase())
        if (!member) throw new NotFoundException()

        const cache_data = {
            companyKey: member.company,
            agentKey: member.agent,
            username: this.generateSeamlessUsername(member),
            displayUsername: member.username,
            depositUrl: await this.getMemberUrl(member),
            currency: 'THB'
        }
        await this.cacheManager.set('_member_' + displayname.toLocaleLowerCase(), cache_data, { ttl: null });

        return cache_data
    }

    @Get('/ByProviderUsername/:provider/:providerUsername')
    async getMemberByproviderUsername(
        @Param('providerUsername') providerUsername: string,
        @Param('provider') provider: string
    ) {

        this.logger.log('ByProviderUsername  hit');
        const value = await this.cacheManager.get('_provider_username_' + providerUsername.toLocaleLowerCase()+'_'+provider);

        if (value) return value
        const member_config = await this.memberConfigService.getUsernameByProviderUsername(providerUsername,provider.toUpperCase())
        if (!member_config) {
       
            throw new NotFoundException()
        }
        const member = await this.memberService.getMember(member_config.username.toLocaleLowerCase())
        const cache_data = {
            companyKey: member.company,
            agentKey: member.agent,
            username: member_config.username,
            providerUsername: member_config.provider_username,

        }

       
     
       
        await this.cacheManager.set('_provider_username_' + providerUsername.toLocaleLowerCase()+'_'+provider, cache_data, { ttl: null });

        return cache_data
    }
    @Get('/Withdraw/:from/:to/:displayname')
    async getMemberWithdrawFromTo(
        @Param('displayname') displayname: string,
        @Param('from') from: string,
        @Param('to') to: string,
    ) {
        this.logger.log('getMemberWithdrawFromTo  hit');
        // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

        // if (value) return value

        const member = await this.memberService.getMember(displayname.toLocaleLowerCase())
        if (!member) throw new NotFoundException()

        return await this.websiteService.getWithdrawMemberFromTo(from, to, member)

    }
    @Get('/Credit/:displayname')
    async getCreditByDisplayname(
        @Param('displayname') displayname: string

    ) {
        this.logger.log('getCreditByDisplayname  hit');
        // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

        // if (value) return value

        const member = await this.memberService.getMember(displayname.toLocaleLowerCase())
        if (!member) throw new NotFoundException()

        return await this.memberService.getCreditByDisplayname( member)

    }
    
    @Post('/Realusername')
    @UsePipes(new ValidationPipe({ transform: true }))
    async Realusername(
        @Body() input: any
    ) {
        this.logger.log('Realusername  hit');
        const cacheName = '_realusername_'+input.username.toUpperCase() + '_'+input.provider
        const value =  await this.cacheManager.get(cacheName)
       if(value) return
        this.logger.log(input);
        const member_config =await this.memberConfigService.getByUsername(input.username.toLowerCase(),input.provider.toUpperCase())
        if(member_config) return
        await this.memberConfigService.saveRealUsername(input.username,input.provider,input.opcode)
        
        await this.cacheManager.set('_realusername_'+input.username.toUpperCase() + '_'+input.provider, '1', { ttl: null });
    }
    @Post('/Migrate')
    @UsePipes(new ValidationPipe({ transform: true }))
    async migrateMember(
        @Body() input: any
    ) {
        this.logger.log('migrateMember  hit');


        let members = [new CreateMemberDto()]
        members = input.data
        this.logger.log(members)
        //   return members
        await this.memberService.saveOrUpdateManyMember(members)
    }
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createMember(
        @Body() input: CreateMemberDto
    ) {

        this.logger.log('createMember hit');
        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()

        // const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        // // if (member) throw new BadRequestException("Duplicate Username")
        input.username = input.username.toLocaleLowerCase() 
       
        this.logger.log('creating');
        return await this.memberService.saveOrUpdateManyMember(input)
    }

    @Put()
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateMember(
        @Body() input: UpdateMemberDto
    ) {

        this.logger.log('updateMember hit');



        const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        if (!member) throw new NotFoundException()

        const result = await this.memberService.updateMember(member, input)
        await this.cacheManager.del('_member_info_' + input.username.toLocaleLowerCase())
        await this.cacheManager.del('_member_' + input.username.toLocaleLowerCase())
        await this.cacheManager.del('_member_' + this.generateSeamlessUsername(member))
        return result
    }

    @Delete('/:hash')
    async deleteNotifySetting(
        @Param('hash') hash: string,
        @Req() request: Request
    ) {
        if (request.headers['key'] != process.env.AUTH_SECRET) throw new UnauthorizedException()

        // return await this.notifyService.dele(input)
    }

    private generateSeamlessUsername(member: Members) {
        let seamless_username = member.company + member.agent + member.username
        if (seamless_username.length > 16) { seamless_username = seamless_username.slice(0, 16) }
        return seamless_username
    }
    private decodeSeamlessUsername(username: string) {
        return username.slice(4)
    }
    async getMemberUrl(member: Members) {

        const web_cache = await this.cacheManager.get('_web_Domain_' + member.hash)
        if (web_cache) return 'https://member.' + web_cache

        const web = await this.websiteService.getWebInfoByHash(member.hash)
        await this.cacheManager.set('_web_Domain_' + member.hash, web.website, { ttl: null })
        return 'https://member.' + web.website
    }
}