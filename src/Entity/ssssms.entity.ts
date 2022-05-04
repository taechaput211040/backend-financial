import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
export class Sms {
    constructor(
        partial?: Partial<Sms|Sms[]>
    ) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn("uuid")
    @Expose() // npm i --save class-validator class-transformer
    id: string;
 
    // @CreateDateColumn({ type: "datetime", default: () => moment().format()})
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;


    @Column({nullable:true}) 
    @Expose()
    username:string;
    
    @Column({nullable:true}) 
    @Expose()
    password:string;

    @Column({nullable:true})
    @Expose()
    phone:string;

    @Column({nullable:true})
    @Expose()
    count:number;

    @Column({nullable:true,type:'json'})
    @Expose()
    content:string;

    @Column({nullable:true})
    @Expose()
    agent:string;


}
