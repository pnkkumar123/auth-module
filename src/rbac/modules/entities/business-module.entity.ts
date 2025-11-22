import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'modules' })
export class BusinessModuleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // e.g. "HR", "FINANCE", "INVENTORY"
  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
