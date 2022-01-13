import { Body, CACHE_MANAGER, ClassSerializerInterceptor, Controller, Get, HttpCode, Inject, Logger, Param, Post, Req, Request, SerializeOptions, UnauthorizedException, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserDto } from "src/User/create.user.dto";
import { AuthService } from "./auth.service";
import { AuthGuardJwt } from "./autn-guard.jwt";
import { LoginDto } from "./login.dto";
import { Cache } from "cache-manager";

@Controller('/api/Login/auth')
@SerializeOptions({ strategy: 'excludeAll', groups: ['superadmin'] })
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private readonly authService: AuthService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    @Get('/check/:username/:ssid')
    // @UseGuards(AuthGuardJwt)
    async checkSession(@Req() request,
        @Param('username') username: string,
        @Param('ssid') ssid: string,
    ) {
        this.logger.log("test")
        const cac = await this.cacheManager.get('_SSID_' + username)
        if (cac) {
            this.logger.log("test "+cac)

            this.logger.log("ssid "+ssid)
            if (cac == ssid) {
                // await this.cacheManager.set('_SSID_' + username,ssid, { ttl: 3600 });
                const ssid_new = Math.floor(Math.random() * 100000) + 100001
                await this.cacheManager.set('_SSID_' + username, ssid_new, { ttl: 3600 });
                this.logger.log("ok")
                return {

                    ssid: ssid_new
                }
            } else {
                this.logger.log("401")
                throw new UnauthorizedException()
            }
        } else{
            this.logger.log("4012")
            throw new UnauthorizedException()
        }

    }
    @Post()
    // @UseGuards(AuthGuard('jwt'))
    @HttpCode(200)
    async login(
        @Req() request,
        @Body() body: LoginDto
    ) {
        // this.logger.log(request.headers)
        this.logger.log("teasdasdst")

        //check in rico
        let login_rico = await this.authService.loginRico(body)
        const ssid = Math.floor(Math.random() * 100000) + 100001
        await this.cacheManager.set('_SSID_' + login_rico.username, ssid, { ttl: 3600 });
        login_rico.randomkey = ssid
        this.logger.log( login_rico)
        return login_rico;



    }
    @Get('role')
    @UseGuards(AuthGuardJwt)
    async getRole(@Req() request) {

        return request.headers

    }

    @Post('/user')
    // @UseGuards(AuthGuardJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async createdUser(@Req() request, @Body() body: UserDto) {
        this.logger.log(request.headers.key)
        if (request.headers.key == process.env.SUPERADMIN_KEY_MASTER) {
            return await this.authService.createUser(body);

        } else {
            throw new UnauthorizedException();
        }


    }
}