import {  HttpService, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AxiosResponse } from 'axios';import { ConfigService } from '@nestjs/config';

import { TopupRef } from 'src/Entity/topup.ref.entity';
import { TopupRefDto } from './create.topup.ref.dto';
import axios from "axios";
import { PinValidateDto } from './pin.validate.ref.dto';
const qs = require('querystring');
@Injectable()
export class TopupRefService {
    private readonly logger = new Logger(TopupRefService.name)
    constructor(
        private httpService: HttpService,
        @InjectRepository(TopupRef)
        private readonly topupRefRepository: Repository<TopupRef>,
        private readonly configService: ConfigService,

    ) {

    }
    private getEventsBaseQuery(): SelectQueryBuilder<TopupRef> {
        return this.topupRefRepository
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
    public async getTopupListNoPin() : Promise<TopupRef[]> {
            return await this.topupRefRepository.find({
    
                
                 where: {
                    status: 'waiting'
                },order:{'created_at':'DESC'},take:50
            });
    
     
    
    
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
    public async findOne(id: string): Promise<TopupRef | undefined> {
        return await this.topupRefRepository.findOne(id);
    }
    public async findOneByHash(hash: string): Promise<TopupRef | undefined> {
        return await this.topupRefRepository.findOne({
            
            where: {
                hash: hash,
                page: 'landing'
            }
        });
    }
    public async findOneMemberByHash(hash: string): Promise<TopupRef | undefined> {
        return await this.topupRefRepository.findOne({

            where: {
                hash: hash,
                page: 'member'

            }
        });
    }
 
    public async sendPinToLineNotify(input: TopupRef){
        const headersRequest = {
            'Content-Type': 'application/json', // afaik this one is not needed
            // 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIxMjYxZmE3LTZmMTQtNDExMy1hMzY0LTU4MTA0MjkxYjkxNiIsInVuaXF1ZV9uYW1lIjoic3VwZXJhZG1pbiIsImlzX3N1cGVyYWRtaW4iOiJ0cnVlIiwibmJmIjoxNjM1ODAwMzU4LCJleHAiOjQ3OTE0NzM5NTgsImlhdCI6MTYzNTgwMDM1OH0.8hwif4RwiKgGriAepU1J6KMn5FogdFOBVebaJtKPMu4'
            'Authorization': `Bearer ${process.env.LINE_TOKEN}`
        };
      
        const url = process.env.LINE_URL;
        this.logger.log(url)
        const msg = input.username + ' : ' + input.method + ' : ' + input.amount +' : REF = '+ input.ref + ' :operator = ' + input.operator + ' :PIN = '+ input.pin
        
   
        let data = qs.stringify({message:msg})
        axios.post(
            url,data,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${this.configService.get('LINE_TOKEN')}`
                },
            }).then((response) => {
               console.log(response.data)
               return response.data
            }).catch((error) => {
                console.log(error)
            })
        this.logger.log(data)
        
        // try {
        //     const result = await this.httpService.post(url,bodyFormData, { headers: headersRequest }).toPromise();
        //     console.log(result.data)
        //     return result.data;
        // } catch (error) {
        //     console.log(error.response.data.message);
        //     throw new BadRequestException(error.response.data.message);
        // }

    }
    public async validatePin(input: PinValidateDto): Promise<TopupRef> {
        return await this.topupRefRepository.findOne({
            
            where: {
                ref: input.ref,
                pin: input.pin
            }
        });
    }
    public async createTopupTransaction(input: TopupRefDto): Promise<TopupRef> {
        return await this.topupRefRepository.save(
            new TopupRef({
                ...input,

                ref:this.generateRef(6),
                pin:this.generatePin(4),
                status:'waiting'
            })
        );

    }
    public async updateStatus(input: TopupRef): Promise<TopupRef> {
        return await this.topupRefRepository.save(
            new TopupRef({
                ...input,

               
                status:'done'
            })
        );

    }
    
    private  generateRef(char:number): string {
        let result           = '';
        const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charactersLength = characters.length;
        for ( var i = 0; i < char; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }

        return result

    }
    private  generatePin(char:number): string {
        let result           = '';
        const characters       = '0123456789';
        const charactersLength = characters.length;
        for ( var i = 0; i < char; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }

        return result

    }
    



}