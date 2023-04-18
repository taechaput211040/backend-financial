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
import { Between, Repository } from 'typeorm';

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
  ) {}

  public async createRecord(input: CreateRecordDto) {
    let resRecord = await this.records_Repository.save(input);
    if (resRecord) {
      await this.saveRecordMonthly(resRecord);
      return resRecord;
    } else {
      throw new BadRequestException();
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
      recordMonthly.TaxAndOther += resRecord.others;
      if (resRecord.loss_dept)
        recordMonthly.loss_dept += resRecord.loss_dept_balance;
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
      newRecordsMonthly.TaxAndOther = resRecord.others;
      if (resRecord.loss_dept)
        newRecordsMonthly.loss_dept = resRecord.loss_dept_balance;
      console.log('addnewRecordsMonthly', newRecordsMonthly);
      await this.monthlyreport_Repository.save(newRecordsMonthly);
    }
  }

  public async updateRecord(id, input: UpdateRecordDto) {
    const records = await this.getExistRecords(id);
    if (!records) {
      throw new NotFoundException();
    } else {
      const resRecord = await this.records_Repository.save({
        ...records,
        ...input,
      });
      return resRecord;
    }
  }
  private getExistRecords(id) {
    return this.records_Repository.findOne({
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
      .where('t.created_at  >= :startDate AND t.updated_at  <= :endDate', {
        startDate: pageOptionsDto.start,
        endDate: pageOptionsDto.end,
      });

    if (pageOptionsDto.options && pageOptionsDto.keyword) {
      res.andWhere(`t.${pageOptionsDto.options} like :keyword`, {
        keyword: `${pageOptionsDto.keyword}%`,
      });
    }

    return await this.paginateOrder(
      res.orderBy('t.created_at', 'DESC').take(pageOptionsDto.take).getMany(),
      pageOptionsDto,
    );
  }

  private async paginateOrder(list, pageOptionsDto) {
    const listData = await list;
    const itemCount = listData.length;
    console.log(itemCount);
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
      input.password = await this.hashPassword(input.password);
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
