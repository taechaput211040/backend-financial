import { Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, Inject, Logger, NotFoundException, Param, Patch, Post, Req, SerializeOptions, UnauthorizedException, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { DepositNotifyDto } from 'src/Input/create.deposit.notify.dto';
import { CreateNotifyDto } from 'src/Input/create.notify.setting.dto';
import { RegisterNotifyDto } from 'src/Input/create.register.notify.dto';
import { WithdrawNotifyDto } from 'src/Input/create.withdraw.notify.dto';
import { UpdateNotifyDto } from 'src/Input/update.notify.dto';
import { NotifyService } from './notify.service';
import { Cache } from "cache-manager";
@Controller('api/Notify')
@SerializeOptions({ strategy: 'excludeAll' })
export class NotifyController {
    private readonly logger = new Logger(NotifyController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly notifyService: NotifyService
     

    ) { }
        @Get('/:hash')
        async getNotifySetting(
            @Param('hash') hash: string
        ) {
            this.logger.log('getNotifySetting  hit');
            this.logger.log(hash);
            // const value = await this.cacheManager.get('get_noti_setting' + hash);
            //    if (value) {

            // this.logger.log('cache  return');
            // return value;

            //  }
            const a = await this.notifyService.getSettingByHash(hash)
            if(!a) throw new NotFoundException()
            await this.cacheManager.set('get_noti_setting' + hash, a, { ttl: null });
            return a 
        }


    @Post('/Dp/:hash')
    @UsePipes(new ValidationPipe({ transform: true }))
    async depositPushNotify(
        @Param('hash') hash: string,
        @Body() input:DepositNotifyDto
    ) {
        this.logger.log(hash);
        this.logger.log('depositPushNotify hit');
        await this.cacheManager.del('get_noti_setting' + hash);

        const a = await this.notifyService.getSettingByHash(hash)
        if(!a) throw new NotFoundException()

        const dp =  await this.notifyService.saveDepositTransaction(input)

        await this.notifyService.pushDeposit(a,dp)
    }
    @Post('/Wd/:hash')
    @UsePipes(new ValidationPipe({ transform: true }))
    async withdrawPushNotify( 
        @Param('hash') hash: string,
        @Body() input:WithdrawNotifyDto
    ) {
        
        const a = await this.notifyService.getSettingByHash(hash)
        if(!a) throw new NotFoundException()

        const wd =  await this.notifyService.saveWithdrawTransaction(input)
        await this.cacheManager.del('get_noti_setting' + hash);
        await this.notifyService.pushWithdraw(a,wd)
    }
    @Post('/Regis/:hash')
    @UsePipes(new ValidationPipe({ transform: true }))
    async memberRegisterPushNotify(
        @Param('hash') hash: string,
        @Body() input:RegisterNotifyDto
    ) {
        
        const a = await this.notifyService.getSettingByHash(hash)
        if(!a) throw new NotFoundException()

        const rg =  await this.notifyService.saveRegisterTransaction(input)
        await this.cacheManager.del('get_noti_setting' + hash);
        await this.notifyService.pushRegister(a,rg)
    }
    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    @UsePipes(new ValidationPipe({ transform: true }))
    async createNotifySetting(
        @Body() input: CreateNotifyDto,
        @Req() request : Request
    ) {
        if(request.headers['key'] != process.env.AUTH_SECRET) throw new UnauthorizedException()
     
        return await this.notifyService.createSetting(input)
    
    }
    @Patch('/:hash')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateWebNotify(
        @Param('hash') hash: string,
        @Body() input: UpdateNotifyDto,
        @Req() request : Request
    ) {
        
        if(request.headers['key'] != process.env.AUTH_SECRET) throw new UnauthorizedException()
        let b = await this.notifyService.getSettingByHash(hash)
        this.logger.log(hash)
        if(!b) throw new NotFoundException()
        await this.cacheManager.del('get_noti_setting' + hash);
        return await this.notifyService.updateSetting(b,input)
    }

   
    @Delete('/:hash')
    async deleteNotifySetting(
        @Param('hash') hash: string,
        @Req() request : Request
    ) {  if(request.headers['key'] != process.env.AUTH_SECRET) throw new UnauthorizedException()

    // return await this.notifyService.dele(input)
}

}