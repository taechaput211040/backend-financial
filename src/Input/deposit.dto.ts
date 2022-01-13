
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class DepositDto{


   
    // npm i --save class-validator class-transformer
 
    

    @IsString()
    username:string;
    
   

    @IsNumber()
    amount: number;


    @IsString()
    operator: string;
}