import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'roles' })
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // e.g. "HR_ADMIN", "HR_VIEWER"
  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
