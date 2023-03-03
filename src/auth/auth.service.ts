import { BadRequestException, HttpService, NotFoundException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateMemberDto } from "src/Input/create.member.dto";
import { LoginDto } from "src/Input/login.dto";
import { SettingDto } from "src/Input/setting.dto";
import { Members } from "src/Member/member.entiry";
import { WebsiteService } from "src/Website/website.service";
import { Repository } from "typeorm";

import { AxiosResponse } from 'axios';
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

  async getSettingByHash(hash:string): Promise<AxiosResponse | null>{
    const url = `${process.env.ALL_SETTING}/api/Setting/${hash}/`
    try {
      const setting = await this.httpService.get(url).toPromise()
      return setting.data
    } catch (error) {
      return null
    }
  }
  public async validateMember(input: LoginDto , setting:SettingDto) {
    if (!setting) throw new UnauthorizedException('unauthorized')
    if (!setting.system_status) throw new UnauthorizedException('เว็บไซต์ปิดปรับปรุง')

    let member = await this.getMemberByUsername(input.username)
    if (!member){
       member = await this.getMemberByPhone(input.username)
       if(!member) throw new NotFoundException('ไม่พบข้อมูลในระบบ กรุณาตรวจสอบ username password')
    } 
    console.log(member)

    if(setting.agent_username.toLowerCase() != member.agent) throw new NotFoundException('ไม่พบข้อมูลในระบบ กรุณาตรวจสอบ username password')
    if(setting.company.toLowerCase() != member.company) throw new NotFoundException('ไม่พบข้อมูลในระบบ กรุณาตรวจสอบ username password')


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
  public async getMemberByPhone(phone: string): Promise<Members> {
    return await this.memberRepository.findOne({
      where: { phone: phone }

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
public async lineNotiPushRegister(username:string,name:string,lastname:string,create_from:string,create_by:string,recommder:null,hash:string){
  const url_noti =`${process.env.ALL_SUPPORT}/api/Notify/${hash}`
  //  env('ALL_LINE_NOTIFY').'/api/Notify/'.env('MICROSERVICE_KEY');
  let notidata
  try {
    const result_line = await this.httpService.get(url_noti).toPromise()
notidata = result_line.data
  } catch (error) {
    notidata = null
  }
if(!notidata) return
  
    if(!notidata.feature_status || !notidata.status) return

  
}
  // public static function lineNotiPushRegister($username,$name,$lastname,$create_from,$create_by,$recommder=null)
  //   { 
  //       $cacheName ='Noti_setting_'.env('AGENT');
  //       if(Cache::has($cacheName)){
  //           $noti_setting = Cache::get($cacheName);
     
  //           if($noti_setting['feature_status'] == false || $noti_setting['status'] ==false )
  //           {
  //               return;
  //           }
  //       } else {
  //           $cacheName ='Noti_setting_'.env('AGENT');
  //           $url = env('ALL_LINE_NOTIFY').'/api/Notify/'.env('MICROSERVICE_KEY');
  //           $res = Http::get($url);
  //           Cache::forever($cacheName,$res->json());
            
  //           $noti_setting =  $res->json();
  //           if($noti_setting['feature_status'] == false || $noti_setting['status'] ==false )
  //           {
  //               return;
  //           }
  //       }
  //       $member_count  = Member::whereDate('created_at', Carbon::today()->toDateString())->orderBy('created_at', 'asc')->count();
  //       $data = [
  //           'count'=>$member_count,
  //           'website'=>env('APP_URL'),
  //           'agent'=>env('AGENT'),
  //           'hash'=>env('MICROSERVICE_KEY'),
  //           'name'=>(string)$name,
  //           'lastname'=>(string)$lastname,
  //           'username'=>(string)$username,
  //           'create_by'=>(string)$create_by ,
  //           'create_from'=>(string)$create_from,
  //           'recommder'=>(string)$recommder,
  //        ];
  //       $url = env('ALL_LINE_NOTIFY').'/api/Notify/Regis/'.env('MICROSERVICE_KEY');
  //        $res =Http::post($url,$data);
  //       return  $res->json();
       
        
  //   }

}