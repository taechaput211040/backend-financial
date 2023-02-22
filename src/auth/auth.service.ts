import { BadRequestException, HttpService, NotFoundException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateMemberDto } from "src/Input/create.member.dto";
import { LoginDto } from "src/Input/login.dto";
import { Members } from "src/Member/member.entiry";
import { WebsiteService } from "src/Website/website.service";
import { Repository } from "typeorm";
// import { User } from "src/User/user.entity";

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(Members)
    private readonly memberRepository: Repository<Members>,
    private readonly jwtservice: JwtService,
    private httpService: HttpService,

    private websiteService: WebsiteService
  ) { }

  public getTokenForUser(user: CreateMemberDto): string {
    return this.jwtservice.sign({
      // role: user.role,
      // ag:user.agent,
      // sa:user.s_admin,
      // st:user.status,
      // ltp:user.limittopup,
      // cpd:user.creditperday,
      usn: user.username

    });
  }

  public async updateTokenMember(token:string,member:Members,ip:string){
    member.member_token = token
    member.ip = ip
await this.memberRepository.save(member)
  }
  public async validateMember(input: LoginDto) {
    // const web = await this.websiteService.getWebInfoByMemberLink(input.origin)
    // if (!web) throw new UnauthorizedException('unauthorized')
    // if (!web.status) throw new UnauthorizedException('เว็บไซต์ปิดปรับปรุง')

    const member = await this.getMemberByUsername(input.username)
    if (!member) throw new NotFoundException('ไม่พบข้อมูลในระบบ กรุณาตรวจสอบ username password')
    // if (member.agent != web.agent_prefix.toLowerCase()) throw new UnauthorizedException('unauthorized')
    if (member.password != input.password) throw new BadRequestException('ท่านกรอกข้อมูลไม่ถูกต้อง')
    if (!member.status) throw new UnauthorizedException('คุณถูกระงับการใช้งาน')
return member
  }
  public async getMemberByUsername(username: string): Promise<Members> {
    return await this.memberRepository.findOne({
      where: { username: username.toLowerCase() }

    });
  }
  public async getHash(user: CreateMemberDto) {
    const url = `${process.env.ALL_SETTING}/api/Setting/Main/${user.company}/${user.agent}`
    try {
      const setting = await this.httpService.get(url).toPromise()
      return setting.data
    } catch (error) {
      return null
    }

  }

}