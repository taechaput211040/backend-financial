import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Cache } from "cache-manager";
import { plainToClass } from "class-transformer";
import { AuthGuardJwt } from "src/auth/autn-guard.jwt";
import { DepositDto } from "src/Input/deposit.dto";
import { SmartService } from "./smart.service";
import { WebsiteService } from "./website.service";


@Controller('api/Smart')
@SerializeOptions({ strategy: 'excludeAll' })
export class SmartApiController {
    private readonly logger = new Logger(SmartApiController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly smartService: SmartService,
        private readonly websiteService: WebsiteService
        // private readonly transectionService: TransectionService,
    ) { }


    @Get('/credithistory/:username')
  
    async getCreditHistory(
        @Param('username') username:string,
        @Query('limit') limit
    ) {
        this.logger.log('getCreditHistory hit');
        // await this.cacheManager.reset();
        this.logger.log(username);
        this.logger.log(limit);

       const result= await this.smartService.credit_history(username,limit)
      
       return result;



    }
    @Post('/Deposit')
    async postDeposit(
        @Body() input:DepositDto
    ) {
        this.logger.log('postDeposit hit');
        // await this.cacheManager.reset();
        this.logger.log(input);

       const result= await this.smartService.deposit(input.username,input.amount)


       return result;



    }
    
 

