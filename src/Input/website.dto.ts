import { IsBoolean, IsNumber, IsString, Length } from "class-validator";

export class WebsiteDto{


   
    // npm i --save class-validator class-transformer
 
 
    @IsString()
    website:string;

    @IsString()
    opcode:string;

    @IsString()
    static_hash:string;

    @IsString()
    provider_hash:string;

    @IsString()
    microservice_hash:string;

    @IsString()
    company:string;
    @IsString()
    agent_prefix:string;

    @IsBoolean()
    status:boolean;

    @IsBoolean()
    wheel:boolean;

    @IsBoolean()
    creditfree:boolean;
    
    @IsBoolean()
    card:boolean;

    @IsBoolean()
    chest:boolean;

    @IsBoolean()
    checkin:boolean;

    @IsBoolean()
    premium:boolean;

    @IsBoolean()
    point:boolean;

    @IsBoolean()
    affiliate:boolean;

    @IsBoolean()
    truewallet:boolean;
    

   

   
} 