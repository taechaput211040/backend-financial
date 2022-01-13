import { BadRequestException, HttpService, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AxiosResponse } from 'axios';import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { Website } from 'src/Entity/website.entity';
import { User } from 'src/Entity/User.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)
    constructor(
        private httpService: HttpService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService, 

    ) {

    }
    private getEventsBaseQuery(): SelectQueryBuilder<User> {
        return this.userRepository
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
    public async findOne(id: string): Promise<User | undefined> {
        return await this.userRepository.findOne(id);
    }
    public async findOneByHash(hash: string): Promise<User | undefined> {
        return await this.userRepository.findOne({
            
            where: {
                hash: hash,
                page: 'landing'
            }
        });
    }
    public async findOneMemberByHash(hash: string): Promise<User | undefined> {
        return await this.userRepository.findOne({

            where: {
                hash: hash,
                page: 'member'

            }
        });
    }
    public async updateWebsite(web: Website, key: string, value: string): Promise<User> {
        return await this.userRepository.save(
            new Website({
                ...web
                
          

            })
        );

    }




}