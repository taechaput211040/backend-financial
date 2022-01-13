
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class SetTurnDto{


   
    // npm i --save class-validator class-transformer
 
    @IsString()
    opcode:string;

    @IsString()
    username:string;
    
   

    @IsString()
    provider: string;


    @IsString()
    type: string;

    @IsNumber()
    bet: number;

    @IsNumber()
    @IsOptional()
    payout: number;

    @IsNumber()
    @IsOptional()
    winlose: number;
}