    @Get('/Provider') 
    async getProvider(
    ) {
        this.logger.log('getProvider hit');
       

 

    
    return [
        {
          "api": "",
          "code": "AB",
          "commission": 0,
          "commission_": "",
          "id": "ef482ac7-f860-4e50-b8e5-26538dbeb7dd",
          "image": "https://api.smart-exchange.io/static/provider/f2238fd12cd0435b8dd18a9c7564f6ea.png",
          "member_created": {},
          "name": "ALLBET",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "f75d5a50-d6c5-4ee6-8547-2537e91f0a7d",
          "type_name": "FISH HUNTER",
          "url": ""
        },
        {
          "api": "",
          "code": "AP",
          "commission": 0,
          "commission_": "",
          "id": "5e532830-77ab-4fa0-9154-5c1d7bd9330f",
          "image": "https://api.smart-exchange.io/static/provider/df2761a6ab6c47f1b0c1bca680d2ad4d.png",
          "member_created": {
            "code": "",
            "credit": 0,
            "id": "2cba21c6-d10a-471f-8368-97aa3e1a2b4d",
            "name": "admin",
            "phone": "09000000",
            "provider_active": null,
            "role": "7c982728-51c5-451e-8b86-510681ee9a0e",
            "status": 1,
            "user": "admin"
          },
          "name": "AMB Poker",
          "percent": 90,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "AM",
          "commission": 0,
          "commission_": "",
          "id": "6400fd9b-1101-402c-b604-fb18518143cb",
          "image": "https://api.smart-exchange.io/static/provider/e75f4e2b54e84122a3096119a3a50717.png",
          "member_created": {},
          "name": "AMEBA",
          "percent": 93,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "AG",
          "commission": 0,
          "commission_": "",
          "id": "41d1224a-a64f-4623-ad5c-799a0a5eea2e",
          "image": "https://api.smart-exchange.io/static/provider/750391bea8c64ba7974072e394fa627d.png",
          "member_created": {},
          "name": "ASIAGAMING",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "86fc589c-8a3e-40d1-99ec-747d4e7893aa",
          "type_name": "SPORTBOOK",
          "url": ""
        },
        {
          "api": "",
          "code": "AV",
          "commission": 0,
          "commission_": "",
          "id": "605cf04c-068b-4b1f-80f4-1608abcc9192",
          "image": "https://api.smart-exchange.io/static/provider/d0e848c76d54442ab4b970835a261ac7.png",
          "member_created": {},
          "name": "AVIA GAMING",
          "percent": 91,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "80bca723-c238-4d6b-b10c-a883312a25d0",
          "type_name": "Esport/HorseRacing",
          "url": ""
        },
        {
          "api": "",
          "code": "S2",
          "commission": 0,
          "commission_": "",
          "id": "b472d31a-35aa-4486-9d85-4e457ff7caa8",
          "image": "https://api.smart-exchange.io/static/provider/db0e1f8d07cc4e669e2d2169896732ff.png",
          "member_created": {},
          "name": "AWC68 SEXY",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "80bca723-c238-4d6b-b10c-a883312a25d0",
          "type_name": "Esport/HorseRacing",
          "url": ""
        },
        {
          "api": "",
          "code": "XP",
          "commission": 0,
          "commission_": "",
          "id": "3c2585b6-fa4a-4400-b5c4-bf031e999090",
          "image": "https://api.smart-exchange.io/static/provider/456c899cddf740d29d79deeea05bec34.png",
          "member_created": {},
          "name": "BETSOFT",
          "percent": 91,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "CB",
          "commission": 0,
          "commission_": "",
          "id": "4c42a0b7-a7d2-41b8-a8c3-053ea1edcc75",
          "image": "https://api.smart-exchange.io/static/provider/0beb06f53601496db5c39f99dbd5203f.png",
          "member_created": {},
          "name": "CITIBET",
          "percent": 78,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "80bca723-c238-4d6b-b10c-a883312a25d0",
          "type_name": "Esport/HorseRacing",
          "url": ""
        },
        {
          "api": "",
          "code": "CQ",
          "commission": 0,
          "commission_": "",
          "id": "4e160063-7783-4c49-a863-4f55f023583d",
          "image": "https://api.smart-exchange.io/static/provider/1d04cb4b946045898c06b670358155d5.png",
          "member_created": {},
          "name": "CQ9 TW",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "19b6afc2-25a2-43ab-bf17-2a071aeca982",
          "type_name": "CARD & BOARDGAME",
          "url": ""
        },
        {
          "api": "",
          "code": "DS",
          "commission": 0,
          "commission_": "",
          "id": "981ea161-dcd4-4a19-9107-c7ef0516d2b4",
          "image": "https://api.smart-exchange.io/static/provider/d55b39d90f024ac4acd10c05347ddc0f.png",
          "member_created": {
            "code": "",
            "credit": 0,
            "id": "2cba21c6-d10a-471f-8368-97aa3e1a2b4d",
            "name": "admin",
            "phone": "09000000",
            "provider_active": null,
            "role": "7c982728-51c5-451e-8b86-510681ee9a0e",
            "status": 1,
            "user": "admin"
          },
          "name": "DragoonSoft",
          "percent": 93,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "DG",
          "commission": 0,
          "commission_": "",
          "id": "3ae20f9f-7671-4645-9b3c-f493228f50a1",
          "image": "https://api.smart-exchange.io/static/provider/ac58751b1c364b8bae11757c3ddc974a.png",
          "member_created": {},
          "name": "DREAM GAMING",
          "percent": 93,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "EP",
          "commission": 0,
          "commission_": "",
          "id": "e6cd8967-8c8e-47ff-92ac-cd4b50f42a17",
          "image": "https://api.smart-exchange.io/static/provider/61b6017912b540cd925e028bebfe5e64.png",
          "member_created": {},
          "name": "EVOPLAY",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "FG",
          "commission": 0,
          "commission_": "",
          "id": "1e0791df-da15-4736-8e5d-285209c751fd",
          "image": "https://api.smart-exchange.io/static/provider/6952cf475026488e85f01e865086c294.png",
          "member_created": {},
          "name": "FUN GAMING",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "GM",
          "commission": 0,
          "commission_": "",
          "id": "e7cfb798-4c2c-4a62-a17e-dd59fdb1ad18",
          "image": "https://api.smart-exchange.io/static/provider/af82d8ee02a6417d862eb4d27d89b0f4.png",
          "member_created": {},
          "name": "GAMATRON",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "GE",
          "commission": 0,
          "commission_": "",
          "id": "c688a426-4600-4db1-b427-8d84a525675b",
          "image": "https://api.smart-exchange.io/static/provider/6123e9e0e7044604bd72decdc8900220.png",
          "member_created": {},
          "name": "GAMINGSOFT EVO GAMING",
          "percent": 90,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "GN",
          "commission": 0,
          "commission_": "",
          "id": "f7abb9dc-8a8b-4384-aafe-8245ec127a9b",
          "image": "https://api.smart-exchange.io/static/provider/577ab7ba8bf448d0b399eb69569688d5.png",
          "member_created": {},
          "name": "GENESIS",
          "percent": 91,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "HB",
          "commission": 0,
          "commission_": "",
          "id": "af3912eb-1b3f-4b21-b97f-0a24c06868f0",
          "image": "https://api.smart-exchange.io/static/provider/f4179444060245fdb89d1f4d6cb73144.png",
          "member_created": {},
          "name": "HABANERO",
          "percent": 91,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "HY",
          "commission": 0,
          "commission_": "",
          "id": "4591efac-9903-40f0-9174-ba535418b2dc",
          "image": "https://api.smart-exchange.io/static/provider/18e62f2751694d7bb96a92780f506fdc.png",
          "member_created": {},
          "name": "HYDAKO TW",
          "percent": 93,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "JL",
          "commission": 0,
          "commission_": "",
          "id": "62c1ab9d-3ed7-470d-bb9a-5c706c23ae87",
          "image": "https://api.smart-exchange.io/static/provider/aa5c5c2a9b9a4409bb69aeeb76699344.png",
          "member_created": {},
          "name": "JILI",
          "percent": 91,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "JK",
          "commission": 0,
          "commission_": "",
          "id": "93468f21-b21e-4945-b856-a3ddcd0486e9",
          "image": "https://api.smart-exchange.io/static/provider/42e834502d904504ae959057231bb05b.png",
          "member_created": {},
          "name": "JOKER",
          "percent": 90,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "L4",
          "commission": 0,
          "commission_": "",
          "id": "971d777d-ebbc-468d-a9c6-8cd61037c6ee",
          "image": "https://api.smart-exchange.io/static/provider/7db06952b07e41bfad3754f03d3811f0.png",
          "member_created": {},
          "name": "LIVE22NEW",
          "percent": 88,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "FI",
          "commission": 0,
          "commission_": "",
          "id": "5ca8cbb8-d2bb-483f-8d31-f2bb44f68a08",
          "image": "https://api.smart-exchange.io/static/provider/d1e7c920fb0242e0ae715f213cbfcad7.png",
          "member_created": {},
          "name": "MAVERICK",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "PG",
          "commission": 0,
          "commission_": "",
          "id": "8215c7f5-6f2d-4d76-8f8a-b2701971ffa4",
          "image": "https://api.smart-exchange.io/static/provider/ba2485cf24574f91b676b623247ecb4d.png",
          "member_created": {},
          "name": "PGSOFT TW",
          "percent": 90,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "PX",
          "commission": 0,
          "commission_": "",
          "id": "39b1357f-3154-40aa-8cd8-7bb59f859359",
          "image": "https://api.smart-exchange.io/static/provider/07b8eaf9efeb40dfb1dfd6ec6aa19e31.png",
          "member_created": {},
          "name": "PlayTechTCG TW",
          "percent": 88,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "PR",
          "commission": 0,
          "commission_": "",
          "id": "292f6da8-8348-4ceb-a398-3dfa8aa8cd59",
          "image": "https://api.smart-exchange.io/static/provider/d4c3f9b615da453790de2d44bf4ab055.png",
          "member_created": {},
          "name": "PRAGMATIC TW",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "19b6afc2-25a2-43ab-bf17-2a071aeca982",
          "type_name": "CARD & BOARDGAME",
          "url": ""
        },
        {
          "api": "",
          "code": "RE",
          "commission": 0,
          "commission_": "",
          "id": "da9f8b16-1f9d-4eec-b093-1f6b5919d73a",
          "image": "https://api.smart-exchange.io/static/provider/2da163ee3d41465fa6183500ca2a7a97.png",
          "member_created": {},
          "name": "Red Tiger",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "SA",
          "commission": 0,
          "commission_": "",
          "id": "f8db19ce-c5f8-448e-b3d4-2660b946c1b9",
          "image": "https://api.smart-exchange.io/static/provider/fb91aa6a18294444bca37d23e4ddf354.png",
          "member_created": {},
          "name": "SAGAMING TW",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "SO",
          "commission": 0,
          "commission_": "",
          "id": "108c5d10-8a7c-45db-899f-2b7ff9801aab",
          "image": "https://api.smart-exchange.io/static/provider/361d3d5ddd8a452393131ffdc0053afe.png",
          "member_created": {},
          "name": "SBO SPORTSBOOK",
          "percent": 86,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "86fc589c-8a3e-40d1-99ec-747d4e7893aa",
          "type_name": "SPORTBOOK",
          "url": ""
        },
        {
          "api": "",
          "code": "SY",
          "commission": 0,
          "commission_": "",
          "id": "8a0df949-f452-4a0a-814e-b79ff68c8863",
          "image": "https://api.smart-exchange.io/static/provider/8497ed5a2d7a46cbacca4056813d98c4.png",
          "member_created": {},
          "name": "SIMPLE PLAY TW",
          "percent": 94,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "SG",
          "commission": 0,
          "commission_": "",
          "id": "0978ccc1-9f3a-4a1c-9c29-88c7587b357f",
          "image": "https://api.smart-exchange.io/static/provider/d4dcf11e7a044459a2dd5e89cee8a264.png",
          "member_created": {},
          "name": "SPADE GAMING",
          "percent": 90,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "aaad3dd9-e6ca-4eb9-9ea5-b3d3f7b4079e",
          "type_name": "SLOTS",
          "url": ""
        },
        {
          "api": "",
          "code": "UF",
          "commission": 0,
          "commission_": "",
          "id": "bfd8b630-06fc-4f64-a167-5435ab30964b",
          "image": "https://api.smart-exchange.io/static/provider/b6f0a9c2eb0d4f66ae160ee775f49798.png",
          "member_created": {},
          "name": "UFA SPORTBOOK",
          "percent": 90,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "86fc589c-8a3e-40d1-99ec-747d4e7893aa",
          "type_name": "SPORTBOOK",
          "url": ""
        },
        {
          "api": "",
          "code": "VV",
          "commission": 0,
          "commission_": "",
          "id": "38024393-be34-4d33-9acd-cd498d54d7d3",
          "image": "https://api.smart-exchange.io/static/provider/c82b7f2b6ee54ffd835b2adbdb003bee.png",
          "member_created": {},
          "name": "VIVO GAMING TW",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
        {
          "api": "",
          "code": "WB",
          "commission": 0,
          "commission_": "",
          "id": "47d6dab0-4d40-407a-9cd5-16a32a316beb",
          "image": "https://api.smart-exchange.io/static/provider/81da897182f444f992720313a40051df.png",
          "member_created": {},
          "name": "WBET",
          "percent": 92,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "86fc589c-8a3e-40d1-99ec-747d4e7893aa",
          "type_name": "SPORTBOOK",
          "url": ""
        },
        {
          "api": "",
          "code": "WC",
          "commission": 0,
          "commission_": "",
          "id": "66a865bb-e32a-4274-9125-7147ad1b1fdc",
          "image": "https://api.smart-exchange.io/static/provider/1363fec743014890a386f91e322175d4.png",
          "member_created": {},
          "name": "WM CASINO",
          "percent": 93,
          "percent_": "",
          "signature": "",
          "status": 1,
          "status_": "",
          "type": "b5521a0a-f2cb-4ce9-a3b0-9781606c5719",
          "type_name": "LIVE-CASINO",
          "url": ""
        },
       
      ];
    }


    @Post('/Credit')
    async checkCredit(
        @Body() input:any
    ) {
        this.logger.log('checkCredit hit');
        // await this.cacheManager.reset();
        this.logger.log(input);

       const result= await this.smartService.checkCredit(input.username,input.provider_code)

       
       return result;



    }
    @Post('/Repair')
    async repaireCredit(
      @Query('username') username,
      @Query('active') active_provider,
        @Body() input:any
    ) {
        this.logger.log('repaireCredit hit');
        // await this.cacheManager.reset();
        this.logger.log(input);
        let sum = 0;
        console.log('start ' +sum)
// return
        for (let i = 0; i < input.length; i++) {
          let a :any = await this.smartService.checkCredit(input[i].Username,input[i].ProviderCode)
          console.log('doing loop'+i+ ' sum ' +sum)
          if( parseInt(a.balance) > 0){
            console.log('doing loop'+i+ ' balance ' +a.balance)
            const temp_credit = parseInt(a.balance)
            sum += temp_credit
            console.log('doing loop'+i+ ' temp_withdraw ' +temp_credit)
            await this.smartService.withdraw_provider(username,temp_credit,input[i].ProviderCode)
          }
         

        }

        if(sum > 0){
         const y = await this.smartService.deposit_provider(username,sum,active_provider)
          console.log('end ' +sum)
          console.log( y)
          return {sum:sum,
          status:'success',
        logs:y};
        }
        console.log('end do nothing ' +sum)
        return {sum:sum,
          status:'success'};
        



       
     



    }
    // @Post('/Deposit')
    // async postDeposit(
    //     @Body() input:DepositDto
    // ) {
    //     this.logger.log('postDeposit hit');
    //     // await this.cacheManager.reset();
    //     this.logger.log(input);

    //    const result= await this.smartService.deposit(input.username,input.amount)


    //    return result;



    // }
    // @Post('/Provider/DP')
    // async postDepositProvider(
    //     @Body() input:DepositDto
    // ) {
    //     this.logger.log('postDepositProvider hit');
    //     // await this.cacheManager.reset();
    //     this.logger.log(input);

    //    const result= await this.smartService.depositProvider(input.username,input.amount)

       
    //    return result;



    // }
    // @Post('/Provider/WD')
    // async postWithdrawProvider(
    //     @Body() input:DepositDto
    // ) {
    //     this.logger.log('postWithdrawProvider hit');
    //     // await this.cacheManager.reset();
    //     this.logger.log(input);

    //    const result= await this.smartService.withdrawProvidernpm(input.username,input.amount)


    //    return result;



    // }
    @Post('/Withdraw')
    async postWithdraw(
        @Body() input:DepositDto
    ) {
        this.logger.log('postWithdraw hit');
        // await this.cacheManager.reset();
        this.logger.log(input);

       const result= await this.smartService.withdraw(input.username,input.amount)

       
       return result;



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