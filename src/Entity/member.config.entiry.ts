import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
export class MemberConfig {
    constructor(
        partial?: Partial<MemberConfig|MemberConfig[]>
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
    @Index()
    username:string;


    @Column({nullable:true})
    @Expose()
    @Index()
    provider:string;


    @Column({nullable:true})
    @Expose()
    @Index()
    provider_username:string;

    @Column({nullable:true,type:'json'})
    @Expose()
    config:string;


   
}
