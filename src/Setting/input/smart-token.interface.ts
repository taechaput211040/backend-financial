import { HttpException } from "@nestjs/common";

export interface ReturnSmartToken{
name:string;
token:string;
username:string;
password:string;
code?:number;
message?:string;

}