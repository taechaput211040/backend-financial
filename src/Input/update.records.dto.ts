import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordDto } from './create.records.dto';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {}
