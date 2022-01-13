import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Cache } from "cache-manager";
import { plainToClass } from "class-transformer";
import { AuthGuardJwt } from "src/auth/autn-guard.jwt";
import { SmartService } from "src/Website/smart.service";
import { TopupRefDto } from "./create.topup.ref.dto";
import { PinValidateDto } from "./pin.validate.ref.dto";
import { TopupRefService } from "./topupref.service";


@Controller('api/Topup')
@SerializeOptions({ strategy: 'excludeAll' })
export class TopupRefController {
    private readonly logger = new Logger(TopupRefController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private readonly topupRefService: TopupRefService,
        private readonly smartService: SmartService
        // private readonly transectionService: TransectionService,
    ) { }

    @Get('/Transaction')
    @UseInterceptors(ClassSerializerInterceptor)
    async getTopupTransactionNoPin(

       
    ) {
        this.logger.log('getTopupTransactionNoPin  hit');
        // await this.cacheManager.reset();


       const topup_record = await this.topupRefService.getTopupListNoPin()
        if(topup_record){
            return topup_record
        } else {
            return []
        }
      
    }
    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    async generatereRefandPin(

        @Body() input:TopupRefDto
    ) {
        this.logger.log('generatereRefandPin  hit');
        // await this.cacheManager.reset();


       const topup_record = await this.topupRefService.createTopupTransaction(input)

       const result =  await this.topupRefService.sendPinToLineNotify(topup_record)
       return topup_record
        this.logger.log('cache cleared  ');
    }
    @Post('/Validate')
    async validateRecievePin(

        @Body() input:PinValidateDto
    ) {
        this.logger.log('validateRecievePin  hit');
        // await this.cacheManager.reset();


       const valid = await this.topupRefService.validatePin(input)
       
        if(valid){
            this.logger.log(valid.username);
            const topup_result =  await this.smartService.depositMain(valid)
            await this.topupRefService.updateStatus(valid)
            return topup_result
        }
        else{
            throw new BadRequestException({message:'PIN ไม่ถูกต้อง'})
        }
    
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