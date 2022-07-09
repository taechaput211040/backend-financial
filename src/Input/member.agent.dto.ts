import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";


export class MemberAgentDto {


   
    @IsString()
    name: string;

    @IsString()
    lastname: string;

    @IsString()
    @IsOptional()
    bankName: string;

  
    @IsString()
    @IsOptional()
    bankAcc: string;

  
    @IsString()
    phone: string;
    @IsString()
    @IsOptional()
    bankAccRef: string;
    @IsNumber()
    @IsOptional()
    bonusid: number;
    
    @IsString()
    username: string;



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
}