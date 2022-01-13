import { IsBoolean, IsNumber, IsString, Length } from "class-validator";

export class ProviderBODto{


   
    // npm i --save class-validator class-transformer
 @IsString()
    provider_BO_link:string;
    @IsString()
    provider_name:string;

    @IsString()
    provider_code:string;
    @IsString()
    opcode:string;
    @IsString()
    bo_username:string;
    @IsString()
    bo_password:string;

    @IsString()
    remark:string;

    @IsBoolean()
    vpn:boolean;


   

   
} 