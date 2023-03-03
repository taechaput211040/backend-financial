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
import { BuyFeatureDto } from 'src/Input/buy.feature.dto';
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

        const value = await this.cacheManager.get(cacheName)
        if (value) return value

        const member = await this.memberService.getMember(username)
        if (!member) throw new NotFoundException('ไม่พบ username ในระบบ')
        if (member.sync) {
            //check turn V2

            const creditBalance = await this.memberTurnService.getBalanceV2(member)

            return { credit: creditBalance.balance, user: member.username.toUpperCase() }
        } else {
            // go sync turn and credit

            await this.memberTurnService.findmemberRico(member)
            // await this.cacheManager.set(cacheName, member_rico, { ttl: null })


            const creditBalance = await this.memberTurnService.getBalanceV2(member)

            return { credit: creditBalance.balance, user: member.username.toUpperCase() }
        }

    }
    @Get('Support/:username')
    async getUsername(
        @Param('username') username: string
    ) {

        const member = await this.memberService.getMember(username)
        if (!member) throw new NotFoundException('ไม่พบ username ในระบบ')
        return { username: member.username, password: member.password, bonusid: member.bonusid_v2, sync: member.sync }
        if (member.sync) {
            //check turn V2

            const creditBalance = await this.memberTurnService.getBalanceV2(member)

            return { credit: creditBalance.balance, user: member.username.toUpperCase() }
        } else {
            // go sync turn and credit

            await this.memberTurnService.findmemberRico(member)
            // await this.cacheManager.set(cacheName, member_rico, { ttl: null })


            const creditBalance = await this.memberTurnService.getBalanceV2(member)

            return { credit: creditBalance.balance, user: member.username.toUpperCase() }
        }

    }
    @Get('SupportSetMinturn/:username')
    async SupportSetMinturn(
        @Param('username') username: string
    ) {

        const member = await this.memberService.getMember(username)
        if (!member) throw new NotFoundException('ไม่พบ username ในระบบ')
        const cacheName = `_turn_${member.username.toLowerCase()}`
        await this.cacheManager.del(cacheName)


        const memberTurn = await this.memberTurnService.getMemberTurn(member.username)


        memberTurn.min_turn = 0
        let a = await this.memberTurnService.saveMemberTurn(memberTurn)
        console.log(a)
        return 'no turn done'
        return { username: member.username, password: member.password, bonusid: member.bonusid_v2, sync: member.sync }
        if (member.sync) {
            //check turn V2

            const creditBalance = await this.memberTurnService.getBalanceV2(member)

            return { credit: creditBalance.balance, user: member.username.toUpperCase() }
        } else {
            // go sync turn and credit

            await this.memberTurnService.findmemberRico(member)
            // await this.cacheManager.set(cacheName, member_rico, { ttl: null })


            const creditBalance = await this.memberTurnService.getBalanceV2(member)

            return { credit: creditBalance.balance, user: member.username.toUpperCase() }
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
            this.logger.log('getting winlose');
            winlose = await this.memberTurnService.getWinlose(member)
        } else {
            // go sync turn and credit
            console.log('syncing')
            member_turn_v2 = await this.memberTurnService.findmemberRicoSync(member, setting)

            if (member_turn_v2.min_turn <= 0) {
                return { message: "กรุณากรอกจำนวนเงินที่ต้องการถอน", turnStatus: false }
            }
            winlose = await this.memberTurnService.getWinlose(member)
        }

        this.logger.log(winlose);
        this.logger.log('calculateTurnDiff');
     
        const temp_turn = { ...member_turn_v2}
        const diff = await this.memberTurnService.calculateTurnDiff(winlose.validAmount, temp_turn)
        const min_value = Object.values(diff)


        const keysSorted = Object.keys(diff).sort(function (a, b) { return diff[a] - diff[b] })

        const display_type = await this.memberTurnService.mapTypeToDisplay(keysSorted[0])
        //update min turn 

        member_turn_v2.min_turn = Math.min(...min_value)
        // turn or not 
        member_turn_v2 = await this.memberTurnService.saveMemberTurn(member_turn_v2)

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

            member_turn_v2 = await this.memberTurnService.findmemberRicoSync(member, setting)

            if (!member_turn_v2) {
                const setting = await this.memberTurnService.getSetting(member.company, member.agent)
                member_turn_v2 = await this.memberTurnService.createTurnV2(member, setting, 0)
            }
            winlose = await this.memberTurnService.getWinloseForSync(member)

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
    @Get('WithTurn/:username')
    async getMemberWithTurn(
        @Param('username') username: string
    ) {
        this.logger.log('getMemberWithTurn hit');
        const cacheName = `_member_with_turn_${username.toLowerCase()}`

        const value = await this.cacheManager.get(cacheName)
        if (value) return value

        const member = await this.memberService.getMember(username)
        // return member
        if (!member) throw new NotFoundException()
        if (member.sync) {
            //check turn V2
            const member_turn_v2 = await this.memberTurnService.getMemberTurn(username)
            if (member_turn_v2) return { member: member, turn: member_turn_v2 }
            const setting = await this.memberTurnService.getSetting(member.company, member.agent)
            const turn_new = await this.memberTurnService.createTurnV2(member, setting, 0)
            return { member: member, turn: turn_new }
        } else {
            // go sync turn and credit
            await this.memberTurnService.syncMember(member)
            const member_rico = await this.memberTurnService.findmemberRico(member)
            await this.cacheManager.set(cacheName, member_rico, { ttl: null })
            return { member: member, turn: member_rico }
        }

        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()

        // const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        // // if (member) throw new BadRequestException("Duplicate Username")
        // input.username = input.username.toLocaleLowerCase() 


        // return await this.memberTurnService.saveOrUpdateManyMemberTurn(input)
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
            if (member_turn_v2) return member_turn_v2
            const setting = await this.memberTurnService.getSetting(member.company, member.agent)
            return await this.memberTurnService.createTurnV2(member, setting, 0)

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

    @Get('Auto/:username')
    async getTurnAuto(
        @Param('username') username: string
    ) {
        this.logger.log('getTurnAuto hit');
        const cacheName = `_turn_auto${username.toLowerCase()}`

        const value = await this.cacheManager.get(cacheName)
        if (value) return value
        this.logger.log(username);
        const member = await this.memberService.getMember(username)
        if (!member) throw new NotFoundException()
        if (member.sync) {
            //check turn V2
            let member_turn_v2 = await this.memberTurnService.getMemberTurn(username)

            if (!member_turn_v2) {
                const setting = await this.memberTurnService.getSetting(member.company, member.agent)
                member_turn_v2 = await this.memberTurnService.createTurnV2(member, setting, 0)
            }


            const response = {
                turn: member_turn_v2,
                ip_data: await this.memberTurnService.getIPdata(member.username),
                result: await this.memberTurnService.getBalanceV2(member),
                winlose: await this.memberTurnService.getWinloseForSync(member)
            }
            await this.cacheManager.set(cacheName, response, { ttl: 5 })
            return response
        } else {
            // go sync turn and credit
            await this.memberTurnService.syncMember(member)
            const member_turn_v2 = await this.memberTurnService.getMemberTurn(username)

            const response = {
                turn: member_turn_v2,
                ip_data: await this.memberTurnService.getIPdata(member.username),
                result: await this.memberTurnService.getBalanceV2(member),
                winlose: await this.memberTurnService.getWinloseForSync(member)
            }

            await this.cacheManager.set(cacheName, response, { ttl: 5 })
            return response
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

        input.amount = parseInt( input.amount.toString())

       
        this.logger.log('withdrawMember hit');
        if(input.amount < 1) throw new BadRequestException({ message: `ไม่สามารภถอนยอดน้อยกว่า 1 บาท ได้ `, turnStatus: true })
       
        // throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true ,status:400})
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
        if (!setting || setting.system_status == false) throw new BadRequestException({ message: "เว็บปิดใช้งาน", turnStatus: true })
      
        if(input.amount < setting.least_wd_credits) throw new BadRequestException({ message: `ถอนไม่ได้ ยอดถอนขั้นต่ำ คือ ${setting.least_wd_credits}`, turnStatus: true })
       
   
       
        if (setting.wd_status == false) throw new BadRequestException({ message: "ระบบถอนปิดใช้งานชั่วคราว", turnStatus: true })

        await this.memberTurnService.checkIsCanwithdrawTodayFromSetting(member, setting, input.amount)


        let member_turn_v2
        if (member.sync) {
            //check turn V2
            member_turn_v2 = await this.memberTurnService.getMemberTurn(input.username)
            if (!member_turn_v2) {
               
                member_turn_v2 = await this.memberTurnService.createTurnV2(member, setting, 0)
            }
            // console.log(member_turn_v2)
            if (member_turn_v2.min_turn <= 0) {
                const credit = await this.memberService.getCreditByDisplaynameV2(member, setting)
                if (credit.balance < input.amount) throw new BadRequestException({ message: "ถอนไม่ได้ เครดิตปัจจุบันไม่พอ", turnStatus: true })

                if (Number(member_turn_v2.limitwithdraw ? member_turn_v2.limitwithdraw : 0) > 0) {
                    console.log('withdraw with limit :', member.username)
                    if (Number(input.amount) >= Number(member_turn_v2.limitwithdraw)) {

                        console.log(`all cut credit ${input.amount} :${member.username} ${JSON.stringify(member_turn_v2)}`)
                        const result_withdraw: CutCreditDto = await this.memberService.cutCreditV2(credit.balance, member, setting)
                        result_withdraw.type = 'common'
                        result_withdraw.withdraw_amount = member_turn_v2.limitwithdraw
                        result_withdraw.remark = `รายการแจ้งถอนจาก ${input.username} จำนวน ${member_turn_v2.limitwithdraw} บาท (อั้นถอน จาก เครดิต ${credit.balance} ตัดเครดิตออกทั้งหมด)  `
                        //save withdrawlist
                        await this.memberService.sendWithdrawList(result_withdraw, member)
                        return { message: `รายการแจ้งถอนสำเร็จ (อั้นถอน จาก เครดิต ${credit.balance} ตัดเครดิตออกทั้งหมด)`, turnStatus: false }

                    } else {
                        console.log('withdraw commont :', member.username)

                        const result_withdraw: CutCreditDto = await this.memberService.cutCreditV2(input.amount, member, setting)

                        result_withdraw.type = 'common'
                        result_withdraw.withdraw_amount = input.amount
                        result_withdraw.remark = `รายการแจ้งถอนจาก ${input.username} จำนวน ${result_withdraw.withdraw_amount} บาท`
                        //save withdrawlist
                        await this.memberService.sendWithdrawList(result_withdraw, member)
                        return { message: "รายการแจ้งถอนสำเร็จ", turnStatus: false }
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


            } 
            throw new BadRequestException({ message: "กรุณาตรวจสอบ ยอดเทิร์นก่อนทำการถอน", turnStatus: true })
        }
        await this.memberTurnService.syncMember(member)
        throw new BadRequestException({ message: "กรุณา รีเฟรชหน้าเว็บ 1 ครั้ง เพื่ออัพเดทข้อมูล", turnStatus: true })
       
        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];




    }

    @Post('CutCreditV2')
    async CutCreditV2(
        @Body() input: WithdrawMemberDto
    ) {
        this.logger.log(`CutCreditV2 ${input.username} hit`);
        // throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true ,status:400})
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

        this.logger.log(`get member  ${input.username} pass`);
        if (!member) throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true })
        this.logger.log(`get setting  ${input.username} =`);
        const setting = await this.memberTurnService.getSetting(member.company, member.agent)
        this.logger.log(`get setting  ${input.username} pass`);
        if (!setting || setting.system_status == false) throw new BadRequestException({ message: "เว็บปิดใช้งาน", turnStatus: true })


        if (setting.wd_status == false) throw new BadRequestException({ message: "ระบบถอนปิดใช้งานชั่วคราว", turnStatus: true })
        console.log(` ${input.username} sync`, member.sync)

        console.log('synccccc', member.sync)

        let member_turn_v2
        if (member.sync) {
            //check turn V2
            console.log(` ${input.username} getturn`)
            member_turn_v2 = await this.memberTurnService.getMemberTurn(input.username)
            if (!member_turn_v2) {
                const setting = await this.memberTurnService.getSetting(member.company, member.agent)
                member_turn_v2 = await this.memberTurnService.createTurnV2(member, setting, 0)
            }
            // console.log(member_turn_v2)
            console.log(` ${input.username} getturn done`)
            const credit = await this.memberService.getCreditByDisplaynameV2(member, setting)
            console.log(` ${input.username} getcredit done`)
            if (credit.balance < input.amount) throw new BadRequestException({ message: "ถอนไม่ได้ เครดิตปัจจุบันไม่พอ", turnStatus: true })
            this.logger.log(`cutting credit ${input.username} hit`);
            const result_withdraw: CutCreditDto = await this.memberService.cutCreditV2(input.amount, member, setting)
            this.logger.log(`cutting credit ${input.username} pass`);
            result_withdraw.type = 'common'
            result_withdraw.withdraw_amount = input.amount
            result_withdraw.remark = `รายการกดถอนแทนสมาชิก ${input.username} จำนวน ${result_withdraw.withdraw_amount} บาท โดย ${input.operator}`

            //save withdrawlist
            this.logger.log(`saving withdraw ${input.username} =`);
            await this.memberService.sendWithdrawListManual(result_withdraw, member, input.operator)
            return { message: "รายการแจ้งถอนสำเร็จ", turnStatus: false }
            // do transfer if auto






        }
        throw new BadRequestException({ message: "กรุณาตรวจสอบ ยอดเทิร์นก่อนทำการถอน", turnStatus: true })
        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];




    }
    @Post('WheelBuy')
    async cutCreditWheelBuyFeature(
        @Body() input: BuyFeatureDto
    ) {
        this.logger.log('cutCreditWheelBuyFeature hit');
        // throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true ,status:400})
        const cacheName = `_withdraw_member_Wheel_${input.username}_${input.amount.toString()}`

        if (await this.cacheManager.get(cacheName)) return
        await this.cacheManager.set(cacheName, 1, { ttl: 5 })


        if (input.amount <= 0) throw new BadRequestException({ message: "invalid amount" })
        const value = await this.cacheManager.get('_member_info_' + input.username.toLocaleLowerCase());
        let member: Members = null
        if (value) {
            member = plainToClass(Members, value)
        } else {
            member = await this.memberService.getMember(input.username)
        }


        if (!member) throw new NotFoundException({ message: "ไม่พบข้อมูลยูสเซ่อร์", turnStatus: true })
        const setting = await this.memberTurnService.getSetting(member.company, member.agent)
        if (!setting || setting.system_status == false) throw new BadRequestException({ message: "เว็บปิดใช้งาน", turnStatus: true })


        console.log("llll:", member.sync)
        if (member.sync) {
            //check turn V2
            const credit = await this.memberService.getCreditByDisplaynameV2(member, setting)
            console.log(credit)
            if (credit.balance < input.amount) throw new BadRequestException("เครดิตปัจจุบันไม่เพียงพอ")
            const result_withdraw: CutCreditDto = await this.memberService.cutCreditV2(input.amount, member, setting)
            result_withdraw.type = 'wheel'
            result_withdraw.withdraw_amount = input.amount
            result_withdraw.remark = `รายการซื้อกงล้อจาก  ${input.username} จำนวน ${input.amount} เครดิต `
            //save withdrawlist
            await this.memberService.saveCutCreditRecord(result_withdraw, member.username)
            return { message: 'Success deduct credit' }
            // member_turn_v2 = await this.memberTurnService.getMemberTurn(input.username)
            // console.log(member_turn_v2)


        } else {
            await this.memberTurnService.syncMember(member)
            throw new BadRequestException({ message: "unSync" })
        }

        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];




    }

    @Post('WithdrawAff')
    async withdrawMemberAffiliate(
        @Body() input: WithdrawMemberDto
    ) {
        this.logger.log('withdrawMemberAffiliate hit');
        input.amount = parseInt( input.amount.toString())
        if(input.amount < 1) throw new BadRequestException({ message: `ไม่สามารภถอนยอดน้อยกว่า 1 บาท ได้ `, turnStatus: true })
       
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
        if(input.amount < setting.least_wd_credits) throw new BadRequestException({ message: `ถอนไม่ได้ ยอดถอนขั้นต่ำ คือ ${setting.least_wd_credits}`, turnStatus: true })
       


        const res = await this.memberService.cutCreditAffiliate(member, input.amount)
        const result_withdraw = new CutCreditDto()
        result_withdraw._id = `af_${res.id}`
        result_withdraw.type = 'affliliate'
        result_withdraw.withdraw_amount = input.amount
        console.log(`withdraw aff amount ${input.username} ${input.amount}`)
        console.log(`withdraw aff amount 2 ${JSON.stringify( result_withdraw)} `)
        result_withdraw.remark = `รายการแจ้งถอน รายได้ จาก ${input.username} จำนวน ${input.amount} บาท  `
        //save withdrawlist
        await this.memberService.sendWithdrawList(result_withdraw, member)
        return { message: `รายการแจ้งถอนรายได้ สำเร็จ `, turnStatus: false }


        // $valids = $b->json()['validAmount'];
        // $outs = $b->json()['outstanding'];




    }

    @Put()
    async updateTurn(

        @Body() input: UpdateMemberTurnDto
    ) {
        this.logger.log('updateTurn hit');

        let member = await this.memberService.getMember(input.username.toLocaleLowerCase())

        if (!member) throw new NotFoundException()
        if(input.operator){
            await this.memberTurnService.saveUserTransaction(input.operator, 'UPDATE_TURN', `แก้ไขเทิร์นสมาชิก user: ${input.username}`, input, input.ip_operator, member.company, member.agent)
      
        }
       if (!member.sync) {

            await this.memberTurnService.syncMember(member)
            const member_turn = await this.memberTurnService.getMemberTurn(input.username)
            if (!member_turn) throw new NotFoundException()
            const new_turn = await this.memberTurnService.updateMemberTurn(member_turn, input)

            return new_turn
        } else {
            const member_turn = await this.memberTurnService.getMemberTurn(input.username)
            if (!member_turn) throw new NotFoundException()
            const new_turn = await this.memberTurnService.updateMemberTurn(member_turn, input)

            return new_turn
        }














        // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
        // if (!a) throw new NotFoundException()

        // const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
        // // if (member) throw new BadRequestException("Duplicate Username")
        // input.username = input.username.toLocaleLowerCase() 


        // return await this.memberTurnService.saveOrUpdateManyMemberTurn(input)
    }

}