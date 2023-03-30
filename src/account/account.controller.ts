import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuardJwt } from 'src/auth/autn-guard.jwt';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { CreateRecordDto } from 'src/Input/create.records.dto';
import { UpdateRecordDto } from 'src/Input/update.records.dto';
import { UpdateUserDto } from 'src/Input/update.user.accounting.dto';
import { PageOptionsDto } from 'src/Page/page.option.dto';
import { AccountService } from './account.service';
@ApiBearerAuth()
@Controller('accounting/api')
export class AccountController {
  constructor(private readonly recordService: AccountService) {}
  @UseGuards(JwtStrategy)
  @Post('/Record')
  async postRecords(@Body() input: CreateRecordDto) {
    return this.recordService.createRecord(input);
  }
  @UseGuards(AuthGuardJwt)
  @Put('/Record/:id')
  async updateRecodes(@Param('id') id: string, @Body() input: UpdateRecordDto) {
    return this.recordService.updateRecord(id, input);
  }

  @UseGuards(AuthGuardJwt)
  @Get('/Record/Monthly/:month/:year')
  async getRecordReportPermonth(
    @Param('month') month: number,
    @Param('year') year: number,
  ) {
    const result = await this.recordService.getRecordPermonth(month, year);
    return {
      id: result.id,
      month: result.month,
      year: result.year,
      all_income: result.all_income,
      all_expense: result.all_expense,
      monthly_fee: result.monthly_fee,
      winlose: result.winlose,
      setup_auto: result.setup_auto,
      wage: result.wage,
      other: result.other,
      copyright: result.copyright,
      rental: result.rental,
      cloud: result.cloud,
      salary: result.salary,
      TaxAndOther: result.TaxAndOther,
      loss_dept: result.loss_dept,
    };
  }
  @UseGuards(AuthGuardJwt)
  @Get('/Record')
  async getAllRecords(@Query() pageOptionsDto: PageOptionsDto) {
    let resRecord = await this.recordService.getAllListRecords(pageOptionsDto);
    return resRecord;
  }
  @UseGuards(AuthGuardJwt)
  @Get('/Record/Company')
  async getAllRecordsByCompany() {
    return this.recordService.getCompanyList();
  }
  @UseGuards(AuthGuardJwt)
  @Get('/Record/Dept')
  async getAllRecordsByDept(@Query() pageOptionsDto: PageOptionsDto) {
    return this.recordService.getListByDept(pageOptionsDto);
  }

  @UseGuards(AuthGuardJwt)
  @Get('/user')
  async getAlluser() {
    let userList = await this.recordService.getAlluserAccounting();
    return userList;
  }

  @UseGuards(AuthGuardJwt)
  @Put('/user/:id')
  async updateUser(@Param('id') id: string, @Body() input: UpdateUserDto) {
    let userList = await this.recordService.UpdateUserAccouting(id, input);
    return userList;
  }
}
