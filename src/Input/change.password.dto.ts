import { IsString, Length,  } from "class-validator";

export class ChangePasswordDto {



    // npm i --save class-validator class-transformer
    // require

    @IsString()
    id: string;


   
    @IsString()
    @Length(8,16)
    password: string;

   
} 