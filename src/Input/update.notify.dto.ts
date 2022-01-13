import { PartialType } from "@nestjs/mapped-types";
import { CreateNotifyDto } from "./create.notify.setting.dto";
export class UpdateNotifyDto extends PartialType(CreateNotifyDto){
  
}