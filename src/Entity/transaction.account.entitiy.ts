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
export class transaction_report {
  constructor(partial?: Partial<transaction_report | transaction_report[]>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Index()
  @Column()
  @Expose()
  record_id: string;

  @Column({ nullable: true, length: 1024 })
  @Expose()
  record_name: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @Column({ nullable: true, length: 1024 })
  @Expose()
  operator: string;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  dept_payout: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  dept_balance: number;

  @Column({ nullable: true, default: false })
  @Expose()
  status: boolean;

  @Column({ nullable: true, default: '' })
  @Expose()
  remark: string;
}
