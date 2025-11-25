import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('MapaDiarioObra_Headers')
export class MapaDiarioObraHeader {
  @PrimaryColumn({ type: 'nvarchar', length: 30 })
  bostamp: string; // MDOAPPH-xxxxx (GUID-like)

  @Column({ type: 'int' })
  userid: number; // user who created header

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'nvarchar', length: 50 })
  obra: string; // project code

  @Column({ type: 'nvarchar', length: 255 })
  encarregado: string; // employee name

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;

  @Column({ type: 'nvarchar', length: 100 })
companyName: string;

@Column({ type: 'nvarchar', length: 50 })
employeeNumber: string;

}
