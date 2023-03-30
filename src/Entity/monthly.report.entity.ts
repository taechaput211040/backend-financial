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
export class monthly_report {
  constructor(partial?: Partial<monthly_report | monthly_report[]>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

  @Index()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;

  @Column({ nullable: true })
  @Expose()
  month: number;

  @Column({ nullable: true })
  @Expose()
  year: number;

  @Column({ nullable: true, default: 0 })
  @Expose()
  all_income: number;

  @Column({ nullable: true, default: 0 })
  @Expose()
  all_expense: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  monthly_fee: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  winlose: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  setup_auto: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  wage: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  other: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  copyright: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  rental: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  cloud: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  salary: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  TaxAndOther: number;

  @Column({ nullable: true, type: 'float', default: 0 })
  @Expose()
  loss_dept: number;
}
