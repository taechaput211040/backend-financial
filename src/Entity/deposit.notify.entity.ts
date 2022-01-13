import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
export class DepositNotify {
    constructor(
        partial?: Partial<DepositNotify|DepositNotify[]>
    ) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn("uuid")
    @Expose() // npm i --save class-validator class-transformer
    id: string;
  
    // @CreateDateColumn({ type: "datetime", default: () => moment().format()})
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

 

    
    @Column({nullable:true,length:255})
    @Expose()
    agent:string;
    @Column({nullable:true,length:255})
    @Expose()
    hash:string;
    @Column({nullable:true,length:255})
    @Expose()
    website:string;

    @Column({nullable:true})
    @Expose()
    amount:number;

    @Column({nullable:true})
    @Expose()
    bonus:number;

    @Column({nullable:true,default:0})
    @Expose()
    bf_credit:number;

    @Column({nullable:true,default:0})
    @Expose()
    af_credit:number;

    @Column({nullable:true})
    @Expose()
    username:string;

    @Column({nullable:true})
    @Expose()
    remark:string;

    @Column({nullable:true})
    @Expose()
    create_by:string;
    // @ManyToOne(() => Section, (section) => section.id, {
    //     nullable: true,
    //     onDelete:'CASCADE'
    // })
    // @JoinColumn(
    //         {
    //         name:'section_id',
    //     }
    // )
    // section: Section;
    // @Column({ nullable: true })
    // @Expose()
    // section_id:string;
 


}
