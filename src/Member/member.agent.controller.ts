import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { PageOptionsDto } from 'src/Page/page.option.dto';
import { CreateMemberAgentDto } from 'src/Input/create.member.agent.dto';
import { TopupSmartDto } from 'src/Input/topup.smart.dto';
import { ChangePasswordDto } from 'src/Input/change.password.dto';
import { LockUserDto } from 'src/Input/lock.user.dto';
@Controller('api/Member/Agent')
@SerializeOptions({ strategy: 'excludeAll' })
export class MemberAgentController {
    private readonly logger = new Logger(MemberAgentController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly memberService: MemberService,
        private readonly websiteService: WebsiteService,
        private readonly memberConfigService: MemberConfigService

    ) { }
    @Get('/Reset')
    async resetCache(
    ) {
        await this.cacheManager.reset()
        return 'ok'
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

        return await this.memberService.getCreditByDisplayname(member)

    }
    @Get('/Search/:company/:agent/:keyword')
    @UseInterceptors(ClassSerializerInterceptor)
    async searchMember(
        @Param('keyword') keyword: string,
        @Param('company') company: string,
        @Param('agent') agent: string,
        @Query() pageOptionsDto: PageOptionsDto
    ) {
        return await this.memberService.searchMemberByUsername(pageOptionsDto, company.toLowerCase(), agent.toLowerCase(), keyword.toLowerCase().trim())
    }
 
    @Get('/SubScribe/:company/:agent')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMemberPaginate(
        @Param('company') company: string,
        @Param('agent') agent: string,

        @Query() pageOptionsDto: PageOptionsDto
    ) {

        let member = await this.memberService.getMemberPaginate(pageOptionsDto, company.toLocaleLowerCase(), agent.toLowerCase())

        return member
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createMemberAgent(
        @Body() input: CreateMemberAgentDto
    ) {

        this.logger.log('createMemberAgent hit');
        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()

        const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        if (member) throw new BadRequestException("Duplicate Username")
        input.username = input.username.toLocaleLowerCase()

        this.logger.log('creating');
        return await this.memberService.saveOrUpdateManyMember(input)
    }
    @Post('/deposit')
    @UsePipes(new ValidationPipe({ transform: true }))
    async topUpMemberSmart(
        @Body() input: TopupSmartDto
    ) {

        this.logger.log('topUpMemberSmart hit');
        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()
        const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        if (!member) throw new NotFoundException()
     return await this.memberService.topupSmart(input)
   

  
      
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

    @Patch('/Password')
    @UsePipes(new ValidationPipe({ transform: true }))
    async chagePassword(
        @Body() input: ChangePasswordDto
    ) {

        this.logger.log('chagePassword hit');



        const member = await this.memberService.getMemberById(input.id)
        if (!member) throw new NotFoundException()
        member.password = input.password
        const result = await this.memberService.saveMemberEntity(member)
        await this.memberService.changePasswordSmart(member,result.password)
        await this.websiteService.changePasswordRico(member,result.password)
        await this.cacheManager.del('_member_info_' + result.username.toLocaleLowerCase())
        await this.cacheManager.del('_member_' + result.username.toLocaleLowerCase())
        await this.cacheManager.del('_member_' + this.generateSeamlessUsername(member))
        return result
    }
 
    @Patch('/Status')
    @UsePipes(new ValidationPipe({ transform: true }))
    async LockUser(
        @Body() input: LockUserDto
    ) {

        this.logger.log('LockUser hit');



        const member = await this.memberService.getMemberById(input.id)
        if (!member) throw new NotFoundException()
        member.status = input.status
        const result = await this.memberService.saveMemberEntity(member)
        await this.websiteService.changeStatusRico(member,input.status)
        await this.cacheManager.del('_member_info_' + result.username.toLocaleLowerCase())
        await this.cacheManager.del('_member_' + result.username.toLocaleLowerCase())
        await this.cacheManager.del('_member_' + this.generateSeamlessUsername(member))
        return result
    }
    private generateSeamlessUsername(member: Members) {
        let seamless_username = member.company + member.agent + member.username
        if (seamless_username.length > 16) { seamless_username = seamless_username.slice(0, 16) }
        return seamless_username
    }



}