import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Cache } from "cache-manager";
import { plainToClass } from "class-transformer";
import { AuthGuardJwt } from "src/auth/autn-guard.jwt";
import { SetTurnDto } from "src/Input/setturn.dto";
import { WebsiteDto } from "src/Input/website.dto";
import { ProviderBOService } from "src/provider_bo/provider_bo.service";
import { WebsiteService } from "./website.service";


@Controller('api/Website')
@SerializeOptions({ strategy: 'excludeAll' })
export class WebsiteController {
    private readonly logger = new Logger(WebsiteController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private readonly websiteService: WebsiteService,
        private readonly providerBOService: ProviderBOService,
        // private readonly transectionService: TransectionService,
    ) { }


    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    async getWeblist() {
        this.logger.log('getWeblist  hit');
        return await this.websiteService.getAllWebListOperate();
    }

    @Get('/Rico/Turn')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMemberTurn(
        @Query('username') username,
        @Query('website') website,
    ) {
        this.logger.log('getMemberTurn  hit');
        this.logger.log(username)
        this.logger.log(website)

        const web = await this.websiteService.getWebInfo(website)

        if (web) {
            return await this.websiteService.getMemberTUrn(username, web);
        } else {
            throw new NotFoundException()
        }

    }


    @Get('/Rico/Member')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMemberInfo(
        @Query('username') username,
        @Query('website') website,
    ) {
        this.logger.log('getMemberInfo  hit');
        this.logger.log(username)
        this.logger.log(website)

        const web = await this.websiteService.getWebInfo(website)

        if (web) {
            return await this.websiteService.getMemberInfo(username, web);
        } else {
            throw new NotFoundException()
        }

    }
    @Get('/Rico/Member/Deposit')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMemberDeposit(
        @Query('username') username,
        @Query('website') website,
    ) {
        this.logger.log('getMemberDeposit  hit');
        this.logger.log(username)
        this.logger.log(website)

        const web = await this.websiteService.getWebInfo(website)

        if (web) {
            return await this.websiteService.getMemberDeposit(username, web);
        } else {
            throw new NotFoundException()
        }

    }
    @Get('/Rico/Member/Withdraw')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMemberWithdraw(
        @Query('username') username,
        @Query('website') website,
    ) {
        this.logger.log('getMemberWithdraw  hit');
        this.logger.log(username)
        this.logger.log(website)

        const web = await this.websiteService.getWebInfo(website)

        if (web) {
            return await this.websiteService.getMemberWithdraw(username, web);
        } else {
            throw new NotFoundException()
        }

    }
    @Get('/ProviderBO')
    @UseInterceptors(ClassSerializerInterceptor)
    async getProviderBO(
        @Query('opcode') opcode

    ) {
        this.logger.log('getProviderBO  hit');
        this.logger.log(opcode)


        const link = await this.providerBOService.getProviderBO(opcode)
      
        return link

    }
    @Get('/Rico/Member/Deposit/Daily')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMemberDepositDaily(
        @Query('username') username,
        @Query('hash') hash,
    ) {
        this.logger.log('getMemberDepositDaily  hit');
        this.logger.log(username)
        this.logger.log(hash)

        const web = await this.websiteService.getWebInfoByHash(hash)

        if (web) {
            return await this.websiteService.getMemberDepositAllDay(username, web);
        } else {
            throw new NotFoundException()
        }

    }
    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(AuthGuardJwt)
    async addWebsite(

        @Body() input: WebsiteDto
    ) {
        this.logger.log('addWebsite  hit');
        // await this.cacheManager.reset();


        const website = await this.websiteService.addWebsite(input)

        //    const result =  await this.topupRefService.sendPinToLineNotify(topup_record)
        //    return topup_record
        //     this.logger.log('cache cleared  ');
    }
    @Post('/Setturn')
    @UseInterceptors(ClassSerializerInterceptor)
    async setTurn(

        @Body() input: SetTurnDto
    ) {
        this.logger.log('setTurn  hit');
        // await this.cacheManager.reset();

        this.logger.log(input);
        input.username = input.username.toLowerCase().trim()
        return await this.websiteService.setTurn(input)

        //    const result =  await this.topupRefService.sendPinToLineNotify(topup_record)
        //    return topup_record
        //     this.logger.log('cache cleared  ');
    }
    @Get('/:hash')
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(
        @Param('hash') hash: string,

    ) {
        this.logger.log('findOne hit');
        const value = await this.cacheManager.get('get_setting' + hash);

        // if (value) {

        //     this.logger.log('cache  return');
        //     return plainToClass(Setting, value);

        // }
        // const setting = await this.settingService.getOne(hash);

        // if (setting) {

        //     await this.cacheManager.set('get_setting' + hash, setting, { ttl: null });
        //     this.logger.log('data  return');
        //     return setting;

        // } else {

        //     throw new NotFoundException("ไม่พบข้อมูล");

        // }

    }



}