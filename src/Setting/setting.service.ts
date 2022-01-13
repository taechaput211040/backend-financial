import {  HttpService, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {  Repository , SelectQueryBuilder } from "typeorm";

import {  Setting } from "./setting.entity";
import { CreateSettingDto } from "./input/create.setting.dto";
import { UpdateSettingDto } from "./input/update.setting.dto";
@Injectable()
export class SettingService {
    private readonly logger = new Logger(SettingService.name)
    constructor(
        private httpService: HttpService,
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>
    ) {

    }
    private getMemberBaseQuery(): SelectQueryBuilder<Setting> {
        return this.settingRepository
            .createQueryBuilder('s')
            .orderBy('s.id', 'DESC')

    }
    private getMemberBaseQueryByHash(hash:string): SelectQueryBuilder<Setting> {
        return this.getMemberBaseQuery()
           .andWhere('s.hash = :hash', { hash })

    }
    public async getRole(role:string){
        return role;
    }
    public async createSetting(input:CreateSettingDto):Promise<Setting>{
        return await this.settingRepository.save(
            new Setting({
                ...input
               
            })
        );
    }
    public async getOne(hash:string):Promise<Setting>{
        return await this.getMemberBaseQueryByHash(
          hash
        ).getOne();
    }
    public async updateSetting(setting:Setting,input:UpdateSettingDto,hash:string):Promise<Setting>{
        return await this.settingRepository.save(
            new Setting({
                ...setting,
                ...input,
            })
        );
    }
    public async checkCompanyKey(companyname:string,hash:string):Promise<boolean>{
       const setting = await this.getMemberBaseQueryByHash(hash)
       .andWhere('s.companyname = :companyname', { companyname })
       .getOne();
       this.logger.debug(companyname);
        if(setting){
            return true;
        } else {
            return false;
        }

    }
}
