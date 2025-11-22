import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
@Index('IX_users_company_employee', ['companyName', 'employeeNumber'], {
  unique: true,
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  companyName: string;

  @Column({ length: 100 })
  employeeNumber: string;

  @Column({ length: 255 })
  passwordHash: string;

@Column({length: 255, nullable: true })
  refreshTokenHash?: string ;
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;
}
