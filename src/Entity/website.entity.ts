import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity()
export class Website {
    constructor(
        partial?: Partial<Website|Website[]>
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

    @Column({nullable:true,length:1024})
    @Expose()
    website:string;

    @Column({nullable:true})
    @Expose()
    opcode:string;

    @Column({nullable:true})
    @Expose()
    static_hash:string;

    @Column({nullable:true,length:1024})
    @Expose()
    provider_hash:string;

    @Column({nullable:true,length:1024})
    @Expose()
    microservice_hash:string;

    @Column({nullable:true,length:1024})
    @Expose()
    company:string;

    @Column({nullable:true,length:1024})
    @Expose()
    agent_prefix:string;

    @Column({nullable:true})
    @Expose()
    status:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    wheel:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    creditfree:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    card:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    chest:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    checkin:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    premium:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    point:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    affiliate:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    truewallet:boolean;
    

   


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
