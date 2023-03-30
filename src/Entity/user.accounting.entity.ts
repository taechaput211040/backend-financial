import { Expose } from 'class-transformer';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserAccounting {
  constructor(partial?: Partial<UserAccounting | UserAccounting[]>) {
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  id: string;

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

  @Column({ nullable: true, length: 1024 })
  @Expose()
  username: string;

  @Column({ nullable: true })
  @Expose()
  password: string;

  @Column({ nullable: true })
  @Expose()
  role: string;

  @Column({ default: true })
  @Expose()
  status: boolean;
}
