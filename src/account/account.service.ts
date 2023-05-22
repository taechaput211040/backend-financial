import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { AuthService } from 'src/auth/auth.service';
import { monthly_report } from 'src/Entity/monthly.report.entity';
import { Records } from 'src/Entity/records.entity';
import { UserAccounting } from 'src/Entity/user.accounting.entity';
import { UserToken } from 'src/Entity/user.token.entity';
import { CreateRecordDto } from 'src/Input/create.records.dto';
import { UpdateRecordDto } from 'src/Input/update.records.dto';
import { UpdateUserDto } from 'src/Input/update.user.accounting.dto';
import { PageMetaDto } from 'src/Page/page-meta.dto';
import * as bcrypt from 'bcrypt';
import { PageDto } from 'src/Page/page.dto';
import { PageOptionsDto } from 'src/Page/page.option.dto';
import { Between, MoreThan, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { transaction_report } from 'src/Entity/transaction.account.entitiy';
import { promises } from 'fs';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Records, 'allaccounting')
    private readonly records_Repository: Repository<Records>,
    @InjectRepository(monthly_report, 'allaccounting')
    private readonly monthlyreport_Repository: Repository<monthly_report>,
    @InjectRepository(UserAccounting, 'allaccounting')
    private readonly UserAccounting_Repository: Repository<UserAccounting>,
    @InjectRepository(UserToken, 'allaccounting')
    private readonly UserToken_repository: Repository<UserToken>,
    @InjectRepository(transaction_report, 'allaccounting')
    private readonly transaction_Repository: Repository<transaction_report>,
    private readonly JwtService: JwtService,
  ) {}

  public async createRecord(input: CreateRecordDto) {
    input.loss_dept_balance = 0;
    if (input.income_expense == false) {
      if (input.amount == input.actual_amount) {
        input.status = true;
      } else {
        input.status = false;
      }
      input.loss_dept_balance = input.amount - input.actual_amount;
    } else {
      input.status = true;
    }

    let resRecord = await this.records_Repository.save(input);
    if (resRecord) {
      await this.saveRecordMonthly(resRecord);
      return resRecord;
    } else {
      throw new BadRequestException();
    }
  }
  public async removeRecords(id: string) {
    const record = await this.getExistRecords(id);
    if (record) {
      if (record.loss_dept) {
        await this.deletTransaction(record);
      }
      await this.deleteRecordMonthly(record);
      const res = await this.records_Repository.delete({ id: id });
      if (res) {
        return { status: 'OK', message: 'DELETE SUCCESS' };
      }
      throw new BadRequestException();
    }
  }
  private async deletTransaction(resRecord) {
    const transaction = await this.transaction_Repository
      .createQueryBuilder('t')
      .delete()
      .where('record_id = :id', { id: resRecord.id })
      .execute();
  }
  public async deleteRecordMonthly(resRecord) {
    let monthOfRecord, yearOfRecord;
    monthOfRecord = dayjs(resRecord.created_at).month();
    yearOfRecord = dayjs(resRecord.created_at).year();
    let recordMonthly = await this.monthlyreport_Repository.findOne({
      where: { month: monthOfRecord, year: yearOfRecord },
    });

    if (recordMonthly) {
      if (resRecord.income_expense == true) {
        recordMonthly.all_income -= resRecord.amount;
      } else {
        recordMonthly.all_expense -= resRecord.amount;
      }
      recordMonthly.monthly_fee -= resRecord.monthly_fee;
      recordMonthly.winlose -= resRecord.winlose + resRecord.credit_purchase;
      recordMonthly.setup_auto -= resRecord.setup_auto;
      recordMonthly.wage -= resRecord.wage;
      recordMonthly.other -= resRecord.feature + resRecord.regis_domain;
      recordMonthly.copyright -= resRecord.copyright;
      recordMonthly.rental -= resRecord.rental + resRecord.facility;
      recordMonthly.cloud -= resRecord.cloud;
      recordMonthly.salary -=
        resRecord.salary +
        resRecord.commission +
        resRecord.outsource +
        resRecord.incentive;
      recordMonthly.TaxAndOther -= resRecord.tax + resRecord.social_tax;
      recordMonthly.loss_dept -= resRecord.loss_dept_balance;
      if (resRecord.income_expense) {
        recordMonthly.other -= resRecord.others;
      } else {
        recordMonthly.TaxAndOther -= resRecord.others;
      }
      console.log('RecordsMonthly', recordMonthly);
      await this.monthlyreport_Repository.save({
        ...recordMonthly,
      });
    }
  }
  public async saveRecordMonthly(resRecord) {
    let monthOfRecord, yearOfRecord;
    monthOfRecord = dayjs(resRecord.created_at).month();
    yearOfRecord = dayjs(resRecord.created_at).year();

    const recordMonthly = await this.monthlyreport_Repository.findOne({
      where: { month: monthOfRecord, year: yearOfRecord },
    });
    console.log(monthOfRecord, yearOfRecord);
    console.log(recordMonthly, 'recordMonthly');
    //getmounth and save
    if (recordMonthly) {
      if (resRecord.income_expense) {
        recordMonthly.all_income += resRecord.amount;
      } else {
        recordMonthly.all_expense += resRecord.amount;
      }
      recordMonthly.monthly_fee += resRecord.monthly_fee;
      recordMonthly.winlose += resRecord.winlose + resRecord.credit_purchase;
      recordMonthly.setup_auto += resRecord.setup_auto;
      recordMonthly.wage += resRecord.wage;
      recordMonthly.other += resRecord.feature + resRecord.regis_domain;
      recordMonthly.copyright += resRecord.copyright;
      recordMonthly.rental += resRecord.rental + resRecord.facility;
      recordMonthly.cloud += resRecord.cloud;
      recordMonthly.salary +=
        resRecord.salary +
        resRecord.commission +
        resRecord.outsource +
        resRecord.incentive;
      recordMonthly.TaxAndOther += resRecord.tax + resRecord.social_tax;
      recordMonthly.loss_dept += resRecord.loss_dept_balance;
      if (resRecord.income_expense) {
        recordMonthly.other += resRecord.others;
      } else {
        recordMonthly.TaxAndOther += resRecord.others;
      }
      console.log('RecordsMonthly', recordMonthly);
      await this.monthlyreport_Repository.save({
        ...recordMonthly,
      });
    } else {
      let newRecordsMonthly = new monthly_report();
      newRecordsMonthly.year = yearOfRecord;
      newRecordsMonthly.month = monthOfRecord;
      if (resRecord.income_expense) {
        newRecordsMonthly.all_income = resRecord.amount;
      } else {
        newRecordsMonthly.all_expense = resRecord.amount;
      }
      newRecordsMonthly.monthly_fee = resRecord.monthly_fee;
      newRecordsMonthly.winlose = resRecord.winlose + resRecord.credit_purchase;
      newRecordsMonthly.setup_auto = resRecord.setup_auto;
      newRecordsMonthly.wage = resRecord.wage;
      newRecordsMonthly.other = resRecord.feature + resRecord.regis_domain;
      newRecordsMonthly.copyright = resRecord.copyright;
      newRecordsMonthly.rental = resRecord.rental + resRecord.facility;
      newRecordsMonthly.cloud = resRecord.cloud;
      newRecordsMonthly.salary =
        resRecord.salary +
        resRecord.commission +
        resRecord.outsource +
        resRecord.incentive;
      newRecordsMonthly.TaxAndOther = resRecord.tax + resRecord.social_tax;
      newRecordsMonthly.loss_dept = resRecord.loss_dept_balance;

      if (resRecord.income_expense) {
        newRecordsMonthly.other += resRecord.others;
      } else {
        newRecordsMonthly.TaxAndOther += resRecord.others;
      }
      console.log(resRecord.loss_dept_balance, 'resRecord.loss_dept_balance');
      await this.monthlyreport_Repository.save(newRecordsMonthly);
    }
  }

  public async updateRecord(id, input: UpdateRecordDto) {
    const records = await this.getExistRecords(id);
    if (!records) {
      throw new NotFoundException();
    } else {
      if (input.income_expense == false && input.loss_dept == false) {
        input.loss_dept_balance = input.amount - input.actual_amount;
      }

      if (input.loss_dept == true) {
        input.actual_amount = records.actual_amount + input.loss_dept_balance;
        input.loss_dept_balance =
          records.loss_dept_balance - input.loss_dept_balance;
      }

      if (input.amount == input.actual_amount) {
        input.status = true;
      }
      const resRecord = await this.records_Repository.save({
        ...records,
        ...input,
      });
      await this.saveTransaction_lossdept(resRecord, records);
      await this.updateRecordMonthly(resRecord, records);
      return resRecord;
    }
  }
  public async GetDeptLossTransactionList(id: string) {
    const list = await this.transaction_Repository.find({
      where: {
        record_id: id,
        dept_payout: MoreThan(0),
      },
    });
    return list;
  }
  private async saveTransaction_lossdept(resUpdateRecord, OldRecords) {
    if (
      resUpdateRecord.loss_dept &&
      OldRecords.loss_dept_balance - resUpdateRecord.loss_dept_balance > 0
    ) {
      let transaction = new transaction_report();
      transaction.record_id = resUpdateRecord.id;
      transaction.record_name = resUpdateRecord.record;
      transaction.operator = resUpdateRecord.operator;
      transaction.dept_payout =
        OldRecords.loss_dept_balance - resUpdateRecord.loss_dept_balance;
      transaction.dept_balance = resUpdateRecord.loss_dept_balance;
      transaction.status =
        resUpdateRecord.amount == resUpdateRecord.actual_amount ? true : false;
      transaction.remark = `ชำระยอดหนี้เสียเเล้วจำนวน ${
        OldRecords.loss_dept_balance - resUpdateRecord.loss_dept_balance
      } บาท เหลือยอดที่ต้องชำระอีก ${resUpdateRecord.loss_dept_balance} บาท`;
      const result = await this.transaction_Repository.save(transaction);
    }
  }
  public async updateRecordMonthly(resRecord, records) {
    let monthOfRecord, yearOfRecord;
    monthOfRecord = dayjs(resRecord.created_at).month();
    yearOfRecord = dayjs(resRecord.created_at).year();

    let recordMonthly = await this.monthlyreport_Repository.findOne({
      where: { month: monthOfRecord, year: yearOfRecord },
    });
    //normaly update
    if (resRecord.income_expense) {
      recordMonthly.all_income =
        recordMonthly.all_income - records.amount + resRecord.amount;
    } else {
      recordMonthly.all_expense =
        recordMonthly.all_expense - records.amount + resRecord.amount;
    }
    recordMonthly.monthly_fee =
      recordMonthly.monthly_fee - records.monthly_fee + resRecord.monthly_fee;
    recordMonthly.winlose =
      recordMonthly.winlose -
      (records.winlose + records.credit_purchase) +
      (resRecord.winlose + resRecord.credit_purchase);
    recordMonthly.setup_auto =
      recordMonthly.setup_auto - records.setup_auto + resRecord.setup_auto;
    recordMonthly.wage = recordMonthly.wage - records.wage + resRecord.wage;
    recordMonthly.other =
      recordMonthly.other -
      (records.feature + records.regis_domain) +
      (resRecord.feature + resRecord.regis_domain);

    recordMonthly.copyright =
      recordMonthly.copyright - records.copyright + resRecord.copyright;
    recordMonthly.rental =
      recordMonthly.rental -
      (records.rental + records.facility) +
      (resRecord.rental + resRecord.facility);
    recordMonthly.cloud = recordMonthly.cloud - records.cloud + resRecord.cloud;
    recordMonthly.salary =
      recordMonthly.salary -
      (records.salary +
        records.commission +
        records.outsource +
        records.incentive) +
      (resRecord.salary +
        resRecord.commission +
        resRecord.outsource +
        resRecord.incentive);
    recordMonthly.TaxAndOther =
      recordMonthly.TaxAndOther -
      (records.tax + records.social_tax) +
      (resRecord.tax + resRecord.social_tax);
    recordMonthly.loss_dept =
      recordMonthly.loss_dept -
      records.loss_dept_balance +
      resRecord.loss_dept_balance;

    if (resRecord.income_expense) {
      recordMonthly.other =
        recordMonthly.other - records.others + resRecord.others;
    } else {
      recordMonthly.TaxAndOther =
        recordMonthly.TaxAndOther - records.others + resRecord.others;
    }
    //pay loss_dept_balance
    // if (resRecord.income_expense == false && resRecord.loss_dept == true) {
    //   recordMonthly.loss_dept =
    //     recordMonthly.loss_dept -
    //     records.loss_dept_balance +
    //     resRecord.loss_dept_balance;
    // }
    console.log(recordMonthly.all_income, 'recordMonthly');
    await this.monthlyreport_Repository.save({
      ...recordMonthly,
    });
  }
  private async getExistRecords(id) {
    return await this.records_Repository.findOne({
      where: {
        id: id,
      },
    });
  }

  public async getRecordPermonth(month: number, year: number) {
    const listRecord = await this.monthlyreport_Repository.findOne({
      where: { month: month, year: year },
    });
    if (!listRecord) throw new NotFoundException();
    return listRecord;
  }

  public async getAllListRecords(pageOptionsDto: PageOptionsDto) {
    let res;
    res = await this.records_Repository
      .createQueryBuilder('t')
      .take(pageOptionsDto.take)
      .skip(((pageOptionsDto.page ?? 1) - 1) * (pageOptionsDto.take ?? 10))
      .where('t.created_at  >= :startDate AND t.created_at  <= :endDate', {
        startDate: pageOptionsDto.start,
        endDate: pageOptionsDto.end,
      });
    if (pageOptionsDto.options == 'due_date') {
      res.andWhere(' t.due_date  >= :due_date', {
        due_date: dayjs().startOf('day'),
      });
    } else if (pageOptionsDto.options && pageOptionsDto.keyword) {
      if (pageOptionsDto.options == 'status' && pageOptionsDto.keyword) {
        res.andWhere('t.status=:status', {
          status: pageOptionsDto.keyword,
        });
      } else if (
        pageOptionsDto.options == 'company' ||
        pageOptionsDto.options == 'operator'
      ) {
        res.andWhere(`t.${pageOptionsDto.options} like :keyword`, {
          keyword: `%${pageOptionsDto.keyword}%`,
        });
      }
    }

    let count = await res.getCount();
    console.log(count, 'res.');
    return await this.paginateOrder(
      res.orderBy('t.created_at', 'DESC').take(pageOptionsDto.take).getMany(),
      pageOptionsDto,
      count,
    );
  }

  private async paginateOrder(list, pageOptionsDto, itemCount) {
    const listData = await list;

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return await new PageDto(listData, pageMetaDto);
  }

  public async getCompanyList() {
    let Companylist;
    const res = await this.records_Repository.find();
    Companylist = res.map((item) => {
      return item.company;
    });
    Companylist = [...new Set(Companylist)];
    Companylist = Companylist.map((item) => {
      return { company: item };
    });
    return Companylist;
  }

  public async getListByDept(pageOptionsDto: PageOptionsDto) {
    const [deptlist, total] = await this.records_Repository.findAndCount({
      where: {
        loss_dept: true,
        created_at: Between(pageOptionsDto.start, pageOptionsDto.end),
      },
      order: { created_at: 'DESC' },
      skip: (pageOptionsDto.page - 1) * pageOptionsDto.take,
      take: pageOptionsDto.take,
    });
    const itemCount = total;
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto(deptlist, pageMetaDto);
  }

  public async getUserExit(username: string) {
    return await this.UserAccounting_Repository.findOne({
      where: {
        username: username,
      },
    });
  }
  public async saveTokenUser(user) {
    return this.UserToken_repository.save(user);
  }

  public async getAlluserAccounting() {
    let userList;
    const res = await this.UserAccounting_Repository.find();
    userList = res.map((user) => {
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        status: user.status,
      };
    });
    return userList;
  }

  public async getUserProfile(request) {
    let token = request.headers.authorization;
    token = token.replace('Bearer ', '');
    const { username } = await this.JwtService.verifyAsync(token);
    // console.log(profile,'profile')
    const user = await this.UserAccounting_Repository.findOne({ username });
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    };
  }
  private getExistUser(id) {
    return this.UserAccounting_Repository.findOne({
      where: {
        id: id,
      },
    });
  }
  public async UpdateUserAccouting(id: string, input: UpdateUserDto) {
    const user = await this.getExistUser(id);
    if (!user) {
      throw new NotFoundException();
    } else {
      if (input.password) {
        input.password = await this.hashPassword(input.password);
      }
      const resuser = await this.UserAccounting_Repository.save({
        ...user,
        ...input,
      });
      return resuser;
    }
  }
  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
