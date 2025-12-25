import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('restaurants')
export class Restaurant {
    @PrimaryColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'license_key', unique: true })
    licenseKey: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
