import { HttpException } from "@nestjs/common";

export interface ValidateMemberData{
status:boolean;
data:HttpException;

}