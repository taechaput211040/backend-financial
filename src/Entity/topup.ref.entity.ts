import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
export class TopupRef {
    constructor(
        partial?: Partial<TopupRef|TopupRef[]>
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

    @Column({length:1024})
    @Expose()
    username:string;
    @Column({nullable:true}) 
    @Expose()
    amount:number;
    @Column({nullable:true,length:1024})
    @Expose()
    method:string;


    @Column({nullable:true,length:1024})
    @Expose()
    provider:string;
    @Column({nullable:true})
    @Expose()
    ref:string;

    @Column({nullable:true})

    pin:string;


    @Column({nullable:true})
  
    @Expose()
    status:string;
    @Column({nullable:true})
  
    @Expose()
    topup_time:Date;

    @Column({nullable:true})
  
    @Expose()
    operator:string;

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
