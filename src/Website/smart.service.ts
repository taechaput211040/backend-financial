import { BadRequestException, HttpService, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AxiosResponse } from 'axios';import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { Website } from 'src/Entity/website.entity';
import { TopupRefDto } from 'src/Topupref/create.topup.ref.dto';

@Injectable()
export class SmartService {
    private readonly logger = new Logger(SmartService.name)
    constructor(
        private httpService: HttpService,
        private readonly configService: ConfigService,

    ) {

    }


  





    public async credit_history(username:string,limit?:number): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
      
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if(!limit){
            limit = 0;
        }
        const url = process.env.SMART_URL+'/api/Credit/history/'+username+'?limit='+limit;
        this.logger.log(url)
        this.logger.log(process.env.SMART_ADMIN_TOKEN)
        try {
            const result = await this.httpService.get(url, { headers: headersRequest }).toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.message);
            throw new UnauthorizedException();
        }
    }
 
    

    public async deposit(username:string,amount:number): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
      
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if(amount == 0 || amount < 0){
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
        const url = process.env.SMART_URL + '/api/Credit/Deposit';

        this.logger.log(url)
     
        this.logger.log(username)
        this.logger.log(amount)
        try {
            const result = await this.httpService.post(url,{username:username,amount:amount}, { headers: headersRequest }).toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.data);
            throw new BadRequestException(error.response.data);
        }
    }

    
    public async withdraw(username:string,amount:number): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
      
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if(amount == 0 || amount < 0){
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
        const url = process.env.SMART_URL + '/api/Credit/Withdraw';
        this.logger.log(url)
        try {
            const result = await this.httpService.post(url,{username:username,amount:amount}, { headers: headersRequest }).toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.message);
            throw new UnauthorizedException();
        }
    }
    public async deposit_provider(username:string,amount:number,provider_code:string): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
      
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if(amount == 0 || amount < 0){
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
        const url = process.env.SMART_URL + '/api/Credit/Depsoit/Provider';
        this.logger.log(url)
    
        try {
            const result = await this.httpService.post(url,{username:username.toUpperCase(),amount:amount,provider_code:provider_code.toUpperCase()}, { headers: headersRequest }).toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.data);
            throw new BadRequestException(error.response.data);
        }
    }

    
    public async withdraw_provider(username:string,amount:number,provider_code:string): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
      
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if(amount == 0 || amount < 0){
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
        const url = process.env.SMART_URL + '/api/Credit/Withdraw/Provider';
        this.logger.log(url)
    
        try {
            const result = await this.httpService.post(url,{username:username.toUpperCase(),amount:amount,provider_code:provider_code.toUpperCase()}, { headers: headersRequest }).toPromise();
            return result.data;
        } catch (error) {
            console.log(error.response.message);
            throw new UnauthorizedException();
        }
    }
    public async depositMain(input:TopupRefDto): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
      
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
        if(input.amount == 0 || input.amount < 0){
            throw new BadRequestException('จำนวนเงินต้องมากกว่า 0');
        }
       
    if(input.method == 'deposit'){
        if(input.provider == 'SMART'){
            return  await this.deposit(input.username,input.amount)
        } else {
            return  await this.deposit_provider(input.username,input.amount,input.provider)
        }

    } else if(input.method == 'withdraw'){
        if(input.provider == 'SMART'){
            return  await this.withdraw(input.username,input.amount)
        } else {
            return  await this.withdraw_provider(input.username,input.amount,input.provider)
        }

    }
        // try {
        //     const result = await this.httpService.post(url,{username:username,amount:amount}, { headers: headersRequest }).toPromise();
        //     return result.data;
        // } catch (error) {
        //     console.log(error.response.data);
        //     throw new BadRequestException(error.response.data);
        // }
    }
    public async checkCredit(username:string,provider_code:string): Promise<AxiosResponse | object> {
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.SMART_ADMIN_TOKEN}`
        };
        // return await this.httpService.get(url, { headers: headersRequest }).toPromise();
      
        const url = process.env.SMART_URL+'/api/Credit/Balance/Provider';
        this.logger.log(url)
    
        console.log(username)
        console.log(provider_code)
        try {
            const result = await this.httpService.post(url,{username:username,provider_code:provider_code}, { headers: headersRequest }).toPromise();
            return result.data;
            
        } catch (error) {
            console.log(error.response.data);
            throw new UnauthorizedException();
        }
    }

}