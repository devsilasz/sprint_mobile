import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { SpecificationCategory } from '../types';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  brand!: string;

  @Column()
  model!: string;

  @Column({ nullable: true })
  version?: string;

  @Column('simple-json')
  specifications!: SpecificationCategory[];
}
