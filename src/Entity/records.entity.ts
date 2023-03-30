import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Records {
  constructor(partial?: Partial<Records | Records[]>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Index()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  @Index()
  @Column({ nullable: true })
  @Expose()
  income_expense: boolean;

  @Column({ nullable: true })
  @Expose()
  record: string;

  @Column({ nullable: true })
  @Expose()
  record_detail: string;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  amount: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  actual_amount: number;

  @Column({ nullable: true })
  @Expose()
  date_time: Date;

  @Index()
  @Column({ nullable: true })
  @Expose()
  due_date: Date;

  @Index()
  @Column({ nullable: true, default: true })
  @Expose()
  status: boolean;

  @Index()
  @Column({ nullable: true })
  @Expose()
  company: string;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  monthly_fee: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  feature: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  winlose: number;
  
  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  regis_domain: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  credit_purchase: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  setup_auto: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  wage: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  copyright: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  rental: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  facility: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  cloud: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  salary: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  commission: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  outsource: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  incentive: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  tax: number;

  @Column({ nullable: true, type: 'float' , default: 0 })
  @Expose()
  social_tax: number;

  @Column({ nullable: true, type: 'float', default: 0  })
  @Expose()
  others: number;

  @Column({ nullable: true })
  @Expose()
  opertaor: string;

  @Column({ nullable: true, default: false  })
  @Expose()
  loss_dept: boolean;

  @Column({ nullable: true, type: 'float' , default: 0  })
  @Expose()
  loss_dept_balance: number;

  @Column({ nullable: true })
  @Expose()
  bill_image: string;
}
