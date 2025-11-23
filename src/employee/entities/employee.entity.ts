import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pe' }) // Maps to the "pe" table
export class EmployeeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'empresa' }) // Maps to empresa column
  companyName: string;

  @Column({ name: 'nfunc' }) // Maps to nfunc column
  employeeNumber: string;

  @Column({ name: 'nome' }) // Maps to nome column
  fullName: string;
}
