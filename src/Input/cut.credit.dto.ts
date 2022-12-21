import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CutCreditDto {
  @ApiProperty({ required: true })
  @IsString()
  _id: string;

  @ApiProperty({ required: true })
  @IsNumber()
  username: number;

  @ApiProperty({ required: true })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: true })
  @IsNumber()
  beforeAmount: number;

  @ApiProperty({ required: true })
  @IsNumber()
  afterAmount: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  withdraw_amount:number;
  @ApiProperty({ required: true })
  @IsString()
  @IsOptional()
  remark:string
  @IsString()
  @IsOptional()
  type:string
}
