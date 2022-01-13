import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity()
export class ProviderBO {
    constructor(
        partial?: Partial<ProviderBO|ProviderBO[]>
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
    provider_BO_link:string;

    @Column({nullable:true,length:1024})
    @Expose()
    provider_name:string;

    @Column({nullable:true})
    @Expose()
    provider_code:string;
    @Column({nullable:true})
    @Expose()
    opcode:string;

    @Column({nullable:true})
    @Expose()
    bo_username:string;

    @Column({nullable:true,length:1024})
    @Expose()
    bo_password:string;

    @Column({nullable:true,length:1024})
    @Expose()
    remark:string;

    @Column({nullable:false})
    @Expose()
    vpn:boolean;

   


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
