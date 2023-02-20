import { IsBoolean,  IsString } from "class-validator";

export class LockUserDto {



    // npm i --save class-validator class-transformer
    // require

    @IsString()
    id: string;


   
    @IsBoolean()
    status: boolean;

    @IsString()
    operator: string;
} 