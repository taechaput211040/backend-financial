import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Cache } from "cache-manager";
import { plainToClass } from "class-transformer";
import { AuthGuardJwt } from "src/auth/autn-guard.jwt";
import { UserService } from "./user.service";


@Controller('api/User')
@SerializeOptions({ strategy: 'excludeAll' })
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private readonly userService: UserService
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