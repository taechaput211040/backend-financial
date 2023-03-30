import {
  BadRequestException,
  Inject,
  CACHE_MANAGER,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Req,
  Response,
  SerializeOptions,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToClass } from 'class-transformer';
import { AuthService } from './auth.service';
import { AuthGuardJwt } from './autn-guard.jwt';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response as ResEx, Request } from 'express';
import { JwtStrategy } from './jwt.strategy';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { WebsiteService } from 'src/Website/website.service';
import { NotFoundException } from '@nestjs/common/exceptions';
import { LoginDto, LoginAccountDto } from 'src/Input/login.dto';
import { Cache } from 'cache-manager';

import { RealIP } from 'nestjs-real-ip';
import { SettingDto } from 'src/Input/setting.dto';
import { RegisterUserDto } from 'src/Input/create.user.accounting';
import { UserAccounting } from 'src/Entity/user.accounting.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountService } from 'src/account/account.service';
@Controller('/api/Auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly AccountService: AccountService,
    private readonly authService: AuthService,
    // private readonly userService: UserService,
    private readonly jwtService: JwtService,
    // private readonly tokenService: TokenService
    @InjectRepository(UserAccounting, 'allaccounting')
    private readonly UserAccounting: Repository<UserAccounting>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('/Login')
  async login(
    @Body() input: LoginDto,
    @Req() request: Request,

    @RealIP() ip: string,
    @Response({ passthrough: true }) response: ResEx,
  ) {
    this.logger.log('Login hit');
    // let user = await this.userService.find(agent, username)
    //    console.log(user)
    console.log(request.headers);
    console.log(input);

    const result = await this.authService.getSettingByHash(input.hash);
    let setting = new SettingDto();
    setting = { ...setting, ...result };

    if (!setting) throw new UnauthorizedException('unauthorized');

    let member = await this.authService.validateMember(input, setting);
    const username = member.username.toUpperCase();
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
    await this.authService.updateTokenMember(accessToken, member, ip);
    //   const a = {
    //     "username": "LS2243825",
    //     "accessTokenMember": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6Ijc1MzVjMzYyLWQzMTgtNDA2OS1hYzcxLTUzOTg2OWRjNjA0YSIsInVzZXJuYW1lIjoiTFMyMjQzODI1Iiwic3RhdHVzIjoxLCJ0cmFuc2FjdGlvbiI6IjE2NTgxOTA4MzAifQ.8EhhU_SDIHVzcozNSx0Av9G90m1Tct1t5WntXHawRZU",
    //     "id": "7535c362-d318-4069-ac71-539869dc604a",
    //     "randomkey": 197539
    //   }
    return {
      username: member.username.toUpperCase(),
      accessTokenMember: accessToken,
      id: member.id,
      randomkey: ssid,
      phone: member.phone,
    };
  }

  // @Post('/two-factor')
  // async twofactor(
  //     @Body('id') id: string,
  //     @Body('code') code: string,
  //     @Response({ passthrough: true }) response: ResEx,
  //     @Req() request: Request,
  //     @Body('secret') secret?: string
  // ) {
  //     console.log(request.headers['x-real-ip'])
  //     let user = await this.userService.findByID(id)
  //     if (!user) throw new BadRequestException('ข้อมูลไม่ถูกต้อง')

  //     if (!secret) secret = user.tfa_secret

  //     const verified = speakeasy.totp.verify({
  //         secret, encoding: 'ascii', token: code
  //     })

  //     if (!verified) throw new BadRequestException('ข้อมูลไม่ถูกต้อง')

  //     const user_update = await this.userService.updateUserSecret(user, secret)
  //     console.log(user_update)

  //     const accessToken = await this.jwtService.signAsync({
  //         id
  //     }, { expiresIn: '1 days' })

  //     const refreshToken = await this.jwtService.signAsync({
  //         id
  //     }, { expiresIn: '1 days' })
  //     const expired_at = new Date()
  //     expired_at.setDate(expired_at.getDate() + 2)

  //     if (request.headers['x-real-ip']) await this.userService.upDateIP(user_update, request.headers['x-real-ip'].toString())
  //     await this.tokenService.save({
  //         user_id: user.id,
  //         token: refreshToken,
  //         expired_at: expired_at
  //     })
  //     // console.log(response.status())
  //     if (!user.menu_permission) user = await this.userService.assignDefaultMenu(user_update)
  //     response.cookie('refresh_token', refreshToken, { httpOnly: true, maxAge: 1 * 24 * 60 * 60 * 1000 })
  //     response.status(200)
  //     return {
  //         id: user.id,
  //         token: accessToken,
  //         refreshToken: refreshToken,
  //         verify: user.tfa_secret ? true : false,
  //         role: user.role,
  //         username: user.username,
  //         agent: user.agent,
  //         s_admin: user.s_admin,
  //         limittopup: user.limittopup,
  //         creditperday: user.creditperday,
  //         menu: user.menu_permission,
  //         ip: user.ip

  //     }
  // }

  // @Post('refresh')

  // async refresh(
  //     @Req() request: Request,
  //     @Response({ passthrough: true }) response: ResEx
  // ) {
  //     this.logger.log('refresh hit')
  //     try {
  //         const refresh_token: any = request.headers['autorization']
  //         console.log(refresh_token)
  //         const { id } = await this.jwtService.verifyAsync(refresh_token)

  //         const tokenEntiry = await this.tokenService.findOne({
  //             user_id: id,
  //             expired_at: MoreThanOrEqual(new Date())
  //         })

  //         if (!tokenEntiry) throw new UnauthorizedException()

  //         const accessToken = await this.jwtService.signAsync({ id }, { expiresIn: '2 days' })
  //         response.status(200)
  //         return {
  //             token: accessToken
  //         }
  //     } catch (error) {
  //         throw new UnauthorizedException()
  //     }

  // }
  // @Get('user')
  // @UseGuards(JwtStrategy)
  // @UseInterceptors(ClassSerializerInterceptor)
  // async getAuthUser(
  //     @Req() request: Request,
  //     @Response({ passthrough: true }) response: ResEx
  // ) {
  //     console.log("user hit")
  //     const token: any = request.headers['autorization']
  //     console.log(token)
  //     const { id } = await this.jwtService.verifyAsync(token)
  //     const user = await this.userService.findByID(id)

  //     return user

  // }
  // @Get('user/V2')
  // @UseGuards(JwtStrategy)
  // @UseInterceptors(ClassSerializerInterceptor)
  // async getAuthUserV2(
  //     @Req() request: Request,
  //     @Response({ passthrough: true }) response: ResEx
  // ) {
  //     console.log("user hit")
  //     const token: any = request.headers['authorization']
  //     console.log(token)
  //     const { id } = await this.jwtService.verifyAsync(token)
  //     const user = await this.userService.findByID(id)

  //     return user

  // }
  // @Post('/logout')
  // @HttpCode(204)
  // async logout(
  //     @Req() request: Request,
  //     @Response({ passthrough: true }) response: ResEx
  // ) {
  //     const token: any = request.headers['autorization']
  //     await this.tokenService.delete({ token: token })
  //     response.clearCookie('refresh_token')
  //     return
  // }

  //accounting
  @Post('/accounting/Login')
  async LoginAccounting(@Body() form: LoginAccountDto) {
    let user = await this.AccountService.getUserExit(form.username);
    if (!user) throw new BadRequestException('ข้อมูลไม่ถูกต้อง');
    if (!user.status) throw new BadRequestException('คุณถูกระงับการใช้งาน');
    if (!(await bcrypt.compare(form.password, user.password)))
      throw new BadRequestException('ข้อมูลไม่ถูกต้อง');
    const username = user.username;
    const role = user.role;
    const accessToken = await this.jwtService.signAsync({
      username,
      role,
    });

    const expire_at = new Date();
    expire_at.setDate(expire_at.getDate() + 1);
    await this.AccountService.saveTokenUser({
      username: user.username,
      token: accessToken,
      expire_at: expire_at,
    });

    return {
      id: user.id,
      token: accessToken,
      refreshToken: accessToken,
      role: user.role,
      expire_at: expire_at,
    };
  }

  @Post('/accounting/register')
  async Register(@Body() RegisterUserDto: RegisterUserDto) {
    const user = new UserAccounting();
    const exitingUser = await this.UserAccounting.findOne({
      where: [{ username: RegisterUserDto.username }],
    });
    if (exitingUser)
      throw new BadRequestException(['this username is already taken']);

    user.username = RegisterUserDto.username;
    user.password = await this.authService.hashPassword(
      RegisterUserDto.password,
    );
    user.role = RegisterUserDto.role;
    user.status = RegisterUserDto.status;
    let res = await this.UserAccounting.save(user);
    let token = this.authService.getTokenForUserAccounting(user);

    return {
      ...res,
      token: token,
    };
  }
  //accounting
}
