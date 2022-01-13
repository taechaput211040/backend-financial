import { IsBoolean, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateNotifyDto {



    // npm i --save class-validator class-transformer
    @IsString()
    website: string;

    @IsString()
    agent: string;

    @IsString()
    hash: string;

    @IsString()
    create_by: string;



    
    @IsOptional()
    @IsString()
    deposit_token: string;

    @IsOptional()
    @IsString()
    register_token: string;

    @IsOptional()
    @IsString()
    withdraw_token: string;

    @IsOptional()
    @IsString()
    update_by: string;
} 