import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { VehicleSearchParams } from '../types';

@Entity('search_logs')
export class SearchLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userEmail!: string;

  @Column()
  action!: string;

  @Column('simple-json')
  filters!: VehicleSearchParams;

  @CreateDateColumn()
  createdAt!: Date;
}
