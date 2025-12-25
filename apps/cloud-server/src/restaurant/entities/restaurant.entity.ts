import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('restaurants')
export class Restaurant {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    name: string;



    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'access_key', nullable: true })
    accessKey: string;
}
