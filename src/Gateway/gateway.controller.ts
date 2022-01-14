import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Redirect, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";

import { Cache } from "cache-manager";
import { plainToClass } from "class-transformer";
import { Request } from "express";
import { AuthGuardJwt } from "src/auth/autn-guard.jwt";
import { SetTurnDto } from "src/Input/setturn.dto";
import { WebsiteDto } from "src/Input/website.dto";
import { ProviderBOService } from "src/provider_bo/provider_bo.service";
import { GatewayService } from "./gateway.service";


@Controller('api/Gateway')
@SerializeOptions({ strategy: 'excludeAll' })
export class GatewayController {
    private readonly logger = new Logger(GatewayController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private readonly gatewayService: GatewayService
        // private readonly transectionService: TransectionService,
    ) { }


    @Get('/Info')
    @UseInterceptors(ClassSerializerInterceptor)
    async getInfoPlay(
        @Req() request: Request
    ) {
        this.logger.log('getInfoPlay  hit');
       
    }
    @Get('/Bank/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getBank(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param('username')username : string,
    ) {
        this.logger.log('getBank  hit');
       
        return await this.gatewayService.getDepositBank(hash,username)
    }

    @Get('/Credit/:username/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    async getCredit(
        @Req() request: Request, @Param("username") username :string,@Param("id") id:string
    ) {
        this.logger.log('getCredit  hit');
       return await this.gatewayService.getCredit(username,id,request.headers['authorization'])
    }
    @Get('/History/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getHistory(
        @Req() request: Request,
        @Param("username") username :string,@Param("hash") hash:string
    ) {
        this.logger.log('getHistory  hit');
        return await this.gatewayService.getHistory(hash,username)
    }
    @Get('/Account/Message')
    @UseInterceptors(ClassSerializerInterceptor)
    async getMessage(
        @Req() request: Request
    ) {
        this.logger.log('getMessage  hit');
       
    }

    @Get('/Contact/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getContact(
        @Req() request: Request,
        @Param("hash") hash:string
    ) {
        this.logger.log('getContact  hit');
        return await this.gatewayService.getContact(hash)
    }

    @Get('/Provider/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getGroup(
        @Req() request: Request,
        @Param("hash") hash:string
    ) {
        this.logger.log('getGroup  hit');
        return await this.gatewayService.getGamelist(hash)
    }

    @Get('/Retokenmember')
    @UseInterceptors(ClassSerializerInterceptor)
    async getRetokenmember(
        @Req() request: Request
    ) {
        this.logger.log('getRetokenmember  hit');
       
    }


    @Get('/Static')
    @UseInterceptors(ClassSerializerInterceptor)
    async getStatic(
        @Req() request: Request
    ) {
        this.logger.log('getStatic  hit');
       
    }

    @Get('/Gamelist/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getGamelist(
        @Req() request: Request,
        @Param("hash") hash:string
    ) {
        this.logger.log('getGamelist  hit');
       return await this.gatewayService.getGamelist(hash)
    }


    @Get('/Adminmember/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getAdminmember(
        @Req() request: Request,
        @Param("hash") hash:string
    ) {
        this.logger.log('getAdminmember  hit');
        return await this.gatewayService.getAdminMember(hash)
       
    }

    @Get('/Wheel/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getWheel(
        @Req() request: Request,
        @Param("hash") hash:string
    ) {
        this.logger.log('getWheel  hit');
        return await this.gatewayService.getWheel(hash)
    }

    @Get('/WheelCheck/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getWheelCheck(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string
    ) {
        this.logger.log('getWheelCheck  hit');
        return await this.gatewayService.getWheelCheck(hash,username)
    }
    @Get('/Checkin/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getCheckin(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string
    ) {
        this.logger.log('getWheelCheck  hit');
        return await this.gatewayService.getCheckinData(hash,username)
    }
    @Post('/Checkin/:hash/:username/:day')
    @UseInterceptors(ClassSerializerInterceptor)
    async postCheckinDay(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string,
        @Param("day") day:string,
        @Body() input:any
    ) {
        this.logger.log('postCheckinDay  hit');
        return await this.gatewayService.postCheckinDay(hash,username,day,input)
    }
    @Post('/CheckinBonus/:hash/:username/:day')
    @UseInterceptors(ClassSerializerInterceptor)
    async postCheckinBonus(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string,
        @Param("day") day:string,
        @Body() input:any
    ) {
        this.logger.log('postCheckinBonus  hit');
        return await this.gatewayService.postCheckinBonus(hash,username,day,input)
    }
    @Get('/GameRedirect')
    @Redirect('', 302)
    @UseInterceptors(ClassSerializerInterceptor)
    async getGameRedirect(
        @Req() request: Request,
        @Query("type_id") type_id,
        @Query("provider_id") provider_id,
        @Query("game_id") game_id,
        @Query("provider_code") provider_code,
        @Query("is_mobile") is_mobile,
        @Query("authorization") authorization
    ) {
        this.logger.log('getGameRedirect  hit');
        var base64Url = authorization.split('.')[1];
        let jwt_string = Buffer.from(base64Url, 'base64').toString()
        const jwt = JSON.parse(jwt_string)
        this.logger.log(jwt);
        console.log(request.headers)
        console.log(request.headers.cookie)
        console.log(request.headers['cf-connecting-ip'])
        console.log(request.headers['user-agent'])
   
        
        let check:any = await this.gatewayService.checkMaintenance(request.headers,jwt,provider_code,game_id,is_mobile)
        console.log(check)
        if(!check.status){
            return check
        }
        
        let res:any = await this.gatewayService.lunchGame(authorization,type_id,provider_id,provider_code,is_mobile,game_id)
        
        if(res.status == 404){
            return res
        }
        console.log(res)
        return res
    //   return   { url: 'https://google.com/' };
    }
    @Get('/Promotion/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getPromotion(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string,
    ) {
        this.logger.log('getPromotion  hit');
        const a =  await this.gatewayService.getPromotion(hash,username)
        this.logger.log(a);
        return a
    }
    @Get('/PromotionRegister/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async getPromotionRegister(
        @Req() request: Request,
        @Param("hash") hash:string
    ) {
        this.logger.log('getPromotionRegister  hit');
        const a =  await this.gatewayService.getPromotionRegister(hash)
        this.logger.log(a);
        return a
    }
    @Get('/PromotionAuth/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async PromotionAuth(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string,
    ) {
        this.logger.log('PromotionAuth  hit');
        const a =  await this.gatewayService.getPromotionAuth(hash,username)
        this.logger.log(a);
        return a
    }
    @Put('/Promotion/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async ChangePromotion(
        @Req() request: Request,
        @Param("hash") hash:string,
        @Param("username") username:string,
        @Body() input:any
    ) {
        this.logger.log('ChangePromotion  hit');
        const a =  await this.gatewayService.changePromotionMember(hash,username,input.id)
        this.logger.log(a);
        return a
    }
    @Get('/SiteSetting')
    @UseInterceptors(ClassSerializerInterceptor)
    async getSiteSetting(
        @Req() request: Request
    ) {
        this.logger.log('getSiteSetting  hit');
       
    }

