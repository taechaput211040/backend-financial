import { BadRequestException, HttpService, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AxiosResponse } from 'axios'; import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { Website } from 'src/Entity/website.entity';
import { WebsiteDto } from 'src/Input/website.dto';
import { SetTurnDto } from 'src/Input/setturn.dto';

@Injectable()
export class WebsiteService {
    private readonly logger = new Logger(WebsiteService.name)
    constructor(
        private httpService: HttpService,
        @InjectRepository(Website,'support')
        private readonly WebsiteRepository: Repository<Website>,
        private readonly configService: ConfigService,

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




}