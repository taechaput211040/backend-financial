import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Cache } from "cache-manager";
import { plainToClass } from "class-transformer";
import { AuthGuardJwt } from "src/auth/autn-guard.jwt";
import { CreateSettingDto } from "./input/create.setting.dto";
import { UpdateSettingDto } from "./input/update.setting.dto";
import { Setting } from "./setting.entity";
import { SettingService } from "./setting.service";


@Controller('api/Setting')
@SerializeOptions({ strategy: 'excludeAll' })
export class SettingController {
    private readonly logger = new Logger(SettingController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private readonly settingService: SettingService
        // private readonly transectionService: TransectionService,
    ) { }


    @Get('/Reset')
    @HttpCode(404)
    async clearcache() {
        this.logger.log('cache clear  hit');
        await this.cacheManager.reset();
        this.logger.log('cache cleared  ');
    }

    @Get('/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(
        @Param('hash') hash: string,

    ) {
        this.logger.log('findOne hit');
        const value = await this.cacheManager.get('get_setting' + hash);

        if (value) {

            this.logger.log('cache  return');
            return plainToClass(Setting, value);

        }
        const setting = await this.settingService.getOne(hash);

        if (setting) {

            await this.cacheManager.set('get_setting' + hash, setting, { ttl: null });
            this.logger.log('data  return');
            return setting;

        } else {

            throw new NotFoundException("ไม่พบข้อมูล");

        }

    }

    @Get('/token/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getToken(
        @Param('hash') hash: string,

    ) {
        this.logger.log('getToken hit');
        const value = await this.cacheManager.get('getToken' + hash);

        if (value) {

            this.logger.log('cache  return');
            return value;

        }
        const setting = await this.settingService.getOne(hash);

        if (setting) {
            const token = { token: setting.token };
            await this.cacheManager.set('getToken' + hash, token, { ttl: null });
            this.logger.log('data  return');
            return token;

        } else {

            throw new NotFoundException("ไม่พบข้อมูล");

        }

    }

    @Get('/Member/:hash')
    async findOneByMember(
        @Param('hash') hash: string,

    ) {
        this.logger.log('findOneByMember hit');
        const value = await this.cacheManager.get('findOneByMember' + hash);

        if (value) {

            this.logger.log('cache  return');
            return value;

        }
        const setting = await this.settingService.getOne(hash);

        if (setting) {


            const data = {
                companyurl: setting.companyurl,
                lineUrl: setting.companynlineurl,
                siteName: setting.member_site_name,
                siteLogo: setting.member_logo_url,
                lineName: setting.line_name,
            };
            await this.cacheManager.set('findOneByMember' + hash, data, { ttl: null });

            this.logger.log('data  return');
            return data;

        } else {

            throw new NotFoundException("ไม่พบข้อมูล");

        }

    }


    @Post('/companyname/:hash/:key')
    @HttpCode(200)
    async checkCompanyKey(
        @Body() input: any,
        @Param('hash') hash: string,
        @Param('key') key: string
    ) {
        if (key != process.env.AUTH_SECRET) {
            throw new UnauthorizedException();
        }
        const value = await this.cacheManager.get('checkCompanyKey' + hash);

        if (value) {

            this.logger.log('cache  return');
            return value;

        }
        let result = await this.settingService.checkCompanyKey(input.companyname.toUpperCase() ,hash)
       
        if(result){
            await this.cacheManager.set('checkCompanyKey' + hash, {status:true}, { ttl: null });

            return {status:true};
        }else {
         
            return {status:false};
        }
    }
    @Post()
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async createSetting(
        @Body() input: CreateSettingDto,


    ) {
        let result = await this.settingService.createSetting(input)
        await this.cacheManager.reset();
        return result;
    }
    @Put('/:hash/:key')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseInterceptors(ClassSerializerInterceptor)
    async updateSetting(
        @Body() input: UpdateSettingDto,
        @Param('hash') hash: string,
        @Param('key') key: string,
    ) {
        if (key != process.env.AUTH_SECRET) {
            throw new UnauthorizedException();
        }
        let result = await this.settingService.getOne(hash)

        if (result) {

            const setting = await this.settingService.updateSetting(result, input, hash);
            this.logger.log('data  return');
            await this.cacheManager.reset();
            this.logger.log('cache cleared ');
            return setting;

        } else {

            throw new NotFoundException("ไม่พบข้อมูล");

        }

    }

}