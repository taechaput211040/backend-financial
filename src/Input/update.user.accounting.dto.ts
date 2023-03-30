import { PartialType } from '@nestjs/mapped-types';

import { RegisterUserDto } from './create.user.accounting';

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
