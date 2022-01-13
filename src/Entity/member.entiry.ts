import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
export class Members {
    constructor(
        partial?: Partial<Members|Members[]>
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

    @Column({nullable:true,default:false})
    @Expose()
    name:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    lastname:boolean;


    @Column({nullable:true,length:255})
    @Expose()
    nameEng:string;
    @Column({nullable:true})
    @Expose()
    lastnameEng:string;
    @Column({nullable:true,length:255})
    @Expose()
    bankName:string;

    @Column({nullable:true})
    @Expose()
    bankAcc:string;

    @Column({nullable:true})
    @Expose()
    bankAccRef:string;


    @Column({nullable:true})
    @Expose()
    phone:string;

    @Column({nullable:true})
    @Expose()
    lineID:string;

    @Column({nullable:true})
    @Expose()
    recommender:string;

    @Column({nullable:true})
    @Expose()
    knowFrom:string;

    @Column({nullable:true})
    @Expose()
    remark:string;

    @Column({nullable:true})
    @Expose()
    birthdate:Date;

    @Column({nullable:true,default:'male'})
    @Expose()
    gender:string;

    @Column({nullable:true,default:0})
    @Expose()
    bonusid:number;

    @Column({nullable:true,default:true})
    @Expose()
    dpAuto:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    wdAuto:boolean;

    @Column({nullable:true})
    @Expose()
    username:string;

    @Column({nullable:true})
    @Expose()
    password:string;

    @Column({nullable:true})
    @Expose()
    lastest_dpref:string;

    @Column({nullable:true})
    @Expose()
    lastest_wdref:string;

    @Column({nullable:true,default:0})
    @Expose()
    dp_count:number;

    @Column({nullable:true,default:0})
    @Expose()
    wd_count:number;

    @Column({nullable:true})
    @Expose()
    operator:string;

    @Column({nullable:true,default:true})
    @Expose()
    status:boolean;

    @Column({nullable:true})
    @Expose()
    member_uuid:string;

    @Column({nullable:true})
    @Expose()
    member_token:string;

    @Column({nullable:true})
    @Expose()
    parent_id:string;

    @Column({nullable:true})
    @Expose()
    level:number;

    @Column({nullable:true})
    @Expose()
    group:string;

    @Column({nullable:true})
    @Expose()
    @Index()
    hash:string;

    @Column({nullable:true})
    @Expose()
    agent:string;

    @Column({nullable:true})
    @Expose()
    company:string;
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
