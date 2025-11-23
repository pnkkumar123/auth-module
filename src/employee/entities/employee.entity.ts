import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'employee' }) // MUST match the synced table name
export class EmployeeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column()
  employeeNumber: string;

  @Column()
  fullName: string;

 
}
