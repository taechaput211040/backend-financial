import { IsOptional, IsString, Length } from "class-validator";

export class LoginDto{


   
    // npm i --save class-validator class-transformer
 
 
    
    @IsString()
    @Length(1,255)
    username:string;
    
    @IsString()
    @Length(1,255)
    password:string;
@IsOptional()
    origin:string;
    
    
   
} 