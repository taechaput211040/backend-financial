import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { monthly_report } from 'src/Entity/monthly.report.entity';
import { Records } from 'src/Entity/records.entity';
import { UserAccounting } from 'src/Entity/user.accounting.entity';
import { UserToken } from 'src/Entity/user.token.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { SwaggerModule } from '@nestjs/swagger';
import { JwtModule } from '@nestjs/jwt';
@Module({
  controllers: [AccountController],
  providers: [AccountService],

  imports: [
    TypeOrmModule.forFeature(
      [Records, monthly_report, UserAccounting, UserToken],
      'allaccounting',
    ),
    SwaggerModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: {
          expiresIn: '1h',
        },
      }),
    }),
  ],
})
export class AccountModule {}
