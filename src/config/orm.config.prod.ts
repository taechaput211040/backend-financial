import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as fs from "fs"
import { DepositNotify } from "src/Entity/deposit.notify.entity";
import { Notify } from "src/Entity/notify.entity";
import { ProviderBO } from "src/Entity/provider.bo.entity";
import { RegisterNotify } from "src/Entity/register.notify.entity";
import { TopupRef } from "src/Entity/topup.ref.entity";
import { User } from "src/Entity/User.entity";
import { Website } from "src/Entity/website.entity";
import { WithdrawNotify } from "src/Entity/withdraw.notify.entity";
import { Members } from "src/Member/member.entiry";
import { Setting } from "src/Setting/setting.entity";



export default registerAs('orm.config',():TypeOrmModuleOptions=>(  {
  type: 'postgres', 
  host: process.env.DB_HOST, 
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities:[Website,User,TopupRef,ProviderBO,Notify,DepositNotify,WithdrawNotify,RegisterNotify,Members], 
  synchronize:false,
  // debug: true    :: for debug mysql
  ssl: {
    rejectUnauthorized:false
    // ca: atob(process.env.CROCK_DB_CERT),
  },
  }));