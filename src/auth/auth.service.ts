import { BadRequestException, HttpService, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/Entity/User.entity";
import { GatewayService } from "src/Gateway/gateway.service";
import { UserDto } from "src/User/create.user.dto";
import { Repository } from "typeorm";
import { LoginDto } from "./login.dto";

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtservice: JwtService,
    private httpService: HttpService,
    private readonly gatewayService: GatewayService,
  ) { }

  public async superAdminKey(): Promise<string> {
    return this.jwtservice.sign({
      role: 'superadmin'
    });



  }
  public async getTokenForUser(body: User): Promise<string> {
    return this.jwtservice.sign({
      role: body.role,
      username: body.username,
      status: body.status,
      name: body.name,
      staff_id: body.staff_id

    });



  }
  public async getTokenForMember(body: User): Promise<string> {
    return this.jwtservice.sign({
      role: body.role,
      username: body.username,
      status: body.status,
      name: body.name,
      staff_id: body.staff_id

    });



  }
  public async validateAuth(body: LoginDto): Promise<any> {

    const auth = await this.userRepository.findOne({ username: body.username });
    if (auth) {
      if (auth.password == body.password) {
        if (auth.status == true) {
          return {key:await this.getTokenForUser(auth
 
          ),
          username:auth.username
        };
        }
      } 
    }

    throw new UnauthorizedException();
  }
  public async createUser(body: UserDto): Promise<User> {

    const us = new User();
    const user_count = await this.userRepository.createQueryBuilder("u")
      .where('u.status = true')
      .getCount();
    body.username = body.username.toLowerCase()
    console.log(user_count)
    // throw new UnauthorizedException();
    if (user_count < 9) {
      us.staff_id = 'CS0' + (user_count + 1)
    } else {
      us.staff_id = 'CS' + (user_count + 1)
    }
    try {
      return await this.userRepository.save({ ...us, ...body });
    } catch (error) {
      throw new BadRequestException(error.detail);
    }




  }
  public async loginRico(body: LoginDto,hash:string): Promise<any> {
// const hash = "4fe56b880271a98c20495111f7b70e9b"
const web = await this.gatewayService.getWebInfoByHash(hash)

const url = 'https://rico.'+web.website+'/api/Login/Auth';
       
    // const url = process.env.RICO_URL + '/api/Login/Auth';
    console.log(url)
    try {
      const result = await this.httpService.post(url,body).toPromise();
      return result.data
    } catch (error) {
      throw new BadRequestException( error.response.data.message)
    }
   
   
  }

}