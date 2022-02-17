import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, Inject, Logger, NotFoundException, Param, Patch, Post, Req, SerializeOptions, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
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
@Controller('api/Member')
@SerializeOptions({ strategy: 'excludeAll' })
export class MemberController {
    private readonly logger = new Logger(MemberController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly memberService: MemberService,
        private readonly websiteService: WebsiteService


    ) { }

    
    @Get('/ByUsername/:username')
    async getMemberByUsername(
        @Param('username') username: string
    ) {
        this.logger.log('getMemberByUsername  hit');
        const value = await this.cacheManager.get('_member_' + username.toLocaleLowerCase());

        if (value)  return value

        const member = await this.memberService.getMember(this.decodeSeamlessUsername(username.toLocaleLowerCase()))
        if (!member) throw new NotFoundException()

        const cache_data = {
            companyKey: member.company,
            agentKey: member.agent,
            username: this.generateSeamlessUsername(member),
            displayUsername: member.username
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

        if (value)  return value

        const member = await this.memberService.getMember(displayname.toLocaleLowerCase())
        if (!member) throw new NotFoundException()

        const cache_data = {
            companyKey: member.company,
            agentKey: member.agent,
            username: this.generateSeamlessUsername(member),
            displayUsername: member.username
        }
        await this.cacheManager.set('_member_' + displayname.toLocaleLowerCase(), cache_data, { ttl: null });

        return cache_data
    }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    async createMember(
        @Body() input: CreateMemberDto
    ) {

        this.logger.log('createMember hit');

        const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        if (!a) throw new NotFoundException()

        const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        if (member) throw new BadRequestException("Duplicate Username")
        input.username = input.username.toLocaleLowerCase()
        this.logger.log('creating');
        return await this.memberService.createMember(input)
    }
    // @Post('/Wd/:hash')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async withdrawPushNotify(
    //     @Param('hash') hash: string,
    //     @Body() input: WithdrawNotifyDto
    // ) {

    //     const a = await this.memberService.getSettingByHash(hash)
    //     if (!a) throw new NotFoundException()

    //     const wd = await this.memberService.saveWithdrawTransaction(input)
    //     await this.cacheManager.del('get_noti_setting' + hash);
    //     await this.memberService.pushWithdraw(a, wd)
    // }
    // @Post('/Regis/:hash')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async memberRegisterPushNotify(
    //     @Param('hash') hash: string,
    //     @Body() input: RegisterNotifyDto
    // ) {

    //     const a = await this.memberService.getSettingByHash(hash)
    //     if (!a) throw new NotFoundException()

    //     const rg = await this.memberService.saveRegisterTransaction(input)
    //     await this.cacheManager.del('get_noti_setting' + hash);
    //     await this.memberService.pushRegister(a, rg)
    // }
    // @Post()
    // @UseInterceptors(ClassSerializerInterceptor)
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async createNotifySetting(
    //     @Body() input: CreateNotifyDto,
    //     @Req() request: Request
    // ) {
    //     if (request.headers['key'] != process.env.AUTH_SECRET) throw new UnauthorizedException()

    //     return await this.memberService.createSetting(input)

    // }
    // @Patch('/:hash')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async updateWebNotify(
    //     @Param('hash') hash: string,
    //     @Body() input: UpdateNotifyDto,
    //     @Req() request: Request
    // ) {

    //     if (request.headers['key'] != process.env.AUTH_SECRET) throw new UnauthorizedException()
    //     let b = await this.memberService.getSettingByHash(hash)
    //     this.logger.log(hash)
    //     if (!b) throw new NotFoundException()
    //     await this.cacheManager.del('get_noti_setting' + hash);
    //     return await this.memberService.updateSetting(b, input)
    // }


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
}