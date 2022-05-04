
import { IsBoolean, IsNumber, IsOptional, isString, IsString } from "class-validator";

export class CreateAffMemberSettingDto{


   
    // npm i --save class-validator class-transformer
 
    

    @IsString()
    username:string;
    
   

    @IsString()
    aff_id: string;


    @IsString()
    setting_id: string;

    @IsString()
    @IsOptional()
    operator:string;
} 