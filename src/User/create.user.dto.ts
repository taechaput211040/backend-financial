import { IsString, Length } from "class-validator";

export class UserDto{


   
    // npm i --save class-validator class-transformer
 
 
    
    @IsString()
    @Length(1,255)
    username:string;
    
    @IsString()
    @Length(1,255)
    password:string;

    @IsString()
    @Length(1,255)
    role:string;
    

   
} 