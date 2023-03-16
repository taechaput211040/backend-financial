import {
  BadRequestException,
  Body,
  CACHE_MANAGER,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  SerializeOptions,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { DepositNotifyDto } from 'src/Input/create.deposit.notify.dto';
import { CreateNotifyDto } from 'src/Input/create.notify.setting.dto';
import { RegisterNotifyDto } from 'src/Input/create.register.notify.dto';
import { WithdrawNotifyDto } from 'src/Input/create.withdraw.notify.dto';
import { UpdateNotifyDto } from 'src/Input/update.notify.dto';
import { MemberService } from './member.service';
import { Cache } from 'cache-manager';
import { CreateMemberDto } from 'src/Input/create.member.dto';
import { WebsiteService } from 'src/Website/website.service';
import { Members } from './member.entiry';
import { plainToClass } from 'class-transformer';
import { UpdateMemberDto } from 'src/Input/update.member.dto.ts';
import { AuthGuardJwt } from 'src/auth/autn-guard.jwt';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { MemberConfigService } from './member.config.service';
import { MemberTurnService } from './member.turn.service';
import { ChangePasswordDto } from 'src/Input/change.password.dto';
import { ChangePasswordFrontendDto } from 'src/Input/change.password.frontend.dto';
import { SettingDto } from 'src/Input/setting.dto';
import { Setting } from 'src/Setting/setting.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
@Controller('api/Member')
@SerializeOptions({ strategy: 'excludeAll' })
export class MemberController {
  private readonly logger = new Logger(MemberController.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly memberService: MemberService,
    private readonly memberTurnService: MemberTurnService,
    private readonly websiteService: WebsiteService,
    private readonly memberConfigService: MemberConfigService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  @Get('/getAll/:agent')
  // @UseGuards(AuthGuard('jwt'))
  async getAll(@Param('agent') agent:string) {
    console.log('asdasd')
    return  await this.memberService.getAll(agent)
 
  }    
  @Post('/getAll')
  // @UseGuards(AuthGuard('jwt')) 
  async PostAll( 
    @Body() input :Members[]  
  ) {
    console.log(input.length)
    input.map(async x=>{
      try { 
        await this.memberService.saveAll(x)
      
      } catch (error) {
        console.log('asdasd')
      }
    
    })
 
   

  }
  @Get('/testauth')
  @UseGuards(AuthGuard('jwt'))
  async testauth() {
    await this.cacheManager.reset();
    return 'ok';
  }
  @Get('/Reset')
  async resetCache() {
    await this.cacheManager.reset();
    return 'ok';
  }
  @Get(':displayname')
  async getMemberInfo(@Param('displayname') username: string) {
    const value = await this.cacheManager.get(
      '_member_info_' + username.toLowerCase(),
    );
    console.log('by dispaly hit');
    if (value) return plainToClass(Members, value);

    let member = await this.memberService.getMember(username.toLowerCase());

    if (!member)
      throw new NotFoundException({ message: 'ไม่พบ username ในระบบ' });

    if (!member.aff_id) {
      // this.logger.log('no aff_id  hit');
      // const web = await this.websiteService.getWebInfoByHashAllData(member.hash)
      // member = await this.memberService.generateAffid(member, web);
    }

    console.log(member.sync);
    if (!member.sync) await this.memberTurnService.syncMember(member);
    await this.cacheManager.set(
      '_member_info_' + username.toLocaleLowerCase(),
      member,
      { ttl: null },
    );

    const setting = await this.memberTurnService.getSetting(
      member.company,
      member.agent,
    );

    return member;
  }
  @Get('/ByUsername/:username')
  async getMemberByUsername(@Param('username') username: string) {
    this.logger.log('getMemberByUsername  hit');
    const value = await this.cacheManager.get(
      '_member_' + username.toLocaleLowerCase(),
    );

    if (value) return value;
    const decode_username = this.decodeSeamlessUsername(
      username.toLocaleLowerCase(),
    );
    const member = await this.memberService.getMember(
      this.decodeSeamlessUsername(username.toLocaleLowerCase()),
    );
    if (!member) {
      throw new NotFoundException();
    }

    const cache_data = {
      companyKey: member.company,
      agentKey: member.agent,
      username: this.generateSeamlessUsername(member),
      displayUsername: member.username,
      depositUrl: await this.getMemberUrl(member),
      currency: 'THB',
    };
    await this.cacheManager.set(
      '_member_' + username.toLocaleLowerCase(),
      cache_data,
      { ttl: null },
    );

    return cache_data;
  }

  @Get('/ByDisplayname/:displayname')
  async getMemberByDisplayname(@Param('displayname') displayname: string) {
    this.logger.log('getMemberByUsername  hit');
    const value = await this.cacheManager.get(
      '_member_' + displayname.toLocaleLowerCase(),
    );

    if (value) return value;

    const member = await this.memberService.getMember(
      displayname.toLocaleLowerCase(),
    );
    if (!member) throw new NotFoundException();

    const cache_data = {
      companyKey: member.company,
      agentKey: member.agent,
      username: this.generateSeamlessUsername(member),
      displayUsername: member.username,
      depositUrl: await this.getMemberUrl(member),
      currency: 'THB',
    };
    await this.cacheManager.set(
      '_member_' + displayname.toLocaleLowerCase(),
      cache_data,
      { ttl: null },
    );

    return cache_data;
  }

  @Get('/ByProviderUsername/:provider/:providerUsername')
  async getMemberByproviderUsername(
    @Param('providerUsername') providerUsername: string,
    @Param('provider') provider: string,
  ) {
    this.logger.log('ByProviderUsername  hit');
    const value = await this.cacheManager.get(
      '_provider_username_' +
        providerUsername.toLocaleLowerCase() +
        '_' +
        provider,
    );

    if (value) return value;
    const member_config =
      await this.memberConfigService.getUsernameByProviderUsername(
        providerUsername,
        provider.toUpperCase(),
      );
    if (!member_config) {
      throw new NotFoundException();
    }
    const member = await this.memberService.getMember(
      member_config.username.toLocaleLowerCase(),
    );
    const cache_data = {
      companyKey: member.company,
      agentKey: member.agent,
      username: member_config.username,
      providerUsername: member_config.provider_username,
    };

    await this.cacheManager.set(
      '_provider_username_' +
        providerUsername.toLocaleLowerCase() +
        '_' +
        provider,
      cache_data,
      { ttl: null },
    );

    return cache_data;
  }
  @Get('/Withdraw/:from/:to/:displayname')
  async getMemberWithdrawFromTo(
    @Param('displayname') displayname: string,
    @Param('from') from: string,
    @Param('to') to: string,
  ) {
    this.logger.log('getMemberWithdrawFromTo  hit');
    // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

    // if (value) return value

    const member = await this.memberService.getMember(
      displayname.toLocaleLowerCase(),
    );
    if (!member) throw new NotFoundException();

    return await this.websiteService.getWithdrawMemberFromTo(from, to, member);
  }
  @Get('/Credit/:displayname')
  async getCreditByDisplayname(@Param('displayname') displayname: string) {
    this.logger.log('getCreditByDisplayname  hit');
    // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

    // if (value) return value

    const member = await this.memberService.getMember(
      displayname.toLocaleLowerCase(),
    );
    if (!member) throw new NotFoundException();

    return await this.memberService.getCreditByDisplayname(member);
  }
  @Get('/Verify/:company/:agent/:fromBankRef')
  async verufy(
    @Param('company') company: string,
    @Param('agent') agent: string,
    @Param('fromBankRef') fromBankRef: string,
  ) {
    this.logger.log('verufy  hit');
    // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

    // if (value) return value

    const member = await this.memberService.verifyMember(
      company.toLowerCase(),
      agent.toLowerCase(),
      fromBankRef,
    );
    if (member.length == 0) throw new NotFoundException();
    return member;
  }
  @Get('/VerifySCB/:company/:agent/:fromBankRef/:fromBank/:name')
  async verufySCB(
    @Param('company') company: string,
    @Param('agent') agent: string,
    @Param('fromBankRef') fromBankRef: string,
    @Param('fromBank') fromBank: string,
    @Param('name') name: string,
  ) {
    this.logger.log('verufySCB  hit');
    // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

    // if (value) return value

    const member = await this.memberService.verifyMemberSCB(
      company.toLowerCase(),
      agent.toLowerCase(),
      fromBankRef,
      fromBank,
      name,
    );
    console.log(member);
    if (member.length == 0) throw new NotFoundException();
    return member;
  }
  @Get('/VerifyTRUE/:company/:agent/:phone')
  async verifyTrueApi(
    @Param('company') company: string,
    @Param('agent') agent: string,
    @Param('phone') phone: string,
  ) {
    this.logger.log('verifyTrueApi  hit');
    // const value = await this.cacheManager.get('_member_' + displayname.toLocaleLowerCase());

    // if (value) return value
    const member = await this.memberService.getMemberByPhone(
      phone,
      company.toLowerCase(),
      agent.toLowerCase(),
    );

    if (!member) return null;
    return member;
  }

  @Post('/Realusername')
  @UsePipes(new ValidationPipe({ transform: true }))
  async Realusername(@Body() input: any) {
    this.logger.log('Realusername  hit');
    const cacheName =
      '_realusername_' + input.username.toUpperCase() + '_' + input.provider;
    const value = await this.cacheManager.get(cacheName);
    if (value) return;
    this.logger.log(input);
    const member_config = await this.memberConfigService.getByUsername(
      input.username.toLowerCase(),
      input.provider.toUpperCase(),
    );
    if (member_config) return;
    await this.memberConfigService.saveRealUsername(
      input.username,
      input.provider,
      input.opcode,
    );

    await this.cacheManager.set(
      '_realusername_' + input.username.toUpperCase() + '_' + input.provider,
      '1',
      { ttl: null },
    );
  }
  @Post('/Migrate')
  @UsePipes(new ValidationPipe({ transform: true }))
  async migrateMember(@Body() input: any) {
    this.logger.log('migrateMember  hit');

    let members = [new CreateMemberDto()];
    members = input.data;
    this.logger.log(members);
    //   return members
    await this.memberService.saveOrUpdateManyMember(members);
  }
  @Post('/Frontend/:hash')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMemberFrontend(
    @Param('hash') hash: string,
    @Body() input: CreateMemberDto,
  ) {
    this.logger.log('createMemberFrontend hit');

    const setting: Setting = await this.memberService.getSettingByhash(hash);
    if (!setting) throw new BadRequestException('ไม่พบข้อมูลเว็บ');
    input.agent = setting.agent_username.toLowerCase();
    input.company = setting.company.toLowerCase();
    this.logger.log('validating');
    await this.memberService.validateMemberData(input);
    this.logger.log('creating');
    const member = await this.memberService.generateMember(input, setting);

    await this.memberTurnService.createTurnV2(member, setting, 0);
    const username = member.username;
    const agent = member.agent;
    const company = member.company;
    const accessToken = await this.jwtService.signAsync({
      username,
      agent,
      company,
    });

    const ssid = Math.floor(Math.random() * 100000) + 100001;
    await this.cacheManager.set('_SSID_' + input.username.toUpperCase(), ssid, {
      ttl: 3600,
    });
    await this.authService.updateTokenMember(accessToken, member, member.ip);
await this.memberService.sendToLineNotify(member,'หน้าเว็บ',member.username,member.recommender)
    return {
      data: {
        username: member.username.toUpperCase(),
        password: member.password,
      },
      member: member,
      username: member.username.toUpperCase(),
      accessTokenMember: accessToken,
      id: member.id,
      randomkey: ssid,
    };
  }
  @Post('/FrontendAffiliate/:hash')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMemberFrontendAff(
    @Param('hash') hash: string,
    @Body() input: CreateMemberDto,
  ) {
    this.logger.log('createMemberFrontendAff hit');

    const setting: Setting = await this.memberService.getSettingByhash(hash);
    if (!setting) throw new BadRequestException('ไม่พบข้อมูลเว็บ');
    input.agent = setting.agent_username.toLowerCase();
    input.company = setting.company.toLowerCase();
    this.logger.log('validating');
    await this.memberService.validateMemberData(input);
    this.logger.log('creating');
    const member = await this.memberService.generateMember(input, setting);

    await this.memberTurnService.createTurnV2(member, setting, 0);
    const username = member.username;
    const agent = member.agent;
    const company = member.company;
    const accessToken = await this.jwtService.signAsync({
      username,
      agent,
      company,
    });

    const ssid = Math.floor(Math.random() * 100000) + 100001;
    await this.cacheManager.set('_SSID_' + input.username.toUpperCase(), ssid, {
      ttl: 3600,
    });
    await this.authService.updateTokenMember(accessToken, member, member.ip);
await this.memberService.sendToLineNotify(member,'affiliate',member.username,member.parent_username)
    return {
      data: {
        username: member.username.toUpperCase(),
        password: member.password,
      },
      member: member,
      username: member.username.toUpperCase(),
      accessTokenMember: accessToken,
      id: member.id,
      randomkey: ssid,
    };
  }
  @Post('/Auto/:hash')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMemberAutoBackend(
    @Param('hash') hash: string,
    @Body() input: CreateMemberDto,
  ) {
    this.logger.log('createMemberAutoBackend hit');

    const setting: Setting = await this.memberService.getSettingByhash(hash);
    if (!setting) throw new BadRequestException('ไม่พบข้อมูลเว็บ');
    input.agent = setting.agent_username.toLowerCase();
    input.company = setting.company.toLowerCase();
    this.logger.log('validating');
    await this.memberService.validateMemberData(input);
    this.logger.log('creating');
    input.password = input.phone;

    const username = input.username;
    const agent = input.agent;
    const company = input.company;
    const accessToken = await this.jwtService.signAsync({
      username,
      agent,
      company,
    });
    input.member_token = accessToken;
    const member = await this.memberService.generateMember(input, setting);
    await this.memberTurnService.createTurnV2(member, setting, 0);
    await this.memberService.sendToLineNotify(member,'หน้าออโต้',input.operator,input.knowFrom)
  
    return {
      username: member.username.toUpperCase(),
      password: member.password,
    };
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMember(@Body() input: CreateMemberDto) {
    this.logger.log('createMember hit');
    // const a = await this.websiteService.getWebInfoByHashAllData(input.hash)
    // if (!a) throw new NotFoundException()

    // const member = await this.memberService.getMember(input.username.toLocaleLowerCase())
    // // if (member) throw new BadRequestException("Duplicate Username")
    input.username = input.username.toLocaleLowerCase();

    this.logger.log('creating');
    return await this.memberService.saveOrUpdateManyMember(input);
  }
  @Put()
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateMember(@Body() input: UpdateMemberDto) {
    this.logger.log('updateMember hit');

    const member = await this.memberService.getMember(
      input.username.toLocaleLowerCase(),
    );
    if (!member) throw new NotFoundException();

    const result = await this.memberService.updateMember(member, input);

    await this.cacheManager.del(`_memberRepo_${input.username.toLowerCase()}`);
    await this.cacheManager.del(
      '_member_info_' + input.username.toLocaleLowerCase(),
    );
    await this.cacheManager.del(
      '_member_' + input.username.toLocaleLowerCase(),
    );
    await this.cacheManager.del(
      '_member_' + this.generateSeamlessUsername(member),
    );
    return result;
  }
  @Put('/Password')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updatePassword(@Body() input: ChangePasswordFrontendDto) {
    this.logger.log('updateMember hit');

    const member = await this.memberService.getMember(
      input.username.toLocaleLowerCase(),
    );
    if (!member) throw new NotFoundException();

    const result = await this.memberService.updateMemberPassword(member, input);

    return { status: true, message: 'บันทึกสำเร็จ' };
  }
  @Delete('/:hash')
  async deleteNotifySetting(
    @Param('hash') hash: string,
    @Req() request: Request,
  ) {
    if (request.headers['key'] != process.env.AUTH_SECRET)
      throw new UnauthorizedException();

    // return await this.notifyService.dele(input)
  }

  private generateSeamlessUsername(member: Members) {
    let seamless_username = member.company + member.agent + member.username;
    if (seamless_username.length > 16) {
      seamless_username = seamless_username.slice(0, 16);
    }
    return seamless_username;
  }
  private decodeSeamlessUsername(username: string) {
    return username.slice(4);
  }
  async getMemberUrl(member: Members) {
    const web_cache = await this.cacheManager.get('_web_Domain_' + member.hash);
    if (web_cache) return 'https://member.' + web_cache;

    const web = await this.websiteService.getWebInfoByHash(member.hash);
    await this.cacheManager.set('_web_Domain_' + member.hash, web.website, {
      ttl: null,
    });
    return 'https://member.' + web.website;
  }
}
