import { BadRequestException, Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Inject, Logger, NotFoundException, Param, Patch, Post, Put, Req, SerializeOptions, UnauthorizedException, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { DepositNotifyDto } from 'src/Input/create.deposit.notify.dto';
import { CreateNotifyDto } from 'src/Input/create.notify.setting.dto';
import { RegisterNotifyDto } from 'src/Input/create.register.notify.dto';
import { WithdrawNotifyDto } from 'src/Input/create.withdraw.notify.dto';
import { UpdateNotifyDto } from 'src/Input/update.notify.dto';
import { MemberService } from './member.service';
import { Cache } from "cache-manager";
import { CreateMemberDto } from 'src/Input/create.member.dto';
import { WebsiteService } from 'src/Website/website.service';
import { MemberConfigService } from './member.config.service';
import { MemberTurnService } from './member.turn.service';
import { CreateMemberTurnDto } from 'src/Input/create.member.turn.dto';
import { UpdateMemberTurnDto } from 'src/Input/update.member.turn.dto';
import { plainToClass } from 'class-transformer';
import { Members } from './member.entiry';
import { WithdrawMemberDto } from 'src/Input/withdraw.member.dto';
import { CutCreditDto } from 'src/Input/cut.credit.dto';
import { v4 as uuidv4 } from 'uuid';
@Controller('api/MemberTurn')
@SerializeOptions({ strategy: 'excludeAll' })
export class MemberTurnController {
    private readonly logger = new Logger(MemberTurnController.name);
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly memberService: MemberService,
        private readonly memberTurnService: MemberTurnService,
        private readonly websiteService: WebsiteService,
        private readonly memberConfigService: MemberConfigService

    ) { }
    @Get('Balance/:username')
    async getCreditV2Frontend(
        @Param('username') username: string
    ) {
        this.logger.log('getCreditV2 hit');
        const cacheName = `_getCreditV2_${username.toLowerCase()}`

        // const value = await this.cacheManager.get(cacheName)
        // if (value) return value

        const member = await this.memberService.getMember(username)
        if (!member) throw new NotFoundException()
        if (member.sync) {
            //check turn V2
            const creditBalance = await this.memberTurnService.getBalanceV2(member)
            
            return {credit : creditBalance.balance, user:member.username.toUpperCase()}
        } else {
            // go sync turn and credit
           await this.memberTurnService.findmemberRico(member)
            // await this.cacheManager.set(cacheName, member_rico, { ttl: null })
          

            const creditBalance = await this.memberTurnService.getBalanceV2(member)
            
            return {credit : creditBalance.balance, user:member.username.toUpperCase()}
        }

    }
    @Get('WdCheck/:username')
    async checkTurn(
        @Param('username') username: string
    ) {
        this.logger.log('checkTurn hit');
        const value = await this.cacheManager.get('_member_info_' + username.toLocaleLowerCase());
        let member: Members = null
        if (value) {
            member = plainToClass(Members, value)
        } else {
            member = await this.memberService.getMember(username)
        }


        if (!member) throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true })
        const setting = await this.memberTurnService.getSetting(member.company, member.agent)
        if (!setting || setting.system_status == false) throw new NotFoundException({ message: "เว็บปิดใช้งาน", turnStatus: true })

        await this.memberTurnService.checkIsCanwithdrawTodayFromSetting(member, setting)


        let member_turn_v2
        let winlose
        if (member.sync) {
            //check turn V2
            member_turn_v2 = await this.memberTurnService.getMemberTurn(username)
            console.log('no syncing')
            if (member_turn_v2.min_turn <= 0) {
                return { message: "กรุณากรอกจำนวนเงินที่ต้องการถอน", turnStatus: false }
            }
            winlose = await this.memberTurnService.getWinlose(member)
        } else {
            // go sync turn and credit
            console.log('syncing')
            member_turn_v2 = await this.memberTurnService.findmemberRicoSync(member,setting)

            if (member_turn_v2.min_turn <= 0) {
                return { message: "กรุณากรอกจำนวนเงินที่ต้องการถอน", turnStatus: false }
            }
            winlose = await this.memberTurnService.getWinlose(member)
        }
        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];


        //calculate turn diff 
        const diff = await this.memberTurnService.calculateTurnDiff(winlose.validAmount, member_turn_v2)
        const min_value = Object.values(diff)


        const keysSorted = Object.keys(diff).sort(function (a, b) { return diff[a] - diff[b] })

        const display_type = await this.memberTurnService.mapTypeToDisplay(keysSorted[0])
        //update min turn 

        member_turn_v2.min_turn = Math.min(...min_value)
        // turn or not 
        member_turn_v2 = await this.memberTurnService.updateMemberTurn(member_turn_v2, member_turn_v2)

        if (member_turn_v2.min_turn > 0) throw new BadRequestException({ message: `ถอนไม่ได้ ท่านต้องวางเดิมพันอีกจำนวน ${member_turn_v2.min_turn}  เครดิต ในประเภทเกม ${display_type}`, turnStatus: true })

        // update turn


        return { message: "กรุณากรอกจำนวนเงินที่ต้องการถอน", turnStatus: false }


    }
    @Get('Sync/:username')
    @HttpCode(204)
    async syncMemberCreditAndTurn(
        @Param('username') username: string
    ) {
        this.logger.log('syncMemberCreditAndTurn hit');
        const value = await this.cacheManager.get('_member_info_' + username.toLocaleLowerCase());
        let member: Members = null
        if (value) {
            member = plainToClass(Members, value)
        } else {
            member = await this.memberService.getMember(username)
        }


        if (!member) throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true })
        const setting = await this.memberTurnService.getSetting(member.company, member.agent)
        if (!setting || setting.system_status == false) throw new NotFoundException({ message: "เว็บปิดใช้งาน", turnStatus: true })
        try {
            let member_turn_v2
            let winlose

            // go sync turn and credit

            member_turn_v2 = await this.memberTurnService.findmemberRicoSync(member,setting)


            winlose = await this.memberTurnService.getWinlose(member)

            // $valids = $b->json()['validAmount'];
            // $outs = $b->json()['outstanding'];


            //calculate turn diff 
            const diff = await this.memberTurnService.calculateTurnDiff(winlose.validAmount, member_turn_v2)
            const min_value = Object.values(diff)


            const keysSorted = Object.keys(diff).sort(function (a, b) { return diff[a] - diff[b] })

            const display_type = await this.memberTurnService.mapTypeToDisplay(keysSorted[0])
            //update min turn 

            member_turn_v2.min_turn = Math.min(...min_value)
            // turn or not 
            member_turn_v2 = await this.memberTurnService.updateMemberTurn(member_turn_v2, member_turn_v2)
            return
        } catch (error) {
            throw new BadRequestException('sync error')
        }







    }
    @Get('/:username')
    async getTurn(
        @Param('username') username: string
    ) {
        this.logger.log('getTurn hit');
        const cacheName = `_turn_${username.toLowerCase()}`

        const value = await this.cacheManager.get(cacheName)
        if (value) return value

        const member = await this.memberService.getMember(username)
        if (!member) throw new NotFoundException()
        if (member.sync) {
            //check turn V2
            const member_turn_v2 = await this.memberTurnService.getMemberTurn(username)

            return member_turn_v2
        } else {
            // go sync turn and credit
            const member_rico = await this.memberTurnService.findmemberRico(member)
            await this.cacheManager.set(cacheName, member_rico, { ttl: null })
            return member_rico
        }

        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()

        // const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        // // if (member) throw new BadRequestException("Duplicate Username")
        // input.username = input.username.toLocaleLowerCase() 


        // return await this.memberTurnService.saveOrUpdateManyMemberTurn(input)
    }
    @Post('Withdraw')
    async withdrawMember(
        @Body() input: WithdrawMemberDto
    ) {
        this.logger.log('withdrawMember hit');

        const cacheName = `_withdraw_member_${input.username}_${input.amount.toString()}`

        if (await this.cacheManager.get(cacheName)) return
        await this.cacheManager.set(cacheName, 1, { ttl: 5 })


        if (input.amount <= 0) throw new BadRequestException({ message: "ถอนไม่ได้ กรุณากรอกจำนวนเงินที่ต้องการถอน", turnStatus: true })
        const value = await this.cacheManager.get('_member_info_' + input.username.toLocaleLowerCase());
        let member: Members = null
        if (value) {
            member = plainToClass(Members, value)
        } else {
            member = await this.memberService.getMember(input.username)
        }


        if (!member) throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true })
        const setting = await this.memberTurnService.getSetting(member.company, member.agent)

        if (!setting || setting.system_status == false || setting.wd_status == false) throw new BadRequestException({ message: "เว็บปิดใช้งาน", turnStatus: true })

        if (setting.wd_status == false) throw new BadRequestException({ message: "ระบบถอนปิดใช้งานชั่วคราว", turnStatus: true })

        await this.memberTurnService.checkIsCanwithdrawTodayFromSetting(member, setting, input.amount)


        let member_turn_v2
        if (member.sync) {
            //check turn V2
            member_turn_v2 = await this.memberTurnService.getMemberTurn(input.username)
            // console.log(member_turn_v2)
            if (member_turn_v2.min_turn <= 0) {
                const credit = await this.memberService.getCreditByDisplaynameV2(member, setting)
                if (credit.balance < input.amount) throw new BadRequestException({ message: "ถอนไม่ได้ เครดิตปัจจุบันไม่พอ", turnStatus: true })

                if (member_turn_v2.limitwithdraw != 0) {
                    console.log('withdraw with limit :', member.username)
                    if (input.amount >= member_turn_v2.limitwithdraw) {


                        const result_withdraw: CutCreditDto = await this.memberService.cutCreditV2(credit.balance, member, setting)
                        result_withdraw.type = 'common'
                        result_withdraw.withdraw_amount = member_turn_v2.limitwithdraw
                        result_withdraw.remark = `รายการแจ้งถอนจาก ${input.username} จำนวน ${member_turn_v2.limitwithdraw} บาท (อั้นถอน จาก เครดิต ${credit.balance} ตัดเครดิตออกทั้งหมด)  `
                        //save withdrawlist
                        await this.memberService.sendWithdrawList(result_withdraw, member)
                        return { message: `รายการแจ้งถอนสำเร็จ (อั้นถอน จาก เครดิต ${credit.balance} ตัดเครดิตออกทั้งหมด)`, turnStatus: false }
                    }

                } else {
                    console.log('withdraw commont :', member.username)

                    const result_withdraw: CutCreditDto = await this.memberService.cutCreditV2(input.amount, member, setting)

                    result_withdraw.type = 'common'
                    result_withdraw.withdraw_amount = input.amount
                    result_withdraw.remark = `รายการแจ้งถอนจาก ${input.username} จำนวน ${result_withdraw.withdraw_amount} บาท`
                    //save withdrawlist
                    await this.memberService.sendWithdrawList(result_withdraw, member)
                    return { message: "รายการแจ้งถอนสำเร็จ", turnStatus: false }
                    // do transfer if auto
                    // await this.memberService.withdrawV2(input.amount,member,setting)
                }


            } else {
                throw new BadRequestException({ message: "ท่านติดเทิร์นอยู่ ถอนไม่ได้", turnStatus: true })
            }

        }
        throw new BadRequestException({ message: "กรุณาตรวจสอบ ยอดเทิร์นก่อนทำการถอน", turnStatus: true })
        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];




    }

    @Post('WithdrawAff')
    async withdrawMemberAffiliate(
        @Body() input: WithdrawMemberDto
    ) {
        this.logger.log('withdrawMemberAffiliate hit');
        await this.memberTurnService.checkIsCanwithdrawTodayFromAffiliate(input.username, input.amount)
        const cacheName = `_withdraw_member_Affiliate_${input.username}_${input.amount.toString()}`

        if (await this.cacheManager.get(cacheName)) return
        await this.cacheManager.set(cacheName, 1, { ttl: 5 })


        if (input.amount <= 0) throw new BadRequestException({ message: "ถอนไม่ได้ กรุณากรอกจำนวนเงินที่ต้องการถอน", turnStatus: true })
        const value = await this.cacheManager.get('_member_info_' + input.username.toLocaleLowerCase());
        let member: Members = null
        if (value) {
            member = plainToClass(Members, value)
        } else {
            member = await this.memberService.getMember(input.username)
        }


        if (!member) throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true })

        const setting = await this.memberTurnService.getSetting(member.company, member.agent)

        if (!setting || setting.system_status == false || setting.wd_status == false) throw new BadRequestException({ message: "เว็บปิดใช้งาน", turnStatus: true })

        if (setting.wd_status == false) throw new BadRequestException({ message: "ระบบถอนปิดใช้งานชั่วคราว", turnStatus: true })



        const res = await this.memberService.cutCreditAffiliate(member, input.amount)
        const result_withdraw = new CutCreditDto()
        result_withdraw._id = `af_${res.id}`
        result_withdraw.type = 'affliliate'
        result_withdraw.withdraw_amount = res.amount
        result_withdraw.remark = `รายการแจ้งถอน รายได้ จาก ${input.username} จำนวน ${input.amount} บาท  `
        //save withdrawlist
        await this.memberService.sendWithdrawList(result_withdraw, member)
        return { message: `รายการแจ้งถอนรายได้ สำเร็จ `, turnStatus: false }


        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];




    }

    @Put()
    async updateTurn(
        @Param('username') username: string,
        @Body() input: UpdateMemberTurnDto
    ) {
        this.logger.log('updateTurn hit');
        const member_turn = await this.memberTurnService.getMemberTurn(input.username)
        if (!member_turn) throw new NotFoundException()






        const new_turn = await this.memberTurnService.updateMemberTurn(member_turn, input)




        return new_turn
        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()

        // const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        // // if (member) throw new BadRequestException("Duplicate Username")
        // input.username = input.username.toLocaleLowerCase() 


        // return await this.memberTurnService.saveOrUpdateManyMemberTurn(input)
    }

}