import { BadRequestException, HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberConfig } from 'src/Entity/member.config.entiry';
const qs = require('querystring');
var crypto = require('crypto');
@Injectable()
export class MemberConfigService {
    private readonly logger = new Logger(MemberConfigService.name)
    constructor(
        @InjectRepository(MemberConfig)
        private readonly memberConfigRepository: Repository<MemberConfig>,


        private httpService: HttpService,
        private readonly configService: ConfigService,

    ) {

    }

    async saveAllConfig(input:MemberConfig){
        return await this.memberConfigRepository.save(input)
    }
    async getAllConfig(){
        return await this.memberConfigRepository.query(`select *  from member_config m where created_at > '2023-03-03 18:38:49.107'`)
    }
    public async getByUsername(username: string, provider:string) {
        return await this.memberConfigRepository.findOne({ 
            where: { username: username , provider:provider.toUpperCase() }})
    }

    public async saveRealUsername(username: string, provider: string, opcode: string, loop = 0) {
        if (loop > 1) return
        let key = 'a8eaab0a61f2c12883d3772a2e4ac084'
        if (opcode.toLowerCase() == 'brit') {
            key = 'aef842553451ea8c498e0652c63ba5cc'
        }
        const string_to_md5 = `${opcode}${provider.toUpperCase()}${username.toUpperCase()}${key}`

        let hash = crypto.createHash('md5').update(string_to_md5).digest("hex");
        const signature = hash.toUpperCase()
        console.log(signature)
        const url = `${process.env.GSC_URL}/checkMemberProductUsername.aspx?operatorcode=${opcode}&providercode=${provider.toUpperCase()}&username=${username.toUpperCase()}&signature=${signature}`

        try {
            const res = await this.httpService.get(url).toPromise()
            this.logger.log(res.data)
            if (res.data.errCode == "0") {
                let member_config = new MemberConfig()
                member_config.provider = provider
                member_config.provider_username = res.data.data
                member_config.username = username
                await this.memberConfigRepository.save(member_config)

            } else {

                await this.createUserGSC(username, opcode)
                await this.goLunchGame(username, provider, opcode)
                await this.saveRealUsername(username, provider, opcode, loop + 1)
            }
        } catch (error) {
            console.log(error)
            throw new BadRequestException(error)
        }
    }
    public async getUsernameByProviderUsername(providerUsername: string, provider: string) {
        return await this.memberConfigRepository.findOne({ where: { provider_username: providerUsername, provider: provider } })
    }
    private async goLunchGame(username: string, provider: string, opcode: string) {
        let type = 'OT'
        if (provider.toUpperCase() == 'SO' || provider.toUpperCase() == 'WB') type = 'SB'
        if (provider.toUpperCase() == 'AV' || provider.toUpperCase() == 'CY') type = 'OT'
        if (provider.toUpperCase() == 'AP') type = 'SL'


        let key = 'a8eaab0a61f2c12883d3772a2e4ac084'
        if (opcode.toLowerCase() == 'brit') {
            key = 'aef842553451ea8c498e0652c63ba5cc'
        }

        const string_to_md5 = `${opcode.toLowerCase()}password123${provider.toUpperCase()}${type.toUpperCase()}${username.toUpperCase()}${key}`

        let hash = crypto.createHash('md5').update(string_to_md5).digest("hex");

        const signature = hash.toUpperCase()
        const url = `${process.env.GSC_URL}/launchGames.aspx?operatorcode=${opcode.toLowerCase()}&providercode=${provider.toUpperCase()}&username=${username.toUpperCase()}&password=password123&type=${type}&gameid=0&lang=th-TH&html5=0&signature=${signature}`
        try {
            this.logger.log('Lunching game GSC success')
          await this.httpService.get(url).toPromise()
            this.logger.log('Lunchgame GSC success')
        } catch (error) {
            console.log(error)
        }

    }
    private async createUserGSC(username: string, opcode: string) {
        let key = 'a8eaab0a61f2c12883d3772a2e4ac084'
        if (opcode.toLowerCase() == 'brit') {
            key = 'aef842553451ea8c498e0652c63ba5cc'
        }

        const string_to_md5 = `${opcode.toLowerCase()}${username.toUpperCase()}${key}`

        let hash = crypto.createHash('md5').update(string_to_md5).digest("hex");

        const signature = hash.toUpperCase()
        const url = `${process.env.GSC_URL}/createMember.aspx?operatorcode=${opcode.toLowerCase()}&username=${username.toUpperCase()}&signature=${signature}`

      
        try {
            this.logger.log('creating GSC ')
            console.log(url)
       await this.httpService.get(url).toPromise()
        
            this.logger.log('create GSC success')
        } catch (error) {
            console.log(error)
        }
    }

}

