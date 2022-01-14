import { BadRequestException, CACHE_MANAGER, HttpService, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AxiosResponse } from 'axios'; import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { Website } from 'src/Entity/website.entity';
import { WebsiteDto } from 'src/Input/website.dto';
import { SetTurnDto } from 'src/Input/setturn.dto';
import { isRFC3339 } from 'class-validator';
import { Cache } from "cache-manager";
@Injectable()
export class GatewayService {
    private readonly logger = new Logger(GatewayService.name)
    constructor(
        private httpService: HttpService,
        @InjectRepository(Website)
        private readonly WebsiteRepository: Repository<Website>,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

    ) {

    }
    private getEventsBaseQuery(): SelectQueryBuilder<Website> {
        return this.WebsiteRepository
            .createQueryBuilder('s')

    }
    public async createWebsite(location: string, key: string, company: string, agent: string, template: number, page: string) {


    }
    public async findMany(hash: string, Website: string) {
        //     return await this.WebsiteRepository.find({

        //         order: { order: 'ASC' }
        //         , where: {
        //             hash: hash,
        //             Website: Website
        //         }
        //     });




    }



    public async getWebInfo(website: string): Promise<Website> {
        return await this.WebsiteRepository.findOne({
            select: ['website'],
            where: {
                website: website,

            }
        });
    }
    public async getWebInfoByHash(hash: string): Promise<Website> {
        return await this.WebsiteRepository.findOne({
            select: ['website'],
            where: {
                microservice_hash: hash,

            }
        });
    }
    public async getWebInfoByHashAllData(hash: string): Promise<Website> {
        return await this.WebsiteRepository.findOne({
           
            where: {
                microservice_hash: hash,

            }
        });
    }
    public async getMemberTUrn(username: string, web: Website, provider?: string, type?: string): Promise<AxiosResponse | object> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.RICO_AUTH}`,
        };
        const test_base = 'http://127.0.0.1:8000'
        const url_membercheck = 'https://rico.'+web.website+'/api/Support/membercheck/'+username.toLowerCase().trim()
        const url_getCredit = 'https://rico.'+web.website+'/api/Support/getcredit/'+username.toLowerCase().trim()
        const url_winlose = 'https://rico.'+web.website+'/api/Support/winlose/'+username.toLowerCase().trim()
        // const url_membercheck = test_base + '/api/Support/membercheck/' + username.toLowerCase().trim()
        // const url_getCredit = test_base + '/api/Support/getcredit/' + username.toLowerCase().trim()
        // const url_winlose = test_base + '/api/Support/winlose/' + username.toLowerCase().trim()
        // const url_realtime = 'https://rico.'+web.website+'/api/Support/Realtime'
        // //         Route::get('/Support/membercheck/{searchinput}', 'App\Http\Controllers\Api\MemberCheckController')
        // ->name('find.memberSupport.check')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/getcredit/{user}', 'App\Http\Controllers\Api\TestApiController1')
        // ->name('api.getcreditSupport.user')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/winlose/{user}', 'App\Http\Controllers\Api\GetWinLoseController')
        // ->name('api.getwinloseSupport.user')->withoutMiddleware('auth:sanctum');
        if (!provider) {
            provider = null
        }
        if (!type) {
             type = null
            
            }
        try {
            this.logger.log(url_membercheck)
            this.logger.log('rico fired')
            const result = await this.httpService.get(url_membercheck, { headers: headersRequest }).toPromise();
            const result2 = await this.httpService.get(url_getCredit, { headers: headersRequest }).toPromise();
            const result3 = await this.httpService.get(url_winlose, { headers: headersRequest }).toPromise();
            // const result4 = await this.httpService.post(url_realtime, { username: username, provider: provider, type: type }, { headers: headersRequest }).toPromise();



            await Promise.all([result, result2, result3])
            this.logger.log('rico returned')
            return {
                turn: result.data,
                credit: result2.data,
                winlose: result3.data

            };
        } catch (error) {
            this.logger.log('rico Error')
            return {
                message: 'error',
                data: error.response.data,

            };

        }
    }
    public async getMemberInfo(username: string, web: Website): Promise<AxiosResponse | object> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.RICO_AUTH}`,
        };
        const test_base = 'http://127.0.0.1:8000'
        // const url_membercheck = 'https://rico.'+web.website+'/api/Support/membercheck/'+username.toLowerCase().trim()
        // const url_getCredit = 'https://rico.'+web.website+'/api/Support/getcredit/'+username.toLowerCase().trim()
        // const url_winlose = 'https://rico.'+web.website+'/api/Support/winlose/'+username.toLowerCase().trim()
        const url_memberdetail = 'https://rico.'+web.website+'/api/Support/memberinfo/' + username.toLowerCase().trim()
    
        
        //         Route::get('/Support/membercheck/{searchinput}', 'App\Http\Controllers\Api\MemberCheckController')
        // ->name('find.memberSupport.check')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/getcredit/{user}', 'App\Http\Controllers\Api\TestApiController1')
        // ->name('api.getcreditSupport.user')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/winlose/{user}', 'App\Http\Controllers\Api\GetWinLoseController')
      
        try {
            this.logger.log(url_memberdetail)
            this.logger.log('rico fired')
            const result = await this.httpService.get(url_memberdetail, { headers: headersRequest }).toPromise();
            // const result2 = await this.httpService.get(url_getCredit, { headers: headersRequest }).toPromise();
            // const result3 = await this.httpService.get(url_winlose, { headers: headersRequest }).toPromise();
            // const result4 = await this.httpService.post(url_realtime, { username: username, provider: provider, type: type }, { headers: headersRequest }).toPromise();



          
            this.logger.log('rico returned')
            return {
                info: result.data.data

            };
        } catch (error) {
            this.logger.log('rico Error')
            return {
                message: 'error',
                data: error.response.data,

            };

        }
    }
    public async getMemberDepositAllDay(username: string, web: Website): Promise<AxiosResponse | object> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.RICO_AUTH}`,
        };
        const test_base = 'http://127.0.0.1:8000'
        // const url_membercheck = 'https://rico.'+web.website+'/api/Support/membercheck/'+username.toLowerCase().trim()
        // const url_getCredit = 'https://rico.'+web.website+'/api/Support/getcredit/'+username.toLowerCase().trim()
        // const url_winlose = 'https://rico.'+web.website+'/api/Support/winlose/'+username.toLowerCase().trim()
        // const url_memberdetail = test_base + '/api/Support/memberinfo/' + username.toLowerCase().trim()
        const url_member_dp = 'https://rico.'+web.website+'/api/Support/memberDP/' + username.toLowerCase().trim() +'/Allday'
        // const url_member_wd = test_base + '/api/Support/memberWD/' + username.toLowerCase().trim()
        
        //         Route::get('/Support/membercheck/{searchinput}', 'App\Http\Controllers\Api\MemberCheckController')
        // ->name('find.memberSupport.check')->withoutMiddleware('auth:sanctum');
 
        // Route::get('/Support/getcredit/{user}', 'App\Http\Controllers\Api\TestApiController1')
        // ->name('api.getcreditSupport.user')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/winlose/{user}', 'App\Http\Controllers\Api\GetWinLoseController')
      
        try {
            this.logger.log(url_member_dp)
            this.logger.log('rico fired')
            const result = await this.httpService.get(url_member_dp, { headers: headersRequest }).toPromise();
            // const result2 = await this.httpService.get(url_getCredit, { headers: headersRequest }).toPromise();
            // const result3 = await this.httpService.get(url_winlose, { headers: headersRequest }).toPromise();
            // const result4 = await this.httpService.post(url_realtime, { username: username, provider: provider, type: type }, { headers: headersRequest }).toPromise();



          
            this.logger.log('rico returned')
            return {
                amount: result.data

            };
        } catch (error) {
            this.logger.log('rico Error')
            return {
                message: 'error',
                data: error.response.data,

            };

        }
    }
    public async getMemberDeposit(username: string, web: Website): Promise<AxiosResponse | object> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.RICO_AUTH}`,
        };
        const test_base = 'http://127.0.0.1:8000'
        // const url_membercheck = 'https://rico.'+web.website+'/api/Support/membercheck/'+username.toLowerCase().trim()
        // const url_getCredit = 'https://rico.'+web.website+'/api/Support/getcredit/'+username.toLowerCase().trim()
        // const url_winlose = 'https://rico.'+web.website+'/api/Support/winlose/'+username.toLowerCase().trim()
        // const url_memberdetail = test_base + '/api/Support/memberinfo/' + username.toLowerCase().trim()
        const url_member_dp = 'https://rico.'+web.website+'/api/Support/memberDP/' + username.toLowerCase().trim()
        // const url_member_wd = test_base + '/api/Support/memberWD/' + username.toLowerCase().trim()
        
        //         Route::get('/Support/membercheck/{searchinput}', 'App\Http\Controllers\Api\MemberCheckController')
        // ->name('find.memberSupport.check')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/getcredit/{user}', 'App\Http\Controllers\Api\TestApiController1')
        // ->name('api.getcreditSupport.user')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/winlose/{user}', 'App\Http\Controllers\Api\GetWinLoseController')
      
        try {
            this.logger.log(url_member_dp)
            this.logger.log('rico fired')
            const result = await this.httpService.get(url_member_dp, { headers: headersRequest }).toPromise();
            // const result2 = await this.httpService.get(url_getCredit, { headers: headersRequest }).toPromise();
            // const result3 = await this.httpService.get(url_winlose, { headers: headersRequest }).toPromise();
            // const result4 = await this.httpService.post(url_realtime, { username: username, provider: provider, type: type }, { headers: headersRequest }).toPromise();



          
            this.logger.log('rico returned')
            return {
                info: result.data.data

            };
        } catch (error) {
            this.logger.log('rico Error')
            return {
                message: 'error',
                data: error.response.data,

            };

        }
    }
    public async getMemberWithdraw(username: string, web: Website): Promise<AxiosResponse | object> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.RICO_AUTH}`,
        };
        const test_base = 'http://127.0.0.1:8000'
        // const url_membercheck = 'https://rico.'+web.website+'/api/Support/membercheck/'+username.toLowerCase().trim()
        // const url_getCredit = 'https://rico.'+web.website+'/api/Support/getcredit/'+username.toLowerCase().trim()
        // const url_winlose = 'https://rico.'+web.website+'/api/Support/winlose/'+username.toLowerCase().trim()
        // const url_memberdetail = test_base + '/api/Support/memberinfo/' + username.toLowerCase().trim()
        // const url_member_dp = test_base + '/api/Support/memberDP/' + username.toLowerCase().trim()
        const url_member_wd = 'https://rico.'+web.website+'/api/Support/memberWD/' + username.toLowerCase().trim()
        
        //         Route::get('/Support/membercheck/{searchinput}', 'App\Http\Controllers\Api\MemberCheckController')
        // ->name('find.memberSupport.check')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/getcredit/{user}', 'App\Http\Controllers\Api\TestApiController1')
        // ->name('api.getcreditSupport.user')->withoutMiddleware('auth:sanctum');

        // Route::get('/Support/winlose/{user}', 'App\Http\Controllers\Api\GetWinLoseController')
      
        try {
            this.logger.log(url_member_wd)
            this.logger.log('rico fired')
            const result = await this.httpService.get(url_member_wd, { headers: headersRequest }).toPromise();
            // const result2 = await this.httpService.get(url_getCredit, { headers: headersRequest }).toPromise();
            // const result3 = await this.httpService.get(url_winlose, { headers: headersRequest }).toPromise();
            // const result4 = await this.httpService.post(url_realtime, { username: username, provider: provider, type: type }, { headers: headersRequest }).toPromise();



          
            this.logger.log('rico returned')
            return {
                info: result.data.data

            };
        } catch (error) {
            this.logger.log('rico Error')
            return {
                message: 'error',
                data: error.response.data,

            };

        }
    }
    public async getRealtime(username: string, provider?: string, type?: string): Promise<AxiosResponse | object> {

        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${process.env.RICO_AUTH}`,
        };
        const test_base = 'http://127.0.0.1:8000'
        // const url_membercheck = 'https://rico.'+web.website+'/api/Support/membercheck/'+username.toLowerCase().trim()
        // const url_getCredit = 'https://rico.'+web.website+'/api/Support/getcredit/'+username.toLowerCase().trim()
        // const url_winlose = 'https://rico.'+web.website+'/api/Support/winlose/'+username.toLowerCase().trim()
        const url_realtime = test_base+'/api/Support/Realtime/' + username.toLowerCase().trim()
        // const url_getCredit = test_base+'/api/Support/getcredit/'+username.toLowerCase().trim()
        // const url_winlose = test_base+'/api/Support/winlose/'+username.toLowerCase().trim()

 
        try {
            this.logger.log(url_realtime)
            this.logger.log('rico fired')
            const result = await this.httpService.post(url_realtime, { username: username, provider: provider, type: type }, { headers: headersRequest }).toPromise();

            this.logger.log('rico returned')


            return result.data;
        } catch (error) {
            this.logger.log('rico Error')
            return {
                message: 'error',
                data: error.response.data,

            };

        }
    }
    public async validateCheck(token: string): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${token}`,
        };
        const url = process.env.SMART_EXCHANGE_PROFILE_MINI_URL;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        try {
            const result = await this.httpService.get(url, { headers: headersRequest }).toPromise();
            return {
                result: true,
                username: result.data.username,
                company: result.data.company_name ? result.data.company_name : 'betkub'
            };
        } catch (error) {
            console.log('error token invalid');
            throw new UnauthorizedException();
        }
    }

    public async setTurn(input: SetTurnDto): Promise<AxiosResponse | object> {
        
        const url = `https://all-winlose-${input.opcode}-ehhif4jpyq-as.a.run.app/api/Realtime/SetTurn`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();

        try {
            this.logger.log('setTurn  fired');
            const result = await this.httpService.post(url,input).toPromise();
            this.logger.log('setTurn  returned success');
            return result.data
        } catch (error) {
            this.logger.log('setTurn  error');
            console.log(error.response.data);
          
        }
    }
    public async updateGameBatch(input: any, token: string): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${token}`,
        };
        const url = process.env.UPDATE_GAME;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        try {
            const result = await this.httpService.put(url, { headers: headersRequest }).toPromise();
            return {
                result: true,
                username: result.data.username,
                company: result.data.company ? result.data.company : 'betkub'
            };
        } catch (error) {
            console.log('in');
            throw new UnauthorizedException();
        }
    }
    public async findOne(id: string): Promise<Website | undefined> {
        return await this.WebsiteRepository.findOne(id);
    }
    public async getAllWebListOperate(): Promise<Website[]> {
        return await this.WebsiteRepository.find({
            select: ['website', 'opcode'],
            where: {
                status: true,

            }
        });
    }
    public async addWebsite(input: WebsiteDto): Promise<Website> {
        return await this.WebsiteRepository.save({
            ...input

        }
        );
    }

    public async findOneByHash(hash: string): Promise<Website | undefined> {
        return await this.WebsiteRepository.findOne({

            where: {
                hash: hash,
                page: 'landing'
            }
        });
    }
    public async findOneMemberByHash(hash: string): Promise<Website | undefined> {
        return await this.WebsiteRepository.findOne({

            where: {
                hash: hash,
                page: 'member'

            }
        });
    }
    public async updateWebsite(web: Website, key: string, value: string): Promise<Website> {
        return await this.WebsiteRepository.save(
            new Website({
                ...web



            })
        );

    }
    public async getGamelist(hash :string): Promise<AxiosResponse | object> {
        
        const url = process.env.ADMIN_STATIC +`/api/Static/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();

        try {
            this.logger.log('getGamelist  fired');
            this.logger.log('getGamelist  fired');
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getGamelist  returned success');
            return result.data
        } catch (error) {
            this.logger.log('getGamelist  error');
            console.log(error.response.data);
          
        }
    }
    public async getProvider(hash :string): Promise<AxiosResponse | object> {
        
        const url = process.env.ADMIN_STATIC +`/api/Static/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();

        try {
            this.logger.log('getProvider  fired');
            this.logger.log('getProvider  fired');
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getProvider  returned success');
            return result.data
        } catch (error) {
            this.logger.log('getProvider  error');
            console.log(error.response.data);
          
        }
    }
    public async getAdminMember(hash :string): Promise<AxiosResponse | object> {
        
        const url = process.env.ADMIN_STATIC +`/api/Static/Member/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();

        try {
            this.logger.log('getAdminMember  fired');
            this.logger.log('getAdminMember  fired');
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getAdminMember  returned success');
            return result.data
        } catch (error) {
            this.logger.log('getAdminMember  error');
            console.log(error.response.data);
          
        }
    }
    
    public async getPromotion(hash :string,username:string): Promise<AxiosResponse | object> {
        
        const web = await this.getWebInfoByHash(hash)
        // const url = process.env.RICO +`/api/Static/Member/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        // const url = 'http://localhost:8005/api/Support/Promotion/'+username.toLowerCase().trim()
     
        const url = 'https://rico.'+web.website+'/api/Support/Promotion/'+username.toLowerCase().trim()
        console.log(url)
      

        try {
            this.logger.log('getPromotion  fired');
            this.logger.log('getPromotion  fired');
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getPromotion  returned success');
            return result.data
        } catch (error) {

            this.logger.log('getPromotion  error');
            console.log(error.response.status);
          
                return {
                    code:200,
                    name:"ไม่ได้รับโปรโมชั่น",
                    detail:"ไม่มีโบนัส"
                }
        
        }
    }
    
    public async getPromotionRegister(hash :string): Promise<AxiosResponse | object> {
        
        const web = await this.getWebInfoByHash(hash)
        // const url = process.env.RICO +`/api/Static/Member/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        // const url = 'http://localhost:8005/api/Support/PromotionRegister'
    
        const url = 'https://rico.'+web.website+'/api/Support/PromotionRegister'
        console.log(url)

        try {
            this.logger.log('getPromotionRegister  fired');
            this.logger.log('getPromotionRegister  fired');
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getPromotionRegister  returned success');
            return result.data
        } catch (error) {

            this.logger.log('getPromotionRegister  error');
            console.log(error.response.status);
          
                return {
                    code:200,
                    name:"ไม่ได้รับโปรโมชั่น",
                    detail:"ไม่มีโบนัส"
                }
        
        }
    }
    
    public async getPromotionAuth(hash :string,username:string): Promise<AxiosResponse | object> {
        
        const web = await this.getWebInfoByHash(hash)
        // const url = process.env.RICO +`/api/Static/Member/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        // const url = 'http://localhost:8005/api/Support/PromotionAutorize/'+username.toLowerCase().trim()
    
        const url = 'https://rico.'+web.website+'/api/Support/PromotionAutorize/'+username.toLowerCase().trim()
        console.log(url)

        try {
            this.logger.log('getPromotionAuth  fired');
            this.logger.log('getPromotionAuth  fired');
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getPromotionAuth  returned success');
            return result.data
        } catch (error) {

            this.logger.log('getPromotionAuth  error');
            console.log(error.response);
          
                return {
                    code:404
                   
                }
        
        }
    }
    
    public async changePromotionMember(hash :string,username:string,id:number): Promise<AxiosResponse | object> {
        
        const web = await this.getWebInfoByHash(hash)
        // const url = process.env.RICO +`/api/Static/Member/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        // const url = 'http://localhost:8005/api/Support/Promotion/'+username.toLowerCase().trim()
     
        const url = 'https://rico.'+web.website+'/api/Support/Promotion/'+username.toLowerCase().trim()
      
        console.log(url)

        try {
            this.logger.log('changePromotionMember  fired');
            this.logger.log('changePromotionMember  fired');
            const result = await this.httpService.post(url,{id:id}).toPromise();
            this.logger.log('changePromotionMember  returned success');
            return result.data
        } catch (error) {

            this.logger.log('changePromotionMember  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    
    public async getCredit(username :string,id:string,token:string): Promise<AxiosResponse | object> {
        
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            'Authorization': `${token}`,
        };
        // const web = await this.getWebInfoByHash(hash)
        // const url = process.env.RICO +`/api/Static/Member/${hash}`;
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
      console.log(url)
        // const url = 'https://rico.'+web.website+'/api/Support/Promotion/'+username.toLowerCase().trim()
      
    //   return

        try {
            this.logger.log('getCredit  fired');
            this.logger.log('getCredit  fired');
            const result = await this.httpService.get(url,{ headers: headersRequest }).toPromise();
            this.logger.log('getCredit  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getCredit  error');
            console.log(error.response.status);
          
                return {
                    code:200,
                    credit:0
                }
        
        }
    }
    public async getCashback(hash:string,username :string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/Cashback/'+username.toLowerCase().trim()
        // const url = 'http://localhost:8005/api/Support/Cashback/'+username.toLowerCase().trim()
      
    //   return

        try {
            this.logger.log('getCashback  fired');
         
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getCashback  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getCashback  error');
            console.log(error.response);
          
                return {
                    cashback:0,
                    cashbackValue:0,
                    cashbackAble:0,
                    status:1
                }
        
        }
    }
    public async getCashbackCheck(hash:string,username :string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/Cashback/'
        // const url = 'http://localhost:8005/api/Support/Cashback/'
      
    //   return

        try {
            this.logger.log('getCashbackCheck  fired');
         
            const result = await this.httpService.post(url,{username:username}).toPromise();
            this.logger.log('getCashbackCheck  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getCashbackCheck  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async getCashbackCollect(hash:string,username :string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/Cashback/Collect'
        // const url = 'http://localhost:8005/api/Support/Cashback/Collect'
      
    //   return

        try {
            this.logger.log('getCashbackCollect  fired');
         
            const result = await this.httpService.post(url,{username:username}).toPromise();
            this.logger.log('getCashbackCollect  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getCashbackCollect  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
      public async changePassword(hash:string,input :object): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/ChangePassword'
        // const url = 'http://localhost:8005/api/Support/ChangePassword'
      
    //   return

        try {
            this.logger.log('changePassword  fired');
            this.logger.log(input);
           
            const result = await this.httpService.post(url,input).toPromise();
            this.logger.log('changePassword  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('changePassword  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async postRegister(hash:string,input :any): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/Register'
        // const url = 'http://localhost:8005/api/Support/Register'
      
    //   return

        try {
            this.logger.log('postRegister  fired');
            this.logger.log(input);
           
            const result = await this.httpService.post(url,input).toPromise();
            this.logger.log('postRegister  returned success');
            this.logger.log(result.data);
            const ssid = Math.floor(Math.random() * 100000) + 100001
            await this.cacheManager.set('_SSID_' + result.data.username, ssid, { ttl: 3600 });
            result.data.randomkey = ssid
            return result.data
        } catch (error) {

            this.logger.log('postRegister  error');
            console.log(error.response.data);
          throw new BadRequestException(error.response.data)
                // return error.response.data
        
        }
    }
    
    public async getDepositBank(hash:string,username :string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+`/api/Support/Bank/${username}`
        // const url = `http://localhost:8005/api/Support/Bank/${username}`
      
    //   return

        try {
            this.logger.log('getDepositBank  fired');
 
           
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getDepositBank  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getDepositBank  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async getWithdrawCheck(hash:string,username :string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/WDcheck'
        // const url = `http://localhost:8005/api/WDcheck`
      
    //   return

        try {
            this.logger.log('getWithdrawCheck  fired');
 
           
            const result = await this.httpService.post(url,{username:username}).toPromise();
            this.logger.log('getWithdrawCheck  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getWithdrawCheck  error');
            console.log(error.response.data);
          throw new BadRequestException({status:400,message:error.response.data.message})
                return error.response.data
        
        }
    }
    public async postWithdrawConfirm(hash:string, input :object): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/WDwithAmountCheck'
        // const url = `http://localhost:8005/api/WDwithAmountCheck`
      
    //   return

        try {
            this.logger.log('postWithdrawConfirm  fired');
 
           
            const result = await this.httpService.post(url,input).toPromise();
            this.logger.log('postWithdrawConfirm  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('postWithdrawConfirm  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async getHistory(hash:string, username :string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+`/api/Support/History/${username}`
        // const url = `http://localhost:8005/api/Support/History/${username}`
      
    //   return

        try {
            this.logger.log('getHistory  fired');
 
           
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getHistory  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getHistory  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async getContact(hash:string): Promise<AxiosResponse | object> {
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/Contact'
        // const url = `http://localhost:8005/api/Support/Contact`
      
    //   return

        try {
            this.logger.log('getContact  fired');
 
           
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getContact  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getContact  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async getWheel(hash :string): Promise<AxiosResponse | object> {
        
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+'/api/Support/Wheel/'
        // const url = `http://localhost:8005/api/Support/Wheel/`
      
    //   return

        try {
            this.logger.log('getWheel  fired');
 
           
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getWheel  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getWheel  error');
            console.log(error.response.data);
          
                return error.response.data
        
        }
    }
    public async getWheelCheck(hash :string,username:string): Promise<AxiosResponse | object> {
        
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+`/api/Support/WheelCheck/${username}`
        // const url = `http://localhost:8005/api/Support/WheelCheck/${username}`
      
    //   return

        try {
            this.logger.log('getWheelCheck  fired');
 
           
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getWheelCheck  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getWheel  error');
            console.log(error.response.data);
          throw new BadRequestException(error.response.data)
                return error.response.data
        
        }
    }
    public async getCheckinData(hash :string,username:string): Promise<AxiosResponse | object> {
        
        
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+`/api/Support/Checkin/${username}`
        // const url = `http://localhost:8005/api/Support/Checkin/${username}`
      
    //   return

        try {
            this.logger.log('getCheckinData  fired');
 
           
            const result = await this.httpService.get(url).toPromise();
            this.logger.log('getCheckinData  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('getCheckinData  error');
            console.log(error.response.data);
          throw new BadRequestException(error.response.data)
                return error.response.data
        
        }
    }
    public async postCheckinDay(hash :string,username:string,day:string,input:any): Promise<AxiosResponse | object> {
        
        // const date = parseInt(day);
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+`/api/Support/Checkin/${username}/${day}`
        // const url = `http://localhost:8005/api/Support/Checkin/${username}/${day}`
      
    //   return

        try {
            this.logger.log('postCheckinDay  fired');
 
           
            const result = await this.httpService.post(url,input).toPromise();
            this.logger.log('postCheckinDay  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('postCheckinDay  error');
            console.log(error.response.data);
          throw new BadRequestException(error.response.data)
                return error.response.data
        
        }
    }
    
    public async postCheckinBonus(hash :string,username:string,day:string,input:any): Promise<AxiosResponse | object> {
        
        // const date = parseInt(day);
        // const headersRequest = {
        //     'Content-Type': 'application/json', // afaik this one is not needed
        //     'Authorization': `${token}`,
        // };
        const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.SMART_BACKEND}/api/v1/member/`+id
    //   console.log(url)
        const url = 'https://rico.'+web.website+`/api/Support/CheckinBonus/${username}/${day}`
        // const url = `http://localhost:8005/api/Support/CheckinBonus/${username}/${day}`
      
    //   return

        try {
            this.logger.log('postCheckinBonus  fired');
 
           
            const result = await this.httpService.post(url,input).toPromise();
            this.logger.log('postCheckinBonus  returned success');
            this.logger.log(result.data);
            return result.data
        } catch (error) {

            this.logger.log('postCheckinBonus  error');
            console.log(error.response.data);
          throw new BadRequestException(error.response.data)
                return error.response.data
        
        }
    }
    public async checkMaintenance(headers:any,jwt:any,provider_code:string,game_id:string,is_mobile:string): Promise<AxiosResponse | object> {
       
        const headersRequest = {
            'x-real-ip': `${headers['cf-connecting-ip']}`, // afaik this one is not needed
            // 'x-real-ip': `112.333.333.2`, // afaik this one is not needed
            'user-agent': `${headers['user-agent']}`,
        };
        const url = process.env.CHECK_MAINTAINANCE +`/api/Provider/${provider_code}?username=${jwt.username}&game_id=${game_id}`
      
        try {
            this.logger.log('checkMaintenance  fired');
            this.logger.log(url);
           
            const result = await this.httpService.get(url, { headers: headersRequest }).toPromise();
            this.logger.log('checkMaintenance  returned success');
            this.logger.log(result.data);
            return {status:true}
        } catch (error) {

            this.logger.log('checkMaintenance  error');
            console.log(error.response.data);
         return {
            status:false, 
            url:'/error?mobile='+is_mobile+'&message='+error.response.data.message}
                // return error.response.data
        
        }
        return headersRequest
    }
    public async lunchGame(authorization:any,type_id:string,provider_id:string,provider_code:string,is_mobile:string,game_id:string): Promise<AxiosResponse | object> {
        
        const headersRequest = {
            'Authorization': `${authorization}` // afaik this one is not needed
          
        };
        // const web = await this.getWebInfoByHash(hash)
    //     const url = process.env.RICO +`/api/Static/Member/${hash}`;
    //     // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
    //     const url = `${process.env.LUNCH_GAME}/api/v1/member/`+id
    //   console.log(url)
        const url = process.env.LUNCH_GAME+type_id + '/launch?provider_id=' + provider_id + '&game_id=' + game_id + '&is_mobile='+ is_mobile ;
        // const url = `http://localhost:8005/api/Support/CheckinBonus/${username}/${day}`
      
    //   return

        try {
            this.logger.log('lunchGame  fired');
 
           
            const result = await this.httpService.get(url, { headers: headersRequest }).toPromise();
            this.logger.log('lunchGame  returned success');
            this.logger.log(result.data);
            return {status:200,
            url:result.data.gameUrl}
        } catch (error) {

            this.logger.log('lunchGame  error');
            console.log(error.response.data);
            return {status:404,
                url:'/error?mobile='+is_mobile+'&message=พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง :Error CODE: '+error.response.status}
        
        }
    }
}