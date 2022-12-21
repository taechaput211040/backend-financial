import { Expose } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";




@Entity()
export class LockDown {
    constructor(
        partial?: Partial<LockDown|LockDown[]>
    ) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn()
    @Expose() // npm i --save class-validator class-transformer
    id: number;
  
    // @CreateDateColumn({ type: "datetime", default: () => moment().format()})
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    @Index()
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

 

    
    @Column({nullable:true})
    @Expose()
    lockdown_status:boolean;

    @Column({nullable:true})
    @Expose()
    operator:string;

    @Column({nullable:true})
    @Expose()
    key:string;


  
 


}
