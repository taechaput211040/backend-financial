import { IsString, Length } from "class-validator";

export class CreateChildMemberDto{


   
    // npm i --save class-validator class-transformer
 
 
    
    @IsString()
    @Length(1,255)
    parent_username:string;
    
    @IsString()
    @Length(1,255)
    user_id:string;
    
    @IsString()
    @Length(1,255)
    self_username:string;
    
    @IsString()
    @Length(1,255)
    level:string;

    @IsString()
    @Length(1,255)
    company:string;
    
    @IsString()
    agent_username:string;
    
   
} 