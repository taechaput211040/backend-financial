import { BadRequestException, HttpException, HttpService, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

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
        @InjectRepository(LockDown, 'rico')
        private readonly ricoRepo: Repository<LockDown>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly memberService: MemberService,

    ) {

    }


    public async getMemberTurn(username: string): Promise<MemberTurn> {
        const cacheName = `_turn_${username.toLowerCase()}`

        const value = await this.cacheManager.get(cacheName)
        if (value) return plainToClass(MemberTurn, value)
        console.log('get turn :', username)
        const turn = await this.memberTurnRepository.findOne({ where: { username: username } });

        await this.cacheManager.set(cacheName, turn, { ttl: null })

        return turn

    }

    public async getSettingByCompanyAgent(company: string, agent: string) {
        const url = `${process.env.ALL_SETTING}`
    }
    public async updateMemberTurn(member_turn: MemberTurn, input: UpdateMemberTurnDto): Promise<MemberTurn> {
        console.log('member_turn:',member_turn)
        console.log('input:',input)
        
        const new_turn = await this.memberTurnRepository.save({ ...member_turn, ...input });
        const cacheName = `_turn_${member_turn.username.toLowerCase()}`
        await this.cacheManager.del(cacheName)
        await this.cacheManager.set(cacheName, new_turn, { ttl: null })
        return new_turn

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

    async getRicoMemberTurn(rico_member: any, setting: any) {

        const query_get_memberTurn
            = ` 
        SELECT * FROM ${setting.mysql_db_name}.member_turns where member_id = ${rico_member.id} ;`


        // console.log(query_get_memberTurn)
        // return
        let rico_memberTurn = await this.ricoRepo.query(query_get_memberTurn)

        // console.log(rico_memberTurn)

        return rico_memberTurn
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
        const setting: Setting = await this.getSetting(member.company, member.agent)
        if (!setting) throw new NotFoundException()

        const query_get_username
            = ` 
        SELECT * FROM ${setting.mysql_db_name}.members where username = '${member.username}' ;`



        let rico_member = await this.ricoRepo.query(query_get_username)


        const rico_member_turn = await this.getRicoMemberTurn(rico_member[0], setting)
        if (rico_member_turn.length == 0) {
            const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
            return await this.createTurnV2(member, setting, current_credit)
        } else if (rico_member_turn.length > 0) {
            const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
            return await this.syncTurnV2(rico_member_turn, member, setting, current_credit)
        }

    }
    async getBalanceV2(member: Members) {
        const setting: Setting = await this.getSetting(member.company, member.agent)
        if (!setting) throw new NotFoundException()
const cacheName = `_balance_${member.username}`
       const credit = await this.memberService.getCreditByDisplaynameV2(member,setting)

        return credit
   

    }
    async findmemberRicoSync(member: Members, setting: Setting) {


        const query_get_username
            = ` 
        SELECT * FROM ${setting.mysql_db_name}.members where username = '${member.username}' ;`



        let rico_member = await this.ricoRepo.query(query_get_username)


        const rico_member_turn = await this.getRicoMemberTurn(rico_member[0], setting)
        if (rico_member_turn.length == 0) {
            const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
            return await this.createTurnV2(member, setting, current_credit)
        } else if (rico_member_turn.length > 0) {
            const current_credit = await this.syncMemberCreditToV2(member, setting, rico_member)
            return await this.syncTurnV2(rico_member_turn, member, setting, current_credit)
        }

    }
    async getWinlose(member: Members) {
        console.log('getWinlose :', member.username)
        if (!member.lastest_dpref) throw new BadRequestException({ message: "ยูสเซอร์นี้ยังไม่มีการฝากเงิน", turnStatus: true })


        // get start cal time from all deposit

        const deposit_url = `${process.env.ALL_DEPOSIT}/api/Deposit/DpRef/${member.lastest_dpref}`
        console.log(deposit_url)
        let deposit
        try {
            const result = await this.httpService.get(deposit_url).toPromise()
            // console.log(result.data)

            deposit = result.data
        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: "พบข้อผิดพลาด กรุณาลองใหม่", turnStatus: true })
        }


        // get from all winlose
        const start = moment(deposit.created_at).format()
        const end = moment().format()


        const url_all_winlose = `${process.env.ALL_WINLOSE}/api/Realtime/GetWinlose/${member.username}/${start}/(${end})`

        try {
            const allwinlose = await this.httpService.get(url_all_winlose).toPromise()
            // console.log(allwinlose.data)
            return allwinlose.data
        } catch (error) {
            console.log(error.response.data)
            throw new BadRequestException({ message: "พบข้อผิดพลาด กรุณาลองใหม่", turnStatus: true })
        }


        // `${process.env.ALL_DEPOSIT}/api/Realtime/GetWinlose/${member.username}/${start}/(${})`
        // $url = env('ALL_WINLOSE') . "/api/Realtime/GetWinlose" . strtolower($mem->username)  . '/' . $start . '/' .  $end;



        // return all winlose

    }

    async checkIsCanwithdrawTodayFromSetting(member: Members, setting: SettingDto, amount: number = 0) {
        console.log('get wd all day :', member.username)
        const amount_and_count = await this.getWithdrawAmountAndCountToday(member.username)

        if (setting.wdlimitcredit > 0) {

            if (amount_and_count.count == setting.wdlimitTime) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitTime}  ครั้ง ต่อวัน`, turnStatus: true })

            if (amount_and_count.amount > setting.wdlimitcredit) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitcredit}  บาท ต่อวัน`, turnStatus: true })
            if ((amount_and_count.amount + amount) > setting.wdlimitcredit) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ เกินขีดจำกัดยอดถอนต่อวัน, สามารถ ถอนได้  ${setting.wdlimitcredit}  บาท ต่อวัน วันนี้ท่านถอนไปแล้ว ${amount_and_count.amount} บาท`, turnStatus: true })
            if (amount > 0) {
                if (amount < setting.least_wd_credits) throw new BadRequestException({ message: `ไม่สามารถทำการถอนได้ ยอดถอนขั้นต่ำ  ${setting.least_wd_credits}  บาท `, turnStatus: true })
            }
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
        const url_all_deposit = `${process.env.ALL_DEPOSIT}/api/Aff/Report/Validate/${username.toLowerCase()}/${amount.toString()}`
        // const url_all_withdraw = `${process.env.ALL_WITHDRAW}/api/Withdraw/Auto/AmountCount/${username.toLowerCase()}`

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
        const credit = await this.memberService.getCreditByDisplayname(member)
        console.log("creditV1:", credit.credit)

        // get credit v2
        const creditV2 = await this.memberService.getCreditByDisplaynameV2(member, setting)
        console.log("creditV2:", creditV2.balance)

        //adjust credit v2
        const current_credit = await this.memberService.adjustCreditToV2(credit.credit, creditV2.balance, member, setting)


        //deduct credit v1
        if (credit.credit > 0) {
            await this.memberService.withdraw(member.username, credit.credit)
        }



        // console.log(rico_member)
        member.lastest_dpref = rico_member[0].lastest_dpref
        member.dp_count = parseInt(rico_member[0].dp_count)
        member.wd_count = parseInt(rico_member[0].wd_count)
        member.password = rico_member[0].password
        const promotion_id = await this.getPromotionV2ByRicoId(member, rico_member[0].bonusid)
        member.bonusid_v2 = promotion_id

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

        const turn = new MemberTurn()
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

    }
}

