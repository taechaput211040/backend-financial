import { IsNumber, IsString, Length } from "class-validator";

export class PinValidateDto{


   
    // npm i --save class-validator class-transformer
 
 
    
    @IsString()
    @Length(1,255)
    ref:string;
    
    @IsString()
    @Length(1,255)
    pin:string;



   
} 