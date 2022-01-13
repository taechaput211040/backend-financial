import { IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class WithdrawNotifyDto {



    // npm i --save class-validator class-transformer
    @IsString()
    website: string;

    @IsString()
    agent: string;

    @IsString()
    hash: string;

    @IsOptional()
    create_by: string;



    
    
    @IsNumber()
    amount: number;

    
   

   
    @IsOptional()
    bf_credit: number;

   
    @IsOptional()
    af_credit: number;

    @IsString()
    username: string;
    
    @IsOptional()
    @IsString()
    remark: string;
} 