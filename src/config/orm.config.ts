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


function atob(b64txt) {
  const buff = Buffer.from(b64txt, 'base64');
  const txt = buff.toString('utf8');
  return txt;
}

export default registerAs('orm.config',():TypeOrmModuleOptions=>(  {
  type: 'cockroachdb',  
    host: process.env.DB_HOST, 
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities:[Members], 
    synchronize:false,
    // debug: true    :: for debug mysql
    ssl: {
      rejectUnauthorized:false
      // ca: atob(process.env.CROCK_DB_CERT),
    },
    
  }));