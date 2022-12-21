import { Optional } from "@nestjs/common/decorators";
import { PartialType } from "@nestjs/mapped-types";
import { CreateMemberDto } from "./create.member.dto";
export class UpdateMemberDto extends CreateMemberDto{
    @Optional()
newpass:string
}