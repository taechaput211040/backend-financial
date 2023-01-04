import { IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateMemberDto {



    // npm i --save class-validator class-transformer
    // require
    @IsString()
    @IsOptional()
    id: string;
    @IsNumber()
    @IsOptional()
    rico_id: number;


   
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    lastname: string;

    @IsString()
    @IsOptional()
    bankName: string;

  
    @IsString()
    @IsOptional()
    bankAcc: string;

  
    @IsString()
    @IsOptional()
    phone: string;
    @IsString()
    @IsOptional()
    bankAccRef: string;
    @IsNumber()
    @IsOptional()
    bonusid: number;
    
    @IsString()
     @IsOptional()
    username: string;

    @IsOptional()
    @IsString()
    password: string;


    @IsString()
    @IsOptional()
    hash: string;

    @IsString()
    @IsOptional()
    agent: string;

    @IsString()
    @IsOptional()
    company: string;


    //optional



    @IsString()
    @IsOptional()
    nameEng: string;

    @IsString()
    @IsOptional()
    lastnameEng: string;
 

    @IsOptional()
    @IsString()
    lineID: string;
    
    @IsOptional()
    @IsString()
    recommender: string;
    
    @IsOptional()
    @IsString()
    knowFrom: string;
    
    @IsOptional()
    @IsString()
    remark: string;
    
    @IsOptional()
    @IsString()
    birthdate: Date;
    
    @IsOptional()
    @IsString()
    gender: string;


    @IsOptional()
    @IsBoolean()
    dpAuto: boolean;

    @IsOptional()
    @IsBoolean()
    wdAuto: boolean;

  
   

    @IsOptional()
    @IsString()
    lastest_dpref: string;

    @IsOptional()
    @IsNumber()
    dp_count: number;

    @IsOptional()
    @IsNumber()
    wd_count: number;

    @IsString()
    operator: string;

    @IsOptional()
    @IsBoolean()
    status: boolean;

    @IsOptional()
    @IsString()
    member_uuid: string;

    @IsOptional()
    @IsString()
    member_token: string;

    @IsOptional()
    @IsString()
    aff_id: string;

    @IsOptional()
    @IsString()
    parent_id: string;

    @IsOptional()
    @IsString()
    parent_username: string;

    @IsOptional()
    @IsString()
    group: string;
    @IsOptional()
    @IsBoolean()
    sync:boolean;

    @IsOptional()
    @IsString()
    bonusid_v2 :string
    @IsOptional()
    @IsString()
    ip:string
} 