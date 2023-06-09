import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsArray } from "class-validator";
import { PageMetaDto } from "./page-meta.dto";

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  @Expose()
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  
  @Expose()
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}