import { IsString, Length,  } from "class-validator";

export class ChangePasswordFrontendDto {



    // npm i --save class-validator class-transformer
    // require

    @IsString()
    newpass: string;


   
    @IsString()
    @Length(8,16)
    username: string;

   
} 