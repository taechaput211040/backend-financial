import { Expose } from "class-transformer";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity()
@Unique(['username'])
export class MemberTurn {
    constructor(
        partial?: Partial<MemberTurn|MemberTurn[]>
    ) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn("uuid")
    @Expose() // npm i --save class-validator class-transformer
    id: string;

    
  
    // @CreateDateColumn({ type: "datetime", default: () => moment().format()})
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    @Index()
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;


    @Column({nullable:true})
    @Expose()
    @Index()
    username:string;


    @Column({nullable:true,type:'json'})
    @Expose()
    turn:string;


    @Column({nullable:true,type:'float'})
    @Expose()
    limitwithdraw:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    sys_limit_amount:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    min_turn:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    SL:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    LC:number;
   
    @Column({nullable:true,type:'float'})
    @Expose()
    SB:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    ES:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    OT:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    LT:number;

    @Column({nullable:true,type:'float'})
    @Expose()
    FH:number;

    @Column({nullable:true,default:false})
    @Expose()
    editturn:boolean;

    @Column({nullable:true,default:false})
    @Expose()
    wdable:boolean;
}
