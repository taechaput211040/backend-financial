import { IsBoolean, IsJSON, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateMemberTurnDto {



    // npm i --save class-validator class-transformer
    // require

 


   
    @IsString()
    @IsOptional()
    created_at: Date;

    @IsString()
    @IsOptional()
    updated_at: Date;

    @IsString()
    @IsOptional()
     username: string;

  
    @IsJSON()
    @IsOptional()
    turn: string;

  
    @IsNumber()
    @IsOptional()
    limitwithdraw: number;


    @IsNumber()
    @IsOptional()
    sys_limit_amount: number;
    
    @IsNumber()
    @IsOptional()
    min_turn: number;

  
   @IsNumber()
    @IsOptional()
    SL:number;

   @IsNumber()
    @IsOptional()
    LC:number;
   
   @IsNumber()
    @IsOptional()
    SB:number;

   @IsNumber()
    @IsOptional()
    ES:number;

   @IsNumber()
    @IsOptional()
    OT:number;

   @IsNumber()
    @IsOptional()
    LT:number;

   @IsNumber()
    @IsOptional()
    FH:number;

    @IsBoolean()
    @IsOptional()
    editturn:boolean;

    @IsBoolean()
    @IsOptional()
    wdable:boolean;

} 