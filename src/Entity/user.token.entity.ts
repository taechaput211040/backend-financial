import { Expose } from 'class-transformer';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserToken {
  constructor(partial?: Partial<UserToken | UserToken[]>) {
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

  @Column({ nullable: true, length: 1024 })
  @Expose()
  username: string;

  @Column({ nullable: true })
  @Expose()
  token: string;

  @Column({ nullable: true })
  @Expose()
  expire_at: string;
}
