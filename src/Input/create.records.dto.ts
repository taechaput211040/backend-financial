import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecordDto {
  @IsOptional()
  id: string;

  @IsString()
  @IsOptional()
  created_at: Date;

  @IsString()
  @IsOptional()
  updated_at: Date;

  @IsBoolean()
  @IsOptional()
  income_expense: boolean;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  record: string;

  @IsString()
  @IsOptional()
  record_detail: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsNumber()
  @IsOptional()
  actual_amount: number;

  @IsString()
  @IsOptional()
  date_time: Date;

  @IsString()
  @IsOptional()
  due_date: Date;

  @IsBoolean()
  @IsOptional()
  status: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  company: string;

  @IsNumber()
  @IsOptional()
  monthly_fee: number;

  @IsNumber()
  @IsOptional()
  feature: number;

  @IsNumber()
  @IsOptional()
  winlose: number;

  @IsNumber()
  @IsOptional()
  regis_domain: number;

  @IsNumber()
  @IsOptional()
  credit_purchase: number;

  @IsNumber()
  @IsOptional()
  setup_auto: number;

  @IsNumber()
  @IsOptional()
  wage: number;

  @IsNumber()
  @IsOptional()
  copyright: number;

  @IsNumber()
  @IsOptional()
  rental: number;

  @IsNumber()
  @IsOptional()
  facility: number;

  @IsNumber()
  @IsOptional()
  cloud: number;

  @IsNumber()
  @IsOptional()
  salary: number;

  @IsNumber()
  @IsOptional()
  commission: number;

  @IsNumber()
  @IsOptional()
  outsource: number;

  @IsNumber()
  @IsOptional()
  incentive: number;

  @IsNumber()
  @IsOptional()
  tax: number;

  @IsNumber()
  @IsOptional()
  social_tax: number;

  @IsNumber()
  @IsOptional()
  others: number;

  @IsString()
  @IsOptional()
  operator: string;

  @IsBoolean()
  @IsOptional()
  loss_dept: boolean;

  @IsNumber()
  @IsOptional()
  loss_dept_balance: number;

  @IsString()
  @IsOptional()
  bill_image: string;
}
