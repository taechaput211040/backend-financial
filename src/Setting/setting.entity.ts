
import { Expose } from "class-transformer";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Setting {
    constructor(
        partial?: Partial<Setting | Setting[]>
    ) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    @Expose() // npm i --save class-validator class-transformer
    @Index()
    id: string;

    @Column({ type: "timestamptz", default: "NOW()" })
    public created_at: Date;

    @Column({ type: "timestamptz", default: "NOW()", onUpdate: "NOW()" })
    public updated_at: Date;

    @Column({ type: 'float', nullable: true })
    @Expose()
    turnNobonus: number;

    @Column({ default: false, nullable: true })
    @Expose()
    wdautoAll: boolean;


    @Column({ nullable: true })
    @Expose()
    wdlimitTime: number;

    @Column({ default: false })
    @Expose()
    wdlimit: boolean;

    @Column({ nullable: true })
    @Expose()
    wdlimitcredit: number;

    @Column({ default: false })
    @Expose()
    wdwhenoutstanding: boolean;

    @Column({ nullable: true })
    @Expose()
    companyname: string;//agent prefix

    @Column({ nullable: true })
    @Expose()
    companyurl: string;


    @Column({ nullable: true })
    @Expose()
    companynlineurl: string;

    @Column({ nullable: true })
    @Expose()
    companykey: string;

    @Column({ nullable: true })
    @Expose()
    least_wd_credits: number;

    @Column({ type: 'float', nullable: true })
    @Expose()
    wd_auto_amount: number;

    @Column({ nullable: true })
    @Expose()
    member_site_name: string;

    @Column({ nullable: true, length: 1024 })
    @Expose()
    member_logo_url: string;

    @Column({ nullable: true })
    @Expose()
    line_name: string;

    @Column({ nullable: true, length: 1024 })
    token: string;
 
    @Column({ nullable: true }) 
    @Expose() 
    register_link: string;
  
    @Column({ nullable: true })
    @Expose()
    login_link: string;


    // extra column
    @Column({ nullable: true })
    @Expose()
    rico_id: number;

    @Column({ nullable: true })
    @Expose()
    company: string;

    @Column({ nullable: true })
    @Expose()
    agent_username: string;

    @Column({ nullable: true })
    @Expose()
    hash: string;
    @Column({ nullable: true ,default:true})
    @Expose()
    system_status:boolean;

    @Column({ nullable: true })
    @Expose()
    mysql_db_name :string;
    //findone find many load realtion  put option , {relations:['children']}
}
