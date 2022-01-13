import { BadRequestException, HttpService, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { AxiosResponse } from 'axios'; import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { Website } from 'src/Entity/website.entity';
import { WebsiteDto } from 'src/Input/website.dto';
import { ProviderBO } from 'src/Entity/provider.bo.entity';
import { ProviderBODto } from 'src/Input/create.providerBO.dto';

@Injectable()
export class ProviderBOService {
    private readonly logger = new Logger(ProviderBOService.name)
    constructor(
        private httpService: HttpService,
        @InjectRepository(ProviderBO)
        private readonly providerBOrRepository: Repository<ProviderBO>,
        private readonly configService: ConfigService,

    ) {

    }
    private getEventsBaseQuery(): SelectQueryBuilder<ProviderBO> {
        return this.providerBOrRepository
            .createQueryBuilder('p')

    }
    public async getProviderBO(opcode: string): Promise<ProviderBO[]> {

        return await this.getEventsBaseQuery()
        .where('p.opcode = :opcode',{opcode})
        .getMany()
     
    }
    public async addProviderBOLink(input: ProviderBODto): Promise<ProviderBO> {
        return await this.providerBOrRepository.save({
            ...input

        }
        );
    }
}