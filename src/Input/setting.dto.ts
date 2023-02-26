
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class SettingDto{


   
    // npm i --save class-validator class-transformer
 
    

    @IsNumber()
    turnNobonus:number;
    
   

    @IsBoolean()
    wdautoAll: boolean;


    @IsNumber()
    wdlimitTime: number;

    @IsBoolean()
    wdlimit: boolean;

    @IsNumber()
    wdlimitcredit: number;

    @IsBoolean()
    wdwhenoutstanding: boolean;

    @IsString()
    companyname: string;//agent prefix

    @IsString()
    companyurl: string;


    @IsString()
    companynlineurl: string;

    @IsString()
    companykey: string;

    @IsNumber()
    least_wd_credits: number;

    @IsNumber()
    wd_auto_amount: number;


    @IsString()
    member_site_name: string;

    @IsString()
    member_logo_url: string;

 
    @IsString()
    line_name: string;

    @IsString()
    token: string;

  
    @IsString()
    register_link: string;

    @IsString()
    login_link: string;


    // extra column
    @IsNumber()
    rico_id: number;

    @IsString()
    company: string;


    @IsString()
    agent_username: string;

    @IsString()
    hash: string;
    @IsOptional()
    system_status:boolean;


    @IsString()
    @IsOptional()
    static_hash: string;

    @IsString()
    @IsOptional()
    provider_hash: string;

    @IsString()
    @IsOptional()
    company_name: string;

    @IsString()
    @IsOptional()
    member_link:string;
    
    @IsString()
    @IsOptional()
    auto_link:string;

    @IsBoolean()
    @IsOptional()
    wd_status:boolean;

    @IsString()
    @IsOptional()
    mysql_db_name:string;
    @IsBoolean()
    @IsOptional()
    wdlimit_time_status:boolean
} 