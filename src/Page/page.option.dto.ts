import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Order } from './oder.constants';
import * as dayjs from 'dayjs';

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @IsString()
  @IsOptional()
  readonly username?: string;
  @IsString()
  @IsOptional()
  readonly keyword?: string;
  @IsString()
  @IsOptional()
  readonly options?: string;

  @IsString()
  @IsOptional()
  readonly action?: string = 'ALL';
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  readonly take?: number = 10;

  @IsString()
  @IsOptional()
  readonly start?: string = dayjs().startOf('day').toISOString();

  @IsString()
  @IsOptional()
  readonly end?: string = dayjs().endOf('day').toISOString();
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}



