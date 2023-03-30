import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-local';
// import { User } from "src/User/user.entity";
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Members } from 'src/Member/member.entiry';
import { UserAccounting } from 'src/Entity/user.accounting.entity';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly loger = new Logger(LocalStrategy.name);

  constructor(
    @InjectRepository(UserAccounting, 'allaccounting')
    private readonly userRepository: Repository<UserAccounting>,
  ) {
    super();
  }
  public async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    console.log(user);
    this.loger.debug(`User ${username} not found`);
    if (!user) {
      this.loger.debug(`User ${username} not found`);
      throw new UnauthorizedException();
    }

    // if( password !== user.password)
    // {
    //     this.loger.debug(`password not match`)
    //     throw new UnauthorizedException()
    // }
    if (!(await bcrypt.compare(password, user.password))) {
      this.loger.debug(`password not match`);
      throw new UnauthorizedException();
    }
    return user;
  }
}
