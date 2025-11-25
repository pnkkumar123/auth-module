import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('MapaDiarioObra_Details')
export class MapaDiarioObraDetail {
  @PrimaryColumn({ type: 'nvarchar', length: 30 })
  bistamp: string; // MDOAPPD-xxxxx

  @Column({ type: 'nvarchar', length: 30 })
  bostamp: string; // FK to header table (string match)

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  empresa: string; // for labor

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  nfunc: string; // employee number

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  codviat: string; // equipment code

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  design: string; // employee name OR equipment name

  @Column({ type: 'float', default: 0 })
  qtt: number; // hours worked
}
