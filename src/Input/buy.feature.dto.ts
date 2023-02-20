import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BuyFeatureDto {
  constructor(partial?: Partial<BuyFeatureDto | BuyFeatureDto[]>) {
    Object.assign(this, partial);
  }
 @IsNumber()
  amount:number;
  @IsString()
    username:string
}
