import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
@Unique(['hash'])
export class Notify {
    constructor(
        partial?: Partial<Notify|Notify[]>
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
    feature_status:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    status:boolean;


    @Column({nullable:true,length:255})
    @Expose()
    agent:string;
    @Column({nullable:true})
    @Expose()
    hash:string;
    @Column({nullable:true,length:255})
    @Expose()
    website:string;

    @Column({nullable:true})
    @Expose()
    deposit_token:string;

    @Column({nullable:true})
    @Expose()
    withdraw_token:string;


    @Column({nullable:true})
    @Expose()
    register_token:string;

    @Column({nullable:true})
    @Expose()
    create_by:string;

    @Column({nullable:true})
    @Expose()
    update_by:string;
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
