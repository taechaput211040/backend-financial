import { IsBoolean, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class RegisterNotifyDto {
  // npm i --save class-validator class-transformer
  @IsString()
  website: string;

  @IsString()
  agent: string;

  @IsString()
  hash: string;

  @IsString()
  create_by: string;

  @IsNumber()
  @IsOptional()
  count: number;

  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsString()
  create_from: string;
  @IsString()
  @IsOptional()
  recommder:string
}
