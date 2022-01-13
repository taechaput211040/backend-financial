import { IsNumber, IsString, Length } from "class-validator";

export class TopupRefDto{


   
    // npm i --save class-validator class-transformer
 
 
    
    @IsString()
    @Length(1,255)
    username:string;
    
    @IsString()
    @Length(1,255)
    method:string;
    @IsString()
    @Length(1,255)
    provider:string;
    @IsNumber()
  
    amount:number;
    @IsString()
    operator:string;
    

   
} 