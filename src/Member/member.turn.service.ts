import { BadRequestException, HttpException, HttpService, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import * as dayjs from 'dayjs';
import { Between, Like, Repository, SelectQueryBuilder } from 'typeorm';
import { Members } from './member.entiry';
import { Cache } from "cache-manager";
import { MemberTurn } from 'src/Entity/member.turn.entiry';
import { CreateMemberTurnDto } from 'src/Input/create.member.turn.dto';
import { LockDown } from 'src/Entity/rico.lockdown.entity';
import { Setting } from 'src/Setting/setting.entity';
import { MemberService } from './member.service';
import { CreditV1Dto } from 'src/Input/credit.v1.dto';
import { UpdateMemberTurnDto } from 'src/Input/update.member.turn.dto';
import * as moment from 'moment'
import { Inject } from '@nestjs/common/decorators';
import { CACHE_MANAGER } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { SettingDto } from 'src/Input/setting.dto';
const qs = require('querystring');
@Injectable()
export class MemberTurnService {
    private readonly logger = new Logger(MemberTurnService.name)
    constructor(
        @InjectRepository(MemberTurn)
        private readonly memberTurnRepository: Repository<MemberTurn>,
        // @InjectRepository(LockDown, 'rico')
        // private readonly ricoRepo: Repository<LockDown>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly memberService: MemberService,

    ) {

    }
  
    async saveAll(input:MemberTurn){
        return await this.memberTurnRepository.save(input)
    }
    async getAll(){
        return await this.memberTurnRepository.query(`select *  from member_turn m where created_at > '2023-03-03 18:38:49.107'`)
    }
    public async syncMember(member: Members) {
        const setting = await this.getSetting(member.company, member.agent)
        if (!setting || setting.system_status == false) throw new NotFoundException({ message: "เว็บปิดใช้งาน", turnStatus: true })
        try {
            let member_turn_v2
            let winlose

            // go sync turn and credit
console.log('s1')




            member_turn_v2 = await this.findmemberRicoSync(member, setting)


            winlose = await this.getWinloseForSync(member)

            // $valids = $b->json()['validAmount'];
            // $outs = $b->json()['outstanding'];


            //calculate turn diff 
            const diff = await this.calculateTurnDiff(winlose.validAmount, member_turn_v2)
            const min_value = Object.values(diff)


            const keysSorted = Object.keys(diff).sort(function (a, b) { return diff[a] - diff[b] })

            const display_type = await this.mapTypeToDisplay(keysSorted[0])
            //update min turn 

            member_turn_v2.min_turn = Math.min(...min_value)
            // turn or not 
            member_turn_v2 = await this.updateMemberTurn(member_turn_v2, member_turn_v2)
            member.sync = true
            await this.memberService.saveMember(member)


     
            return
        } catch (error) {
            throw new BadRequestException('sync error')
        }


    }
    public async getMemberTurn(username: string): Promise<MemberTurn> {
        const cacheName = `_turn_${username.toLowerCase()}`

        const value = await this.cacheManager.get(cacheName)
        if (value) return plainToClass(MemberTurn, value)
        console.log('get turn :', username)
        const turn = await this.memberTurnRepository.findOne({ where: { username: username.toLowerCase() } });
        console.log(turn)

        if (turn) {
            await this.cacheManager.set(cacheName, turn, { ttl: null })


        } else {
            return null
        }
        return turn

    }

    public async getSettingByCompanyAgent(company: string, agent: string) {
        const url = `${process.env.ALL_SETTING}`
    }
    public async updateMemberTurn(member_turn: MemberTurn, input: UpdateMemberTurnDto): Promise<MemberTurn> {
        console.log('member_turn:', member_turn)
        console.log('input:', input)
        try {
            const new_turn = await this.memberTurnRepository.save({ ...member_turn, ...input });
            const cacheName = `_turn_${member_turn.username.toLowerCase()}`
            const cacheName_with_turn = `_member_with_turn_${member_turn.username.toLowerCase()}`
            await this.cacheManager.del(cacheName_with_turn)
            await this.cacheManager.del(cacheName)
            await this.cacheManager.set(cacheName, new_turn, { ttl: null })
            return new_turn
        } catch (error) {


            console.log(error)
        }


    }
async saveMemberTurn(member_turn:MemberTurn){
    const cacheName = `_turn_${member_turn.username.toLowerCase()}`
    const cacheName_with_turn = `_member_with_turn_${member_turn.username.toLowerCase()}`
    await this.cacheManager.del(cacheName_with_turn)
    await this.cacheManager.del(cacheName)
    return await this.memberTurnRepository.save(member_turn)
}
    public async saveOrUpdateManyMemberTurn(input: CreateMemberTurnDto[]) {

        // return await this.memberTurnRepository.findOne();

        await this.memberTurnRepository.createQueryBuilder()
            .insert()
            .into(MemberTurn)
            .values(input)
            .orUpdate({
                conflict_target: ['username'],
                overwrite: ["created_at", "updated_at", "turn", "limitwithdraw", "sys_limit_amount",
                    "min_turn", "editturn", "wdable"
                    , "SL", "LC", "SB", "ES", "OT", "LT", "FH"

                ]

            }


            )
            .execute();

    }

  
    async getSetting(company: string, agent: string) {
        const setting_url = `${process.env.ALL_SETTING}/api/Setting/Main/${company}/${agent}`
        console.log(setting_url)
        try {
            const setting = await this.httpService.get(setting_url).toPromise()
            return setting.data
        } catch (error) {
            console.log(error.response.data)
            return null
        }
    }


    async findmemberRico(member: Members) {
        console.log('member sync start')
        const setting: Setting = await this.getSetting(member.company, member.agent)
        if (!setting) throw new NotFoundException()
        return await this.createTurnV2(member, setting, 0)
        // const query_get_username
        //     = ` 
        // SELECT * FROM ${setting.mysql_db_name}.members where username = '${member.username}' ;`



        // let rico_member = await this.ricoRepo.query(query_get_username)


        // const rico_member_turn = await this.getRicoMemberTurn(rico_member[0], setting)
        // if (rico_member_turn.length == 0) {
        //     console.log('rico turn = 0 ')
        //     const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
        //     return await this.createTurnV2(member, setting, current_credit)
        // } else if (rico_member_turn.length > 0) {
        //     console.log('rico turn > 0 ')
        //     const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
        //     return await this.syncTurnV2(rico_member_turn, member, setting, current_credit)
        // }

    }
    async getBalanceV2(member: Members) {
        console.log('member getting balance')
        const setting: Setting = await this.getSetting(member.company, member.agent)
        if (!setting) throw new NotFoundException()
        const cacheName = `_balance_${member.username}`
        const credit = await this.memberService.getCreditByDisplaynameV2(member, setting)

        return credit


    }
    async getIPdata(username: string) {
        const url_all_maintanance = `${process.env.CHECK_MAINTAINANCE}/api/UserStat/${username.toUpperCase()}`
        try {
            const result = await this.httpService.get(url_all_maintanance).toPromise()
            // console.log(result.data)
            console.log('getIPdata success :', result.data)
            return result.data
        } catch (error) {
            // console.log('getIPdata error :', error)
            console.log(error.response.data)
            return null
        }
        // $url_ip = env('CHECK_MAINTAINANCE')."/api/UserStat/".$user;
    }
    async findmemberRicoSync(member: Members, setting: Setting) {
        await this.memberService.topupV2Temp(0.01, member, setting);
        await this.memberService.withdrawV2Temp(0.01, member, setting);
// console.log(query_get_username)
return await this.createTurnV2(member, setting, 0)
        // const query_get_username
        //     = ` 
        // SELECT * FROM ${setting.mysql_db_name}.members where username = '${member.username}' ;`

   

        // let rico_member = await this.ricoRepo.query(query_get_username)

       
        // const rico_member_tu rn = await this.getRicoMemberTurn(rico_member[0], setting)

   
        // if (rico_member_turn.length == 0) {
        //     const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
        //     return await this.createTurnV2(member, setting, current_credit)
        // } else if (rico_member_turn.length > 0) {
        //     const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
        //     return await this.syncTurnV2(rico_member_turn, member, setting, current_credit)
        // }

    }
    async getWinlose(member: Members) {
        console.log('getWinlose :', member.username)
        if (!member.lastest_dpref) {

            throw new BadRequestException({ message: "ยูสเซอร์นี้ยังไม่มีการฝากเงิน", turnStatus: true })


        } else {
            // get start cal time from all deposit

            const deposit_url = `${process.env.ALL_DEPOSIT}/api/Deposit/DpRef/${member.lastest_dpref}`
            console.log(deposit_url)
            let deposit
            try {
                const result = await this.httpService.get(deposit_url).toPromise()
                // console.log(result.data)
                console.log('deposit_url pass :', result.data)
                deposit = result.data
            } catch (error) {
                console.log('deposit_url error :', error)
                console.log(error.response.data)
                deposit = null
            }

let start
let end
            if(deposit){
                 start = moment(deposit.created_at).format()
                 end = moment().format()
            } else{
                start = moment().startOf('day').format()
                 end = moment().endOf('day').format()
            }
            // get from all winlose
        


            const url_all_winlose = `${process.env.ALL_WINLOSE}/api/Realtime/GetWinlose/${member.username}/${start}/(${end})`
console.log("adsda",url_all_winlose)
            try {
                const allwinlose = await this.httpService.get(url_all_winlose).toPromise()
                // console.log(allwinlose.data)
                console.log('allwinlose pass :', allwinlose.data)
                return allwinlose.data
            } catch (error) {
                console.log('allwinlose error :')
                console.log(error.response.data)
                throw new BadRequestException({ message: "พบข้อผิดพลาด กรุณาลองใหม่", turnStatus: true })
            }


            // `${process.env.ALL_DEPOSIT}/api/Realtime/GetWinlose/${member.username}/${start}/(${})`
            // $url = env('ALL_WINLOSE') . "/api/Realtime/GetWinlose" . strtolower($mem->username)  . '/' . $start . '/' .  $end;



            // return all winlose

        }




    }
    async getWinloseForSync(member: Members) {
        console.log('getWinloseForSync :', member.username)
        let start
        if (!member.lastest_dpref) {


            start =dayjs().format("YYYY-MM-DD HH:mm:ss")

        } else {
            // get start cal time from all deposit

            const deposit_url = `${process.env.ALL_DEPOSIT}/api/Deposit/DpRef/${member.lastest_dpref}`
            console.log(deposit_url)
            let deposit
            try {
                const result = await this.httpService.get(deposit_url).toPromise()
                // console.log(result.data)
                console.log('deposit_url pass :', result.data)
                deposit = result.data
            } catch (error) {
                console.log('deposit_url error :')
                console.log(error.response.data
                    )
                    deposit = null
                // throw new BadRequestException({ message: "พบข้อผิดพลาด กรุณาลองใหม่", turnStatus: true })
            }

            if(deposit){
                start = dayjs(deposit.created_at).format("YYYY-MM-DD HH:mm:ss") 
            } else {
                start = dayjs().startOf('day').format("YYYY-MM-DD HH:mm:ss") 
            }
          
        }

        // get from all winlose

        const end = dayjs().format("YYYY-MM-DD HH:mm:ss") 


        const url_all_winlose = `${process.env.ALL_WINLOSE}/api/Realtime/GetWinlose/${member.username}/${start}/${end}`
console.log(url_all_winlose)
        try {
            const allwinlose = await this.httpService.get(url_all_winlose).toPromise()
            // console.log(allwinlose.data)
            console.log('allwinlose pass :', allwinlose.data)
            return allwinlose.data
        } catch (error) {
            console.log('allwinlose error :', error)
            console.log(error.response.data)
            return {
                outstanding: [
                  {
                    gameType: "SB",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "ES",
                    bet: 0,
                  payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "SL",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "LC",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "OT",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "LT",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "FH",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  }
                ],
                validAmount: [
                  {
                    gameType: "SB",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "ES",
                    bet: 0,
                  payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "SL",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "LC",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "OT",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "LT",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  },
                  {
                    gameType: "FH",
                    bet: 0,
                    payout: 0,
                    turnover: 0,
                    winlose: 0
                  }
                ]
                
              } }









    }
    async checkIsCanwithdrawTodayFromSetting(member: Members, setting: SettingDto, amount: number = 0) {
        console.log('get wd all day :', member.username)
        const amount_and_count = await this.getWithdrawAmountAndCountToday(member.username)

        if (setting.wdlimitcredit > 0) {

            if (Number(amount_and_count.count) == Number(setting.wdlimitTime)) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitTime}  ครั้ง ต่อวัน`, turnStatus: true })

            if (Number(amount_and_count.amount) > Number(setting.wdlimitcredit)) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitcredit}  บาท ต่อวัน`, turnStatus: true })
            if ((Number(amount_and_count.amount) + Number(amount)) > Number(setting.wdlimitcredit)) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitcredit}  บาท ต่อวัน วันนี้ท่านถอนไปแล้ว ${amount_and_count.amount} บาท`, turnStatus: true })
            if (Number(amount)> 0) {
                if (Number(amount) < Number(setting.least_wd_credits)) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ ยอดถอนขั้นต่ำ  ${setting.least_wd_credits}  บาท `, turnStatus: true })
            }
        }
        console.log(setting.wdlimit_time_status)
        console.log(setting.wdlimitTime)
        console.log(amount_and_count)
        if(setting.wdlimit_time_status && setting.wdlimitTime > 0){
            console.log('checking')
            if (Number(amount_and_count.count) >= Number(setting.wdlimitTime)) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitTime}  ครั้ง ต่อวัน`, turnStatus: true })


        }

     

    }
    async getWithdrawAmountAndCountToday(username: string) {
        const url_all_withdraw = `${process.env.ALL_WITHDRAW}/api/Withdraw/Auto/AmountCount/${username.toLowerCase()}`

        try {
            const allwithdraw = await this.httpService.get(url_all_withdraw).toPromise()
            // console.log(allwinlose.data)
            return allwithdraw.data
        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: "พบข้อผิดพลาด กรุณาลองใหม่", turnStatus: true })
        }

    }
    async checkIsCanwithdrawTodayFromAffiliate(username: string, amount: number) {
        const url_all_deposit = `${process.env.ALL_DEPOSIT}/api/Aff/Report/ValidateV2/${username.toLowerCase()}/${amount.toString()}`
        // const url_all_withdraw = `${process.env.ALL_WITHDRAW}/api/Withdraw/Auto/AmountCount/${username.toLowerCase()}`
console.log(url_all_deposit)
        try {
            const result = await this.httpService.get(url_all_deposit).toPromise()
            return result.data
        } catch (error) {
            // console.log(error.response)
            throw new HttpException(error.response.data, error.response.status)
        }

    }
    async calculateTurnDiff(validamount: any, turn: MemberTurn) {

        let turn_dif = {
            SL: 0,
            LC: 0,
            SB: 0,
            ES: 0,
            OT: 0,
            LT: 0,
            FH: 0,
        }
        const turn_key = Object.keys(turn)
        validamount.map(x => {


            turn_dif[x.gameType] = turn[x.gameType] - x.turnover

            if (x.gameType == 'SL') {
                turn_dif.FH = turn[x.gameType] - x.turnover
            }
            // turn_dif.push({x.gameType:turndiff})

        })
        return turn_dif
    }

    async mapTypeToDisplay(object: any) {
        if (object == 'SL') return 'slot'
        if (object == 'LC') return 'casino'
        if (object == 'SB') return 'sport'
        if (object == 'ES') return 'eport'
        if (object == 'OT') return 'Horse-racing'
        if (object == 'LT') return 'lotto'
        if (object == 'FH') return 'fishing'
    }
    async syncMemberCreditToV2(member: Members, setting: Setting, rico_member: any) {
        //get credit v1
      
      
        // get credit v2
        const creditV2 = await this.memberService.getCreditByDisplaynameV2(member, setting)
        console.log("creditV2:", creditV2.balance)

        //adjust credit v2
        const current_credit = await this.memberService.adjustCreditToV2(0, creditV2.balance, member, setting)


        //deduct credit v1
        



        // console.log(rico_member)
        member.lastest_dpref = rico_member[0].lastest_dpref
        member.dp_count = parseInt(rico_member[0].dp_count)
        member.wd_count = parseInt(rico_member[0].wd_count)
        member.password = rico_member[0].password
        const promotion_id = await this.getPromotionV2ByRicoId(member, rico_member[0].bonusid)
        member.bonusid_v2 = promotion_id
        console.log("promo pass:", creditV2.balance)
        //set member sync = true
        await this.memberService.updateSyncedMember(member)
        return current_credit
    }
    async getPromotionV2ByRicoId(member: Members, rico_bonus_id: string) {
        console.log("bonusid:", rico_bonus_id)
        const url_all_promotion = `${process.env.ALL_PROMOTION}/api/Member/Sync/${member.company}/${member.agent.toLowerCase()}/${rico_bonus_id.toString()}`
        // const url_all_withdraw = `${process.env.ALL_WITHDRAW}/api/Withdraw/Auto/AmountCount/${username.toLowerCase()}`

        try {
            const result = await this.httpService.get(url_all_promotion).toPromise()
            return result.data.id
        } catch (error) {
            // console.log(error.response)
            throw new HttpException(error.response.data, error.response.status)
        }

    }
    async createTurnV2(member: Members, setting: Setting, current_credit: number) {
        console.log('creating turnv2 ')
        const old_turn = await this.getMemberTurn(member.username.toLowerCase()) 
        if(old_turn) return old_turn
        const turn = new MemberTurn()
        turn.username = member.username
        turn.limitwithdraw = 0
        turn.sys_limit_amount = setting.wdlimitcredit
        if (setting.turnNobonus > 0) {
            turn.min_turn = setting.turnNobonus * current_credit
            turn.SL = setting.turnNobonus * current_credit
            turn.SB = setting.turnNobonus * current_credit
            turn.LC = setting.turnNobonus * current_credit
            turn.OT = setting.turnNobonus * current_credit
            turn.ES = setting.turnNobonus * current_credit
            turn.FH = setting.turnNobonus * current_credit
            turn.LT = setting.turnNobonus * current_credit
        } else {
            turn.min_turn = 0
            turn.SL = 0
            turn.SB = 0
            turn.LC = 0
            turn.OT = 0
            turn.ES = 0
            turn.FH = 0
            turn.LT = 0
        }
        const turn_mock = {
            SL: setting.turnNobonus,
            SB: setting.turnNobonus,
            LC: setting.turnNobonus,
            OT: setting.turnNobonus,
            ES: setting.turnNobonus,
            FH: setting.turnNobonus,
            LT: setting.turnNobonus,
            SL_e: true,
            SB_e: true,
            OT_e: true,
            LC_e: true,
            ES_e: true,
            FH_e: true,
            LT_e: true,
        }
        turn.turn = JSON.stringify(turn_mock)
        // turn.min_turn = 
        return await this.memberTurnRepository.save(turn)
    }
    async syncTurnV2(memberTurn_array: any, member: Members, setting: Setting, current_credit: number) {
        // console.log(memberTurn_array)
        console.log('syncronizing rico turnv2')

        try {
            let turn = await this.memberTurnRepository.findOne({ where: { username: member.username.toLowerCase() } })
            if (!turn) turn = new MemberTurn()
            turn.created_at = memberTurn_array[0].created_at
            turn.updated_at = memberTurn_array[0].updated_at
            turn.username = member.username
            turn.limitwithdraw = memberTurn_array[0].limitwithdraw
            turn.sys_limit_amount = setting.wdlimitcredit
            const turn_mock = {
                SL: setting.turnNobonus,
                SB: setting.turnNobonus,
                LC: setting.turnNobonus,
                OT: setting.turnNobonus,
                ES: setting.turnNobonus,
                FH: setting.turnNobonus,
                LT: setting.turnNobonus,
                SL_e: true,
                SB_e: true,
                OT_e: true,
                LC_e: true,
                ES_e: true,
                FH_e: true,
                LT_e: true,
            }
            memberTurn_array.map(t => {

                if (t.type == 'SL') {
                    turn.SL = t.turnTarget
                    turn_mock.SL = t.turns
                    turn.FH = t.turnTarget
                    turn_mock.FH = t.turns
                }
                if (t.type == 'LC') {
                    turn.LC = t.turnTarget
                    turn_mock.LC = t.turns
                }
                if (t.type == 'SB') {
                    turn.SB = t.turnTarget
                    turn_mock.SB = t.turns
                }
                if (t.type == 'ES') {
                    turn.ES = t.turnTarget
                    turn_mock.ES = t.turns
                }
                if (t.type == 'OT') {
                    turn.OT = t.turnTarget
                    turn_mock.OT = t.turns
                }
                if (t.type == 'LT') {
                    turn.LT = t.turnTarget
                    turn_mock.LT = t.turns
                }

            })
            const closest = memberTurn_array.reduce(
                (turn, loc) =>
                    (turn.turnTarget < loc.turnTarget ? turn : loc)
                , {})

            turn.min_turn = closest.turnTarget
            turn.turn = JSON.stringify(turn_mock)
            return await this.memberTurnRepository.save(turn)

        } catch (error) {
            console.log('error turn', error)
        }

    }
    async saveUserTransaction(operator: string, action: string, details: string, payload: any, ip_operator: string, company: string, agent: string) {
        const url_all_user = `${process.env.ALL_RICO_USER}/api/User/Transaction`
        const body = {
            username: operator,
            action: action,
            details: details,
            payload: JSON.stringify(payload),
            ip: ip_operator,
            company: company,
            agent: agent
        }
        try {
            await this.httpService.post(url_all_user, body).toPromise()

        } catch (error) {
            console.log(error.response.data)
        }
    }
}

