import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
@Unique(["username"]) 
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


    @Column({nullable:true})
    @Expose()
    rico_id:number;


    @Column({nullable:true})
    @Expose()
    name:string;

    @Column({nullable:true})
    @Expose()
    lastname:string;


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
    @Index()
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
    @Index()
    username:string;

    @Column({nullable:true})
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
    @Index()
    aff_id:string;

    @Column({nullable:true})
    @Expose()
    @Index()
    parent_id:string;

    @Column({nullable:true})
    @Expose()
    parent_username:string;

    @Column({nullable:true,default:'common'})
    @Expose()
    group:string;

    @Column({nullable:true})
    @Expose()
    @Index()
    hash:string;

    @Column({nullable:true})
    @Expose()
    @Index()
    agent:string;

    @Column({nullable:true})
    @Expose()
    @Index()
    company:string;


    @Column({nullable:true})
    @Expose()
    ip:string;

    @Column({nullable:true,default:false})
    @Expose()
    sync:boolean;

    
    @Column({nullable:true})
    @Expose()
    bonusid_v2 :string
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
