import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Query, Req, SerializeOptions, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";

import { ProviderBODto } from "src/Input/create.providerBO.dto";
import { ProviderBOService } from "./provider_bo.service";


@Controller('api/ProviderBO')
@SerializeOptions({ strategy: 'excludeAll' })
export class ProviderBOController {
    private readonly logger = new Logger(ProviderBOController.name);
    constructor(
     
        private readonly providerBOService: ProviderBOService,
        
        // private readonly transectionService: TransectionService,
    ) { }

    @Post()
    @UseInterceptors(ClassSerializerInterceptor)

    async addProviderLink(

        @Body() input:ProviderBODto
    ) {
        this.logger.log('addProviderLink  hit');
        // await this.cacheManager.reset();


       return await this.providerBOService.addProviderBOLink(input)

    //    const result =  await this.topupRefService.sendPinToLineNotify(topup_record)
    //    return topup_record
    //     this.logger.log('cache cleared  ');
    }


}