    @Get('/SiteSetting/Reset')
    @UseInterceptors(ClassSerializerInterceptor)
    async getResetCache(
        @Req() request: Request
    ) {
        this.logger.log('getResetCache  hit');
       
    }

    @Get('/ClearDp7Days')
    @UseInterceptors(ClassSerializerInterceptor)
    async getClearDp7Days(
        @Req() request: Request
    ) {
        this.logger.log('getClearDp7Days  hit');
       
    }
    @Post('/Login')
    @UseInterceptors(ClassSerializerInterceptor)
    async postLogin(
        @Query('username') username,
        @Query('password') password
    ) {
        this.logger.log('postLogin  hit');
  

    }

    @Get('/WithdrawCheck/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async postWithdrawCheck(
        @Param('hash') hash:string,
        @Param('username') username:string
    ) {
        this.logger.log('postWithdraw  hit');
        return await this.gatewayService.getWithdrawCheck(hash,username)


    }

    @Post('/WithdrawConfirm/:hash')
    @HttpCode(200)
    @UseInterceptors(ClassSerializerInterceptor)
    async postWithdraw(
        @Param('hash') hash:string,
        @Body() input:object
    ) {
        this.logger.log('postWithdraw  hit');
        this.logger.log(input);
        return await this.gatewayService.postWithdrawConfirm(hash,input)
  

    }
    @Post('/Changepassword/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async postChangepassword(
        @Param("hash") hash:string,
        @Body() input:object
    ) {
        this.logger.log('postChangepassword  hit');
        return await this.gatewayService.changePassword(hash,input)

    }

    @Post('/Register/:hash')
    @UseInterceptors(ClassSerializerInterceptor)
    async postRegister(
        @Param("hash") hash:string,
        @Body() input:any
    ) {
        this.logger.log('postRegister  hit');
        this.logger.log(input);
        let res = await this.gatewayService.postRegister(hash,input)
        return res;
    }

    
    @Post('/Register/Phone')
    @UseInterceptors(ClassSerializerInterceptor)
    async postRegisterPhoneCheck(
        @Query('username') username,
        @Query('password') password
    ) {
        this.logger.log('postRegisterPhoneCheck  hit');
  

    }

    @Post('/Register/Inquiry')
    @UseInterceptors(ClassSerializerInterceptor)
    async postRegisterInquiry(
        @Query('username') username,
        @Query('password') password
    ) {
        this.logger.log('postRegisterInquiry  hit');
  

    }

    @Post('/Promotion')
    @UseInterceptors(ClassSerializerInterceptor)
    async postPromotion(
        @Query('username') username,
        @Query('password') password
    ) {
        this.logger.log('postPromotion  hit');
  

    }
    @Get('/CashbackCheck/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getCachbackCheck(
        @Param("hash") hash:string,
        @Param('username')username : string,
        
    ) {
        this.logger.log('getCachbackCheck  hit');
        return await this.gatewayService.getCashbackCheck(hash,username)

    }
    @Get('/CachbackCollect/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async postCachbackCollect(
        @Param("hash") hash:string,
        @Param('username')username : string,
    ) {
        this.logger.log('postCachbackCollect  hit');
        return await this.gatewayService.getCashbackCollect(hash,username)


    }
    @Get('/Cashback/:hash/:username')
    @UseInterceptors(ClassSerializerInterceptor)
    async getCachback(
        @Param("hash") hash:string,
        @Param('username')username : string,
        
    ) {
        this.logger.log('getCachback  hit');
        return await this.gatewayService.getCashback(hash,username)

    }
   
 

    
    @Post('/Cachback/dp7Dayscollect')
    @UseInterceptors(ClassSerializerInterceptor)
    async postCachbackdp7Dayscollect(
        @Query('username') username,
        @Query('password') password
    ) {
        this.logger.log('postCachbackdp7Dayscollect  hit');
  

    }
    

  

}
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};