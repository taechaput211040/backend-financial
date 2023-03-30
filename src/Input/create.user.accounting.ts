import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  password: string;

  @IsBoolean()
  @IsOptional()
  role: string;

  @IsBoolean()
  @IsOptional()
  status: boolean;
